import * as DocumentPicker from 'expo-document-picker'
import * as FileSystem from 'expo-file-system'
import { Alert } from 'react-native'
import { toast } from 'sonner-native'
import { z } from 'zod'

import { db } from '@/drizzle/db'
import {
  Person,
  Report,
  tags,
  personsToTags,
  followUp,
  markerAnnotation,
} from '@/drizzle/schema'
import { QueryClient } from '@tanstack/react-query'
import { useTranslations } from '@/app/_layout'
import { eq } from 'drizzle-orm'

// Define the expected structure of the backup data
const backupDataSchema = z.object({
  person: z.array(z.any()),
  report: z.array(z.any()),
  markerAnnotation: z.array(z.any()).optional(), // Make it optional for backward compatibility
  backupDate: z.string(),
  backupID: z.literal('fspalbackup'),
})

type BackupData = z.infer<typeof backupDataSchema>

const restoreBackupFunc = async (queryClient: QueryClient) => {
  try {
    // Pick the backup file
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/json',
    })

    if (result.canceled) {
      toast.error('restoration cancelled')
      return
    }

    const fileUri = result.assets[0].uri
    const fileContent = await FileSystem.readAsStringAsync(fileUri)
    const backupData: BackupData = JSON.parse(fileContent)

    // Log the entire backup data structure for debugging
    console.log('Backup Data Structure:', JSON.stringify(backupData, null, 2))

    // Validate file uploaded is genuine
    if (backupData.backupID !== 'fspalbackup') {
      throw new Error('restoration failed: invalid backup file')
    }

    // Delete all existing data
    await db.delete(Person)
    await db.delete(Report)
    await db.delete(personsToTags)
    await db.delete(tags)
    await db.delete(followUp)
    await db.delete(markerAnnotation)

    // Restore report records
    for (const reportRecord of backupData.report) {
      // Convert date strings back to Date objects
      const processedRecord = {
        ...reportRecord,
        date: reportRecord.date ? new Date(reportRecord.date) : new Date(),
        created_at: reportRecord.created_at
          ? new Date(reportRecord.created_at)
          : new Date(),
      }
      await db.insert(Report).values(processedRecord)
    }

    // Restore person records and their associated data
    for (const personRecord of backupData.person) {
      // Extract tags and followUps from the person data
      const {
        tags: tagNames = [],
        followUp: followUpData = [],
        ...personData
      } = personRecord

      console.log('Processing person data for insertion:', personData)
      // Insert the person and get the new ID
      try {
        const [insertedPerson] = await db
          .insert(Person)
          .values(personData)
          .returning({ id: Person.id })
        const personId = insertedPerson.id
        console.log('Successfully inserted person with ID:', personId)

        // Restore follow-ups linked to this person
        for (const followUpItem of followUpData) {
          console.log(
            'Processing follow-up data for person ID:',
            personId,
            'Follow-up data:',
            followUpItem
          )
          try {
            const processedFollowUpItem = {
              ...followUpItem,
              personId: personId,
              date:
                followUpItem.date &&
                (typeof followUpItem.date === 'string' ||
                  typeof followUpItem.date === 'number')
                  ? new Date(followUpItem.date)
                  : new Date(),
            }
            await db.insert(followUp).values(processedFollowUpItem)
            console.log(
              'Successfully inserted follow-up for person ID:',
              personId
            )
          } catch (followUpError) {
            console.error(
              'Error inserting follow-up for person ID:',
              personId,
              'Data:',
              followUpItem,
              'Error:',
              followUpError
            )
          }
        }

        // Restore tags and link them to this person
        for (const tagName of tagNames) {
          console.log('Processing tag:', tagName, 'for person ID:', personId)
          // Check if tag already exists
          let tagResult = await db
            .select()
            .from(tags)
            .where(eq(tags.tagName, tagName))
            .limit(1)
          let tagId: number
          if (tagResult.length === 0) {
            try {
              const insertedTag = await db
                .insert(tags)
                .values({ tagName })
                .returning({ id: tags.id })
              tagId = insertedTag[0].id
              console.log(
                'Successfully inserted new tag:',
                tagName,
                'with ID:',
                tagId
              )
            } catch (tagError) {
              console.error('Error inserting tag:', tagName, 'Error:', tagError)
              continue
            }
          } else {
            tagId = tagResult[0].id
            console.log('Tag already exists:', tagName, 'with ID:', tagId)
          }

          // Link tag to person via personsToTags
          try {
            await db.insert(personsToTags).values({ personId, tagId })
            console.log(
              'Successfully linked tag ID:',
              tagId,
              'to person ID:',
              personId
            )
          } catch (linkError) {
            console.error(
              'Error linking tag ID:',
              tagId,
              'to person ID:',
              personId,
              'Error:',
              linkError
            )
          }
        }
      } catch (personError) {
        console.error(
          'Error inserting person record:',
          personData,
          'Error:',
          personError
        )
        throw new Error(
          `Failed to insert person record: ${
            personError instanceof Error ? personError.message : 'Unknown error'
          }`
        )
      }
    }

    // Restore marker annotations if they exist in the backup
    if (
      backupData.markerAnnotation &&
      Array.isArray(backupData.markerAnnotation)
    ) {
      for (const annotationRecord of backupData.markerAnnotation) {
        try {
          await db.insert(markerAnnotation).values(annotationRecord)
          console.log('Successfully inserted marker annotation')
        } catch (annotationError) {
          console.error('Error inserting marker annotation:', annotationError)
        }
      }
    }

    // Invalidate queries to refresh the UI
    queryClient.invalidateQueries({ queryKey: ['persons'] })
    queryClient.invalidateQueries({ queryKey: ['reports'] })
    queryClient.invalidateQueries({ queryKey: ['tags'] })
    queryClient.invalidateQueries({ queryKey: ['markerAnnotation'] })

    toast.success('successfully restored')
  } catch (error) {
    if (error instanceof Error) {
      Alert.alert('Restoration Error', error.message)
      console.error('Restoration Error:', error)
    } else {
      Alert.alert(
        'Restoration Error',
        'An unknown error occurred during restoration.'
      )
      console.error('Restoration Error: Unknown error', error)
    }
  }
}

export default restoreBackupFunc
