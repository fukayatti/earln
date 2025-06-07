import 'dotenv/config'
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './src/lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url:
      process.env.NODE_ENV === 'production'
        ? process.env.DATABASE_URL!
        : process.env.DIRECT_URL!,
  },
  verbose: true,
  strict: true,
})
