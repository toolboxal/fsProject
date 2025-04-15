import { InferSelectModel, relations, sql } from 'drizzle-orm'
import { primaryKey } from 'drizzle-orm/sqlite-core'
import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'

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
  status: text('status', {
    enum: ['irregular', 'frequent', 'committed'],
  }).default('frequent'),
})

export const personsRelations = relations(Person, ({ many }) => ({
  personsToTags: many(personsToTags),
}))

export const tags = sqliteTable('tags', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tagName: text('tagname').notNull().unique(),
})

export const tagsRelations = relations(tags, ({ many }) => ({
  personsToTags: many(personsToTags),
}))

export const personsToTags = sqliteTable(
  'persons_to_tags',
  {
    personId: integer('person_id')
      .notNull()
      .references(() => Person.id, { onDelete: 'cascade' }),
    tagId: integer('tag_id')
      .notNull()
      .references(() => tags.id, { onDelete: 'restrict' }),
  },
  (t) => [primaryKey({ columns: [t.personId, t.tagId] })]
)

export const personsToTagsRelations = relations(personsToTags, ({ one }) => ({
  person: one(Person, {
    fields: [personsToTags.personId],
    references: [Person.id],
  }),
  tag: one(tags, {
    fields: [personsToTags.tagId],
    references: [tags.id],
  }),
}))

export const followUp = sqliteTable('follow_up', {
  id: integer('id').primaryKey(),
  personId: integer('person_id')
    .notNull()
    .references(() => Person.id, { onDelete: 'cascade' }),
  date: integer('date', { mode: 'timestamp' })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  notes: text('notes').notNull(),
})

export const followUpRelations = relations(followUp, ({ one }) => ({
  person: one(Person, {
    fields: [followUp.personId],
    references: [Person.id],
  }),
}))

export const personFollowUpRelations = relations(Person, ({ many }) => ({
  followUp: many(followUp),
}))

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

export type TPerson = InferSelectModel<typeof Person>

export type TPersonWithTags = InferSelectModel<typeof Person> & {
  personsToTags: Array<{
    tag: InferSelectModel<typeof tags>
  }>
}

export type TReport = InferSelectModel<typeof Report>

export const tagsSelectSchema = createSelectSchema(tags)
export type TTags = z.infer<typeof tagsSelectSchema>

export const followUpInsertSchema = createInsertSchema(followUp)
export type TFollowUp = z.infer<typeof followUpInsertSchema>

export const personsToTagsSelectSchema = createSelectSchema(personsToTags)
export type TPersonsToTags = z.infer<typeof personsToTagsSelectSchema>
