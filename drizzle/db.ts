import { drizzle } from 'drizzle-orm/expo-sqlite'
import * as SQLite from 'expo-sqlite'
import * as schema from './schema'

export const expoDb = SQLite.openDatabaseSync('app.db', {
  enableChangeListener: true,
})
export const db = drizzle(expoDb, { schema, logger: true })
