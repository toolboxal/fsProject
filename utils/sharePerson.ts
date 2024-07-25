import * as Sharing from 'expo-sharing'
import * as FileSystem from 'expo-file-system'

import { Alert } from 'react-native'


import { Person } from '@/drizzle/schema'
import { db } from '@/drizzle/db'
import { eq } from 'drizzle-orm'

const sharePerson = async (personId: number) => {
  try {
 
    const person = await db.select().from(Person).where(eq(Person.id, personId))
    const { id, ...dataWithoutId } = person[0]
    const jsonData = JSON.stringify(dataWithoutId)

    const fileUri = FileSystem.documentDirectory + `${person[0].name}.json`
    await FileSystem.writeAsStringAsync(fileUri, jsonData)

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri)
    } else {
      alert('Sharing is not available on this device')
    }
  } catch (error) {
    if (error instanceof Error) {
      Alert.alert('cannot find person to share')
    }
  }
}

export default sharePerson
