import { db } from '@/drizzle/db'
import { Person } from '@/drizzle/schema'

const deleteAllRecords = async () => {
  try {
    await db.delete(Person).execute()
  } catch (error) {
    console.error('deleteAllRecords error', error)
  }
}
export default deleteAllRecords
