import * as DocumentPicker from 'expo-document-picker'
import * as FileSystem from 'expo-file-system'
import { Alert } from 'react-native'
import { toast } from 'sonner-native'
import { Person, TPerson } from '@/drizzle/schema'
import { db } from '@/drizzle/db'
import { QueryClient } from '@tanstack/react-query'

type TSharedPerson = Omit<TPerson, 'id'>

type TRestoreFile = {
  data: TSharedPerson
  shareId: string
}

const uploadRecord = async (queryClient: QueryClient) => {
  try {
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

    await db.insert(Person).values({
      ...data.data,
    })
    queryClient.invalidateQueries({ queryKey: ['persons'] })
    toast.success(`Record ${data.data.name} has been upload 👍`)
  } catch (error) {
    if (error instanceof Error) {
      Alert.alert(error.message)
    }
  }
}

export default uploadRecord
