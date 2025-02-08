import * as Sharing from 'expo-sharing'
import * as FileSystem from 'expo-file-system'
import { Alert } from 'react-native'

import { db } from '@/drizzle/db'
import { Person } from '@/drizzle/schema'
import { Document, HeadingLevel, Packer, Paragraph, TextRun } from 'docx'

const createDocx = async () => {
  try {
    const allRecords = await db.select().from(Person)
    const dataWithoutId = allRecords.map((record) => {
      const { id, ...restOfData } = record
      return restOfData
    })
    // const jsonData = JSON.stringify(dataWithoutId)
    // Create document
    const doc = new Document({
      title: 'FsPal Records',
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: 'FsPalRecords',
                  font: 'Helvetica',
                  size: 48,
                  bold: true,
                  color: '#022c22',
                }),
              ],
              heading: HeadingLevel.HEADING_1,
            }),
            ...dataWithoutId.map((record) => {
              const personName = new TextRun({
                text: record.name || '-',
                font: 'Helvetica',
                size: 24,
                bold: true,
                break: 1,
              })
              const category = new TextRun({
                text: record.category || '-',
                font: 'Helvetica',
                size: 24,
                bold: true,
                break: 1,
              })
              const block = new TextRun({
                text: record.block || '-',
                font: 'Helvetica',
                size: 20,
                bold: true,
                italics: true,
                color: '#022c22',
                break: 1,
              })
              const unit = new TextRun({
                text: '#' + record.unit || '-',
                font: 'Helvetica',
                size: 20,
                italics: true,
                color: '#022c22',
                break: 1,
              })
              const street = new TextRun({
                text: record.street || '-',
                font: 'Helvetica',
                size: 20,
                italics: true,
                break: 1,
                color: '#022c22',
              })
              const contact = new TextRun({
                text: 'contact: ' + record.contact || '-',
                font: 'Helvetica',
                size: 20,
                break: 1,
              })
              const date = new TextRun({
                text: record.date || '-',
                font: 'Helvetica',
                size: 20,
                break: 1,
              })
              const publications = new TextRun({
                text: 'Publications used: ' + record.publications || '-',
                font: 'Helvetica',
                size: 20,
                bold: true,
                break: 1,
              })
              const remarks = new TextRun({
                text: record.remarks || '-',
                font: 'Helvetica',
                size: 20,
                bold: true,
                break: 1,
              })
              return new Paragraph({
                children: [
                  personName,
                  category,
                  block,
                  unit,
                  street,
                  contact,
                  date,
                  publications,
                  remarks,
                ],
              })
            }),
          ],
        },
      ],
    })

    // Generate document
    const docBase64 = await Packer.toBase64String(doc)
    const fileUri = FileSystem.documentDirectory + 'fsPalDocument.docx'
    await FileSystem.writeAsStringAsync(fileUri, docBase64, {
      encoding: FileSystem.EncodingType.Base64,
    })

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri)
    } else {
      Alert.alert('Sharing is not available on this device')
    }
  } catch (error) {
    if (error instanceof Error) {
      Alert.alert('Docx export error')
      console.error(error)
    }
  }
}

export default createDocx
