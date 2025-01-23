import * as DocumentPicker from 'expo-document-picker'
import * as FileSystem from 'expo-file-system'
import { Alert } from 'react-native'
import { toast } from 'sonner-native'
import { Person } from '@/drizzle/schema'
import { db } from '@/drizzle/db'
import { QueryClient } from '@tanstack/react-query'

const uploadRecord = async (queryClient: QueryClient) => {
  const showToast = (name?: string) => {
    toast.success(`Record ${name} has been upload 👍`)
  }

  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/json',
    })
    if (result.assets === null) {
      throw new Error('failed to open file')
    } else if (result.assets[0].name.includes('fspalbackup')) {
      throw new Error(
        "Use 'Restore backup' function for fspalbackup.json file."
      )
    }
    const uri = result.assets[0].uri
    const fileContent = await FileSystem.readAsStringAsync(uri)
    const data = JSON.parse(fileContent)

    await db.insert(Person).values({
      ...data,
    })
    queryClient.invalidateQueries({ queryKey: ['persons'] })
    showToast(data.name)
  } catch (error) {
    if (error instanceof Error) {
      Alert.alert(error.message)
    }
  }
}

export default uploadRecord
