import type { Config } from 'drizzle-kit'
export default {
  schema: './drizzle/schema.ts',
  out: './drizzle/migrations',
  dialect: 'sqlite',
  driver: 'expo', // <--- very important
  verbose: true,
  strict: true,
} satisfies Config
