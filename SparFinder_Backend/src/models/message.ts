import { mysqlTable, int, varchar, text } from 'drizzle-orm/mysql-core';

export const message = mysqlTable('Message', {
  id: int('ID').primaryKey().autoincrement(),
  senderId: int('SenderID').notNull(),
  receiverId: int('ReceiverID').notNull(),
  content: text('Content').notNull(),
  createdAt: varchar('CreatedAt', { length: 50 }),
});

export type Message = typeof message.$inferSelect;
export type NewMessage = typeof message.$inferInsert;
