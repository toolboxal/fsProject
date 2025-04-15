import * as Sharing from 'expo-sharing'
import * as FileSystem from 'expo-file-system'

import { Alert } from 'react-native'

import { Person, personsToTags, tags, followUp } from '@/drizzle/schema'
import { db } from '@/drizzle/db'
import { eq } from 'drizzle-orm'

const sharePerson = async (personId: number) => {
  try {
    // Fetch person data
    const person = await db.select().from(Person).where(eq(Person.id, personId))
    if (person.length === 0) {
      throw new Error('Person not found')
    }
    const { id, ...dataWithoutId } = person[0]

    // Fetch associated tags
    const personTags = await db
      .select({ tagName: tags.tagName })
      .from(personsToTags)
      .innerJoin(tags, eq(personsToTags.tagId, tags.id))
      .where(eq(personsToTags.personId, personId))

    // Fetch associated follow-ups
    const followUps = await db
      .select()
      .from(followUp)
      .where(eq(followUp.personId, personId))

    const processedFollowUps = followUps.map(({ id, ...rest }) => rest)

    // Construct payload with person data, tags, and follow-ups
    const payload = {
      data: dataWithoutId,
      tags: personTags,
      followUps: processedFollowUps,
      shareId: 'fsPalShare',
    }
    const jsonData = JSON.stringify(payload)

    const fileUri = FileSystem.documentDirectory + `${person[0].name}.json`
    await FileSystem.writeAsStringAsync(fileUri, jsonData)

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri)
    } else {
      alert('Sharing is not available on this device')
    }
  } catch (error) {
    console.error('Error sharing person:', error)
    Alert.alert('Cannot find person to share or error occurred')
  }
}

export default sharePerson
