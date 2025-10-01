import { db } from '@/drizzle/db'
import { Person } from '@/drizzle/schema'
import { sql } from 'drizzle-orm'
import AsyncStorage from '@react-native-async-storage/async-storage'

const MIGRATION_KEY = 'date_migration_v1_completed'

/**
 * Automatically migrate old date formats to ISO format
 * This runs once on app startup after the user updates
 */
export async function migrateOldDates() {
  try {
    // Check if migration already completed
    const completed = await AsyncStorage.getItem(MIGRATION_KEY)
    if (completed === 'true') {
      console.log('Date migration already completed, skipping')
      return { alreadyCompleted: true, successCount: 0, errorCount: 0 }
    }

    console.log('Starting automatic date migration...')

    const persons = await db.select().from(Person)
    
    let successCount = 0
    let errorCount = 0
    let skippedCount = 0

    for (const person of persons) {
      try {
        const dateStr = person.date as any
        
        // Skip if no date
        if (!dateStr || dateStr === '') {
          skippedCount++
          continue
        }

        // Check if already in ISO format (contains 'T' and 'Z')
        if (typeof dateStr === 'string' && dateStr.includes('T') && dateStr.includes('Z')) {
          skippedCount++
          continue
        }

        // Parse old format (D/M/YYYY or DD/MM/YY)
        const parts = String(dateStr).split('/')
        if (parts.length !== 3) {
          console.log(`Person ${person.id}: Invalid date format: ${dateStr}`)
          errorCount++
          continue
        }

        let day = parseInt(parts[0])
        let month = parseInt(parts[1])
        let year = parseInt(parts[2])

        // Handle 2-digit years
        if (year < 100) {
          year += 2000
        }

        // Create Date object
        const dateObj = new Date(year, month - 1, day)
        
        // Validate
        if (isNaN(dateObj.getTime())) {
          console.log(`Person ${person.id}: Invalid date: ${dateStr}`)
          errorCount++
          continue
        }

        // Update the person with ISO string
        await db.update(Person)
          .set({ date: dateObj.toISOString() })
          .where(sql`${Person.id} = ${person.id}`)

        successCount++
      } catch (error) {
        console.error(`Error processing person ${person.id}:`, error)
        errorCount++
      }
    }

    // Mark migration as completed
    await AsyncStorage.setItem(MIGRATION_KEY, 'true')

    console.log(`✅ Date migration completed:`)
    console.log(`   - Converted: ${successCount}`)
    console.log(`   - Skipped: ${skippedCount}`)
    console.log(`   - Failed: ${errorCount}`)

    return { alreadyCompleted: false, successCount, errorCount, skippedCount }
  } catch (error) {
    console.error('Error in automatic date migration:', error)
    throw error
  }
}

/**
 * Reset the migration flag (for testing/debugging)
 */
export async function resetDateMigrationFlag() {
  await AsyncStorage.removeItem(MIGRATION_KEY)
  console.log('Date migration flag reset - migration will run on next app restart')
}

/**
 * Force run the migration even if it was already completed
 */
export async function forceRunMigration() {
  await AsyncStorage.removeItem(MIGRATION_KEY)
  return await migrateOldDates()
}
