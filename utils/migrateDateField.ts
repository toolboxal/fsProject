import { db } from '@/drizzle/db'
import { Person } from '@/drizzle/schema'
import { isNull, isNotNull, sql } from 'drizzle-orm'

/**
 * One-time migration to convert old text date field to proper timestamp
 * Handles formats: '03/03/25', '05/23/2025', 'MM/DD/YY', 'MM/DD/YYYY'
 */
export async function migrateDateField() {
  try {
    console.log('Starting date field migration...')

    // Get all persons with old date field but no initialVisit
    const personsToMigrate = await db
      .select()
      .from(Person)
      .where(sql`${Person.date} IS NOT NULL AND ${Person.initialVisit} IS NULL`)

    console.log(`Found ${personsToMigrate.length} records to migrate`)

    let successCount = 0
    let errorCount = 0

    for (const person of personsToMigrate) {
      try {
        if (!person.date) continue

        // Parse the date string (handles MM/DD/YY and MM/DD/YYYY)
        const timestamp = parseDateString(person.date)

        if (timestamp) {
          await db
            .update(Person)
            .set({ initialVisit: new Date(timestamp) })
            .where(sql`${Person.id} = ${person.id}`)

          successCount++
          console.log(
            `✓ Migrated person ${person.id}: "${person.date}" -> ${new Date(timestamp).toISOString()}`
          )
        } else {
          errorCount++
          console.warn(
            `✗ Could not parse date for person ${person.id}: "${person.date}"`
          )
        }
      } catch (error) {
        errorCount++
        console.error(`Error migrating person ${person.id}:`, error)
      }
    }

    console.log(
      `Migration complete: ${successCount} successful, ${errorCount} errors`
    )

    return { successCount, errorCount, total: personsToMigrate.length }
  } catch (error) {
    console.error('Date migration failed:', error)
    throw error
  }
}

/**
 * Parse date strings in formats: DD/MM/YY, DD/MM/YYYY, MM/DD/YY, or MM/DD/YYYY
 * Auto-detects format and converts to proper timestamp
 * Returns timestamp in milliseconds or null if invalid
 */
function parseDateString(dateStr: string): number | null {
  if (!dateStr || typeof dateStr !== 'string') return null

  // Remove whitespace
  const cleaned = dateStr.trim()

  // Match date pattern
  const match = cleaned.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/)

  if (!match) return null

  const [, firstNum, secondNum, yearStr] = match
  const first = parseInt(firstNum, 10)
  const second = parseInt(secondNum, 10)
  let year = parseInt(yearStr, 10)

  // Convert 2-digit year to 4-digit
  if (year < 100) {
    // Assume 20xx for years 00-49, 19xx for years 50-99
    year += year < 50 ? 2000 : 1900
  }

  // Detect format: if first number > 12, it must be DD/MM (day first)
  // if second number > 12, it must be MM/DD (month first)
  let day: number, month: number

  if (first > 12) {
    // Must be DD/MM format (e.g., 25/03/2025)
    day = first
    month = second
  } else if (second > 12) {
    // Must be MM/DD format (e.g., 03/25/2025) - convert to DD/MM
    day = second
    month = first
  } else {
    // Ambiguous (both <= 12), assume DD/MM (international standard)
    day = first
    month = second
  }

  // Validate ranges
  if (month < 1 || month > 12) return null
  if (day < 1 || day > 31) return null
  if (year < 1900 || year > 2100) return null

  // Create date object (month is 0-indexed in JS Date)
  const date = new Date(year, month - 1, day)

  // Verify the date is valid (handles invalid dates like Feb 31)
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null
  }

  return date.getTime()
}

/**
 * Check migration status
 */
export async function checkMigrationStatus() {
  const totalPersons = await db.select({ count: sql`count(*)` }).from(Person)

  const migratedPersons = await db
    .select({ count: sql`count(*)` })
    .from(Person)
    .where(isNotNull(Person.initialVisit))

  const pendingPersons = await db
    .select({ count: sql`count(*)` })
    .from(Person)
    .where(sql`${Person.date} IS NOT NULL AND ${Person.initialVisit} IS NULL`)

  return {
    total: Number(totalPersons[0].count),
    migrated: Number(migratedPersons[0].count),
    pending: Number(pendingPersons[0].count),
  }
}
