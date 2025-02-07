import { Colors } from '@/constants/Colors'

import * as DocumentPicker from 'expo-document-picker'
import * as FileSystem from 'expo-file-system'
import { Alert } from 'react-native'
import { toast } from 'sonner-native'

import { db } from '@/drizzle/db'
import { Person, TPerson, Report, TReport } from '@/drizzle/schema'
import { QueryClient } from '@tanstack/react-query'
import { useTranslations } from '@/app/_layout'

type TRestorePerson = Omit<TPerson, 'id'>
type TRestoreReport = Omit<TReport, 'id'>

type BackupData = {
  person: TRestorePerson[]
  report: TRestoreReport[]
  backupDate: string
  backupID: string
}

const restoreRecord = async (queryClient: QueryClient) => {
  const i18n = useTranslations()
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/json',
    })
    if (result.assets === null) {
      throw new Error('Failed to open file')
    }

    const uri = result.assets[0].uri
    const fileContent = await FileSystem.readAsStringAsync(uri)
    const backupData: BackupData = JSON.parse(fileContent)

    // Validate file uploaded is genuine
    if (backupData.backupID !== 'fspalbackup') {
      throw new Error('Invalid file format')
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

    toast.success(i18n.t('restoreBackupFunc.toastSuccess'))
  } catch (error) {
    if (error instanceof Error) {
      Alert.alert('Restore Error', error.message)
    }
  }
}

export default restoreRecord
