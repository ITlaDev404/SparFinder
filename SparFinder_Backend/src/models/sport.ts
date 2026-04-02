import { mysqlTable, int, varchar, text } from 'drizzle-orm/mysql-core';

export const sport = mysqlTable('Sport', {
  id: int('ID').primaryKey().autoincrement(),
  name: varchar('Name', { length: 100 }).notNull().unique(),
  description: text('Description'),
});

export type Sport = typeof sport.$inferSelect;
export type NewSport = typeof sport.$inferInsert;

export const userSport = mysqlTable('UserSport', {
  id: int('ID').primaryKey().autoincrement(),
  userId: int('UserID').notNull(),
  sportId: int('SportID').notNull(),
});

export type UserSport = typeof userSport.$inferSelect;
