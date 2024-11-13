import { Colors } from '@/constants/Colors'

import * as DocumentPicker from 'expo-document-picker'
import * as FileSystem from 'expo-file-system'
import { Alert } from 'react-native'
import Toast from 'react-native-root-toast'

import { db } from '@/drizzle/db'
import { Person, TPerson } from '@/drizzle/schema'
import { QueryClient } from '@tanstack/react-query'

type TRestore = Omit<TPerson, 'id'>[]

const restoreRecord = async (queryClient: QueryClient) => {
  const showToast = (name?: string) => {
    Toast.show(`Records restored 👍`, {
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
    } else if (!result.assets[0].name.includes('fspalbackup')) {
      throw new Error(
        'This is not the correct file. File name must be fspalbackup.json'
      )
    }

    const uri = result.assets[0].uri
    const fileContent = await FileSystem.readAsStringAsync(uri)
    const data: TRestore = JSON.parse(fileContent)
    data.forEach(async (item) => {
      const {
        name,
        unit,
        street,
        block,
        remarks,
        contact,
        latitude,
        longitude,
        category,
        date,
        publications,
      } = item

      await db.insert(Person).values({
        name: name,
        block: block,
        unit: unit,
        street: street,
        category: category,
        remarks: remarks,
        contact: contact,
        date: date,
        latitude: latitude,
        longitude: longitude,
        publications: publications,
      })
    })
    queryClient.invalidateQueries({ queryKey: ['persons'] })
    // queryClient.refetchQueries({ queryKey: ['persons'] })
    showToast()
  } catch (error) {
    if (error instanceof Error) {
      Alert.alert(error.message)
    }
  }
}

export default restoreRecord
