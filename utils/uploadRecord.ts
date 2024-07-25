import { Colors } from '@/constants/Colors'

import * as DocumentPicker from 'expo-document-picker'
import * as FileSystem from 'expo-file-system'
import { Alert } from 'react-native'
import Toast from 'react-native-root-toast'

import { Person } from '@/drizzle/schema'
import { db } from '@/drizzle/db'

const uploadRecord = async () => {
  const showToast = (name?: string) => {
    Toast.show(`Record ${name} has been upload 👍`, {
      duration: 5000,
      position: 60,
      shadow: true,
      animation: true,
      hideOnPress: true,
      delay: 0,
      backgroundColor: Colors.emerald100,
      textColor: Colors.primary900,
      opacity: 1,
    })
  }

  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/json',
    })
    if (result.assets === null) {
      throw new Error('failed to open file')
    }
    const uri = result.assets[0].uri
    const fileContent = await FileSystem.readAsStringAsync(uri)
    const data = JSON.parse(fileContent)

    await db.insert(Person).values({
      ...data,
    })
    showToast(data.name)
  } catch (error) {
    if (error instanceof Error) {
      Alert.alert(error.message)
    }
  }
}

export default uploadRecord
