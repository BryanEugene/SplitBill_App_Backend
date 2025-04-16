import { pgTable, serial, text } from 'drizzle-orm/pg-core';
import { drizzle } from 'drizzle-orm/singlestore';
import { connectionString } from 'pg/lib/defaults';

export const user = pgTable('user', {
  id: serial('id').primaryKey(),
  username: text('username').unique().notNull(),
  password: text('password').notNull(),
  phoneNumber: text('phoneNumber').notNull(),
  email: text('email').notNull(),
  salt: text('salt').notNull(),
  sessiontoken: text('sessiontoken').notNull(),
});

export type User = InferModel<typeof user>;
export type NewUser = InferModel<typeof user, 'insert'>;

const pool = new Pool({
    connectionString : process.env.DB,
});

const db = drizzle(pool);

export const getUser = async () => 
    await db.select({ id: user.id, username: user.username, email: user.email, phoneNumber: user.phoneNumber }).from(user);
export const getUserByEmail = async (email: string) =>
    await db.select().from(user).where(eq(user.email, email));
export const getUserBySessiontoken = async (sessionToken: string) => 
    await db.select().from(user).where(eq(user.sessiontoken, sessionToken));
export const createUser = async (newUser: NewUser) =>
    await db.insert(user).values(newUser).returning({ id: user.id, username: user.username, email: user.email, phoneNumber: user.phoneNumber });
export const updateUser = async (id: number, updates: Partial<User>) =>
