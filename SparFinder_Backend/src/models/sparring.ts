import { mysqlTable, int, varchar } from 'drizzle-orm/mysql-core';

export const sparringRequest = mysqlTable('SparringRequest', {
  id: int('ID').primaryKey().autoincrement(),
  senderId: int('SenderID').notNull(),
  receiverId: int('ReceiverID').notNull(),
  sportId: int('SportID').notNull(),
  message: varchar('Message', { length: 500 }),
  status: varchar('Status', { length: 20 }).notNull().default('pending'),
});

export type SparringRequest = typeof sparringRequest.$inferSelect;
export type NewSparringRequest = typeof sparringRequest.$inferInsert;
