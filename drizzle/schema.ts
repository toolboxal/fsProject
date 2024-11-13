import { InferSelectModel } from 'drizzle-orm'
import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core'
import { openDatabaseSync } from 'expo-sqlite/next'

export const Person = sqliteTable('person', {
  id: integer('id').primaryKey(),
  name: text('name'),
  block: text('block').default('NA'),
  unit: text('unit').default('NA'),
  street: text('street').default('NA'),
  contact: text('contact'),
  category: text('category').default('CA'),
  remarks: text('remarks'),
  date: text('date'),
  latitude: real('latitude').default(0),
  longitude: real('longitude').default(0),
  publications: text('publications').default(''),
})

export type TPerson = InferSelectModel<typeof Person>
