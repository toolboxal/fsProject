import * as DocumentPicker from 'expo-document-picker'
import * as FileSystem from 'expo-file-system'
import { Alert } from 'react-native'
import { toast } from 'sonner-native'
import {
  Person,
  followUp,
  tags,
  personsToTags,
  TPerson,
} from '@/drizzle/schema'
import { db } from '@/drizzle/db'
import { QueryClient } from '@tanstack/react-query'
import { useTranslations } from '@/app/_layout'
import { eq } from 'drizzle-orm'
import { I18n } from 'i18n-js'

type TSharedPerson = Omit<TPerson, 'id'>

type TRestoreFile = {
  data: TSharedPerson
  shareId: string
  followUps?: any[]
  tags?: any[]
}

const uploadRecord = async (
  queryClient: QueryClient,
  lang: string,
  i18n: I18n
) => {
  try {
    console.log('inside document picker')
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/json',
    })
    if (result.assets === null) {
      throw new Error('failed to open file')
    }

    const uri = result.assets[0].uri
    const fileContent = await FileSystem.readAsStringAsync(uri)
    const data: TRestoreFile = JSON.parse(fileContent)

    // Validate
    if (data.shareId !== 'fsPalShare') {
      throw new Error('Invalid file or Sharer has to update his app first')
    }

    // Insert the person record and get the new ID
    console.log('Restoring person data:', data.data)
    const [insertedPerson] = await db
      .insert(Person)
      .values(data.data)
      .returning({ id: Person.id })
    const personId = insertedPerson.id
    console.log('Successfully inserted person with ID:', personId)

    // Restore follow-ups if they exist in the data
    if (data.followUps && Array.isArray(data.followUps)) {
      for (const followUpItem of data.followUps) {
        console.log(
          'Processing follow-up for person ID:',
          personId,
          'Data:',
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
    }

    // Restore tags if they exist in the data
    if (data.tags && Array.isArray(data.tags)) {
      for (const tagItem of data.tags) {
        const tagName = tagItem.tagName
        if (!tagName) continue
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
    }

    queryClient.invalidateQueries({ queryKey: ['persons'] })
    queryClient.invalidateQueries({ queryKey: ['tags'] })

    toast.success(
      lang === 'en'
        ? `Record ${data.data.name} has been uploaded 👍`
        : i18n.t('uploadRecordFunc.toastSuccess')
    )
  } catch (error) {
    if (error instanceof Error) {
      Alert.alert(error.message)
    }
  }
}

export default uploadRecord
