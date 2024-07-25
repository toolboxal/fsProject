import * as Sharing from 'expo-sharing'
import * as FileSystem from 'expo-file-system'
import { Alert } from 'react-native'

import { db } from '@/drizzle/db'
import { Person } from '@/drizzle/schema'

const createBackup = async () => {
  try {
    const allRecords = await db.select().from(Person)
    const dataWithoutId = allRecords.map((record) => {
      const { id, ...restOfData } = record
      return restOfData
    })
    const jsonData = JSON.stringify(dataWithoutId)

    const fileUri = FileSystem.documentDirectory + 'rvPalBackup.json'
    await FileSystem.writeAsStringAsync(fileUri, jsonData)

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri)
    } else {
      Alert.alert('Sharing is not available on this device')
    }
  } catch (error) {
    if (error instanceof Error) {
      Alert.alert('Records backup error')
    }
  }
}

export default createBackup
