import { drizzle } from 'drizzle-orm/expo-sqlite'
import * as SQLite from 'expo-sqlite'

const expoDb = SQLite.openDatabaseSync('app.db', { enableChangeListener: true })
export const db = drizzle(expoDb)
