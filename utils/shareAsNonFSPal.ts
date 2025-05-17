import * as Sharing from 'expo-sharing'
import * as FileSystem from 'expo-file-system'
import { Alert } from 'react-native'
import { format } from 'date-fns'

import { db } from '@/drizzle/db'
import {
  Person,
  followUp,
  type TPerson,
  type TFollowUp,
} from '@/drizzle/schema'
import { eq } from 'drizzle-orm'
import { Document, HeadingLevel, Packer, Paragraph, TextRun } from 'docx'

const shareAsNonFSPal = async (personId: number) => {
  try {
    const allRecords = await db
      .select()
      .from(Person)
      .where(eq(Person.id, personId))
      .leftJoin(followUp, eq(Person.id, followUp.personId))
    // Group followups by person
    interface PersonWithFollowups extends TPerson {
      followups: TFollowUp[]
    }

    const personData = allRecords.reduce<Record<number, PersonWithFollowups>>(
      (acc, record) => {
        const personId = record.person.id
        if (!acc[personId]) {
          acc[personId] = {
            ...record.person,
            followups: [],
          }
        }
        if (record.follow_up) {
          acc[personId].followups.push(record.follow_up)
        }
        return acc
      },
      {}
    )

    const dataWithoutId = Object.values(personData) as PersonWithFollowups[]
    // const jsonData = JSON.stringify(dataWithoutId)
    // Create document
    const doc = new Document({
      title: `${allRecords[0].person.name}`,
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: 'Shared Record',
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
                  ...record.followups.map((followup) => {
                    return new TextRun({
                      text: `Follow-up (${format(
                        new Date(Number(followup.date)),
                        'dd MMM yyyy'
                      )}): ${followup.notes}`,
                      font: 'Helvetica',
                      size: 20,
                      bold: true,
                      break: 1,
                      color: '#0066cc',
                    })
                  }),
                ],
              })
            }),
          ],
        },
      ],
    })

    // Generate document
    const docBase64 = await Packer.toBase64String(doc)
    const fileUri =
      FileSystem.documentDirectory + `${allRecords[0].person.name}.docx`
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

export default shareAsNonFSPal
