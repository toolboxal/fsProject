import * as Sharing from 'expo-sharing'
import * as FileSystem from 'expo-file-system'
import { Alert } from 'react-native'

import { db } from '@/drizzle/db'
import { Person, Report } from '@/drizzle/schema'

const createBackup = async () => {
  try {
    // Fetch all records from both tables
    const personRecords = await db.select().from(Person)
    const reportRecords = await db.select().from(Report)

    // Remove IDs from person records
    const personDataWithoutId = personRecords.map((record) => {
      const { id, ...restOfData } = record
      return restOfData
    })

    // Remove IDs from report records
    const reportDataWithoutId = reportRecords.map((record) => {
      const { id, ...restOfData } = record
      return restOfData
    })

    // Create a structured backup object
    const backupData = {
      person: personDataWithoutId,
      report: reportDataWithoutId,
      backupDate: new Date().toISOString(),
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
