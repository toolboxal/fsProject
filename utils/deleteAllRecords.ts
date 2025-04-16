import { db } from '@/drizzle/db'
import { Person, followUp, tags, personsToTags } from '@/drizzle/schema'

const deleteAllRecords = async () => {
  try {
    // Delete all records from the Person table
    await db.delete(Person).execute()
    // Delete all records from the followUp table
    await db.delete(followUp).execute()
    // Delete all records from the tags table
    await db.delete(tags).execute()
    // Delete all records from the personsToTags join table
    await db.delete(personsToTags).execute()
    console.log(
      'Successfully deleted all records from Person, followUp, tags, and personsToTags tables.'
    )
  } catch (error) {
    console.error('deleteAllRecords error', error)
  }
}
export default deleteAllRecords
