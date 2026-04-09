import { mysqlTable, int, varchar } from 'drizzle-orm/mysql-core';

export const user = mysqlTable('User', {
  id: int('ID').primaryKey().autoincrement(),
  email: varchar('Email', { length: 255 }).notNull().unique(),
  password: varchar('Password', { length: 255 }).notNull(),
  firstName: varchar('FirstName', { length: 100 }),
  lastName: varchar('LastName', { length: 100 }),
  height: int('Height'),
  weight: int('Weight'),
  level: varchar('Level', { length: 50 }),
  country: varchar('Country', { length: 100 }),
  region: varchar('Region', { length: 100 }),
  isAdmin: varchar('IsAdmin', { length: 10 }).default('false'),
});

export type User = typeof user.$inferSelect;
export type NewUser = typeof user.$inferInsert;
