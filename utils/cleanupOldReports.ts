import { db } from '@/drizzle/db'
import { Report } from '@/drizzle/schema'
import { lt } from 'drizzle-orm'
import { subYears } from 'date-fns'

export const cleanupOldReports = async () => {
  try {
    const threeYearsAgo = subYears(new Date(), 3)

    // Delete records older than 2 years
    await db.delete(Report).where(lt(Report.date, threeYearsAgo)).execute()

    console.log('Successfully cleaned up old records')
  } catch (error) {
    console.error('Error cleaning up old records:', error)
  }
}
