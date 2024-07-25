import { drizzle } from 'drizzle-orm/expo-sqlite'
import { openDatabaseSync } from 'expo-sqlite/next'

const expoDb = openDatabaseSync('app.db', { enableChangeListener: true })
export const db = drizzle(expoDb)
