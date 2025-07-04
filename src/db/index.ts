import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
const { Pool } = pg;
import * as schema from './schema.js';
import 'dotenv/config';

// Create a PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DB,
});

// Initialize drizzle with the pool and schema
export const db = drizzle(pool, { schema });

// Export the pool for use elsewhere if needed
export { pool };