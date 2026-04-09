/**
 * Modèle Utilisateur pour SparFinder
 * 
 * Définit la structure de la table User dans la base de données
 * en utilisant Drizzle ORM pour TypeScript
 * 
 * @version 1.0.0
 */

// Import des types et fonctions de drizzle-orm
import { mysqlTable, int, varchar } from 'drizzle-orm/mysql-core';

/**
 * Définition de la table User
 * Correspond à la table 'User' dans la base de données MySQL
 */
export const user = mysqlTable('User', {
  // ID unique auto-incrémenté
  id: int('ID').primaryKey().autoincrement(),
  
  // Email unique pour l'authentification
  email: varchar('Email', { length: 255 }).notNull().unique(),
  
  // Mot de passe hashé (bcrypt)
  password: varchar('Password', { length: 255 }).notNull(),
  
  // Prénom de l'utilisateur
  firstName: varchar('FirstName', { length: 100 }),
  
  // Nom de l'utilisateur
  lastName: varchar('LastName', { length: 100 }),
  
  // Taille en centimètres
  height: int('Height'),
  
  // Poids en kilogrammes
  weight: int('Weight'),
  
  // Niveau du combattant (Débutant, Intermédiaire, Avancé, Expert)
  level: varchar('Level', { length: 50 }),
  
  // Pays de résidence
  country: varchar('Country', { length: 100 }),
  
  // Région de résidence
  region: varchar('Region', { length: 100 }),
  
  // Statut administrateur ('true' ou 'false')
  isAdmin: varchar('IsAdmin', { length: 10 }).default('false'),
});

// Type TypeScript pour selects (données reçus de la BDD)
export type User = typeof user.$inferSelect;

// Type TypeScript pour inserts (données à envoyer à la BDD)
export type NewUser = typeof user.$inferInsert;
