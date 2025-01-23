import { db } from '@/drizzle/db'
import { Report } from '@/drizzle/schema'
import { lt } from 'drizzle-orm'
import { subYears } from 'date-fns'

export const cleanupOldReports = async () => {
  try {
    const twoYearsAgo = subYears(new Date(), 2)

    // Delete records older than 2 years
    await db.delete(Report).where(lt(Report.date, twoYearsAgo)).execute()

    console.log('Successfully cleaned up old records')
  } catch (error) {
    console.error('Error cleaning up old records:', error)
  }
}
