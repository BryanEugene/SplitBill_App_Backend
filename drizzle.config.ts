import type { Config } from 'drizzle-kit';
import 'dotenv/config';

export default {
  schema: './src/db/schema.ts',
  out: './drizzle',
  // driver: 'pglite',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DB || 'postgres://root:Password@localhost:5432/splitbill',
  },
} satisfies Config;