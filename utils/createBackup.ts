import * as Sharing from 'expo-sharing'
import * as FileSystem from 'expo-file-system'
import { Alert } from 'react-native'

import { db } from '@/drizzle/db'
import { Person, Report, TPersonWithTagsAndFollowUps, markerAnnotation, TMarkerAnnotation, reminders } from '@/drizzle/schema'

const createBackup = async () => {
  try {
    // Fetch all records from both tables
    const personRecords = (await db.query.Person.findMany({
      with: {
        personsToTags: {
          with: {
            tag: true,
          },
        },
        followUp: true,
      },
    })) as TPersonWithTagsAndFollowUps[]

    const reportRecords = await db.select().from(Report)
    
    // Fetch all marker annotations
    const markerAnnotationRecords = await db.select().from(markerAnnotation)
    
    // Fetch all reminders
    const reminderRecords = await db.select().from(reminders)

    // Remove IDs from person records and related data for backup
    const personDataWithoutId = personRecords.map((record) => {
      const { id, personsToTags, ...restOfPersonData } = record
      // Extract only tag names for backup
      const tagNames = personsToTags?.map((pt) => pt.tag.tagName)
      // Process followUp to exclude id and personId, as IDs are database-specific
      // Relationship is preserved by nesting followUp under the correct person in the backup
      const processedFollowUps = restOfPersonData.followUp?.map((fu) => {
        const { id, personId, ...restOfFollowUp } = fu
        return restOfFollowUp
      })
      // Return person data with tag names instead of full relational data
      return {
        ...restOfPersonData,
        tags: tagNames,
        followUp: processedFollowUps,
      }
    })

    // Remove IDs from report records
    const reportDataWithoutId = reportRecords.map((record) => {
      const { id, ...restOfData } = record
      return restOfData
    })
    
    // Remove IDs from marker annotation records
    const markerAnnotationDataWithoutId = markerAnnotationRecords.map((record) => {
      const { id, ...restOfData } = record
      return restOfData
    })
    
    // Remove IDs from reminder records
    const reminderDataWithoutId = reminderRecords.map((record) => {
      const { id, ...restOfData } = record
      return restOfData
    })

    // Create a structured backup object
    const backupData = {
      person: personDataWithoutId,
      report: reportDataWithoutId,
      markerAnnotation: markerAnnotationDataWithoutId,
      reminders: reminderDataWithoutId,
      backupDate: new Date().toISOString(),
      backupID: 'fspalbackup',
    }

    const jsonData = JSON.stringify(backupData, null, 2)
    const fileUri = FileSystem.documentDirectory + 'fspal_backup.json'
    await FileSystem.writeAsStringAsync(fileUri, jsonData)

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri)
    } else {
      Alert.alert('Sharing is not available on this device')
    }
  } catch (error) {
    if (error instanceof Error) {
      Alert.alert('Backup error', 'Failed to backup records')
    }
  }
}

export default createBackup
