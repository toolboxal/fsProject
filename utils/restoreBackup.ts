import { Colors } from '@/constants/Colors'

import * as DocumentPicker from 'expo-document-picker'
import * as FileSystem from 'expo-file-system'
import { Alert } from 'react-native'
import { toast } from 'sonner-native'

import { db } from '@/drizzle/db'
import { Person, TPerson, Report, TReport } from '@/drizzle/schema'
import { QueryClient } from '@tanstack/react-query'

type TRestorePerson = Omit<TPerson, 'id'>
type TRestoreReport = Omit<TReport, 'id'>

interface BackupData {
  person: TRestorePerson[]
  report: TRestoreReport[]
  backupDate: string
}

const restoreRecord = async (queryClient: QueryClient) => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/json',
    })
    if (result.assets === null) {
      throw new Error('Failed to open file')
    } else if (!result.assets[0].name.includes('fspal_backup')) {
      throw new Error(
        'This is not the correct file. File name must be fspal_backup.json'
      )
    }

    const uri = result.assets[0].uri
    const fileContent = await FileSystem.readAsStringAsync(uri)
    const backupData: BackupData = JSON.parse(fileContent)

    // Validate backup data structure
    if (
      !backupData.person ||
      !backupData.report ||
      !Array.isArray(backupData.person) ||
      !Array.isArray(backupData.report)
    ) {
      throw new Error('Invalid backup file format')
    }

    // Delete all existing data
    await db.delete(Person)
    await db.delete(Report)

    // Restore person records
    for (const personRecord of backupData.person) {
      await db.insert(Person).values(personRecord)
    }

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

    // Invalidate both queries to refresh the UI
    queryClient.invalidateQueries({ queryKey: ['persons'] })
    queryClient.invalidateQueries({ queryKey: ['reports'] })

    toast.success('Data restored successfully 👌')
  } catch (error) {
    if (error instanceof Error) {
      Alert.alert('Restore Error', error.message)
    }
  }
}

export default restoreRecord
