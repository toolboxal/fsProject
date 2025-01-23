import { db } from '@/drizzle/db'
import { Report } from '@/drizzle/schema'

const deleteAllRecords = async () => {
  try {
    await db.delete(Report).execute()
  } catch (error) {
    console.error('deleteAllReports error', error)
  }
}
export default deleteAllRecords
