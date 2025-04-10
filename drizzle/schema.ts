import { InferSelectModel, sql } from 'drizzle-orm'
import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core'

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
  interest: text('interest', {
    enum: ['cool', 'normal', 'interested', 'keen'],
  }).default('normal'),
})

export type TPerson = InferSelectModel<typeof Person>

export const Report = sqliteTable('report', {
  id: integer('id').primaryKey(),
  date: integer('date', { mode: 'timestamp' })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  hrs: real('hrs').default(0),
  bs: integer('bs').default(0),
  created_at: integer('created_at', { mode: 'timestamp' })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
})

export type TReport = InferSelectModel<typeof Report>
