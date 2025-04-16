import { pgTable, serial, text, timestamp, integer, real, boolean } from 'drizzle-orm/pg-core';
import { InferModel } from 'drizzle-orm';

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  phoneNumber: text('phone_number'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Friends table
export const friends = pgTable('friends', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  friendName: text('friend_name').notNull(),
  email: text('email'),
  phoneNumber: text('phone_number'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Bills table
export const bills = pgTable('bills', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  title: text('title').notNull(),
  category: text('category').notNull(),
  totalAmount: real('total_amount').notNull(),
  date: text('date').notNull(), // Using text for date to match the context
  createdAt: timestamp('created_at').defaultNow(),
});

// Bill Items table
export const billItems = pgTable('bill_items', {
  id: serial('id').primaryKey(),
  billId: integer('bill_id').references(() => bills.id, { onDelete: 'cascade' }).notNull(),
  itemName: text('item_name').notNull(),
  price: real('price').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Bill Participants table
export const billParticipants = pgTable('bill_participants', {
  id: serial('id').primaryKey(),
  billId: integer('bill_id').references(() => bills.id, { onDelete: 'cascade' }).notNull(),
  participantId: integer('participant_id').notNull(),
  amount: real('amount').notNull(),
  isPaid: boolean('is_paid').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

// Types for the models
export type User = InferModel<typeof users>;
export type NewUser = InferModel<typeof users, 'insert'>;

export type Friend = InferModel<typeof friends>;
export type NewFriend = InferModel<typeof friends, 'insert'>;

export type Bill = InferModel<typeof bills>;
export type NewBill = InferModel<typeof bills, 'insert'>;

export type BillItem = InferModel<typeof billItems>;
export type NewBillItem = InferModel<typeof billItems, 'insert'>;

export type BillParticipant = InferModel<typeof billParticipants>;
export type NewBillParticipant = InferModel<typeof billParticipants, 'insert'>;