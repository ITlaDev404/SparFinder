/**
 * Configuration de la base de données SparFinder
 * 
 * Ce fichier établit la connexion avec MySQL/MariaDB en utilisant :
 * - mysql2/promise pour les requêtes asynchrones
 * - drizzle-orm comme ORM pour les requêtes
 * 
 * @version 1.0.0
 */

// Import des packages
import 'dotenv/config';                    // Variables d'environnement
import { drizzle } from 'drizzle-orm/mysql2'; // ORM drizzle
import mysql from 'mysql2/promise';         // Driver MySQL

/**
 * Pool de connexion MySQL
 * Crée un pool de connexions pour optimiser les performances
 * Les paramètres viennent du fichier .env
 */
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',    // Hôte BDD
  user: process.env.DB_USER || 'root',        // Utilisateur BDD
  password: process.env.DB_PASSWORD || 'root', // Mot de passe BDD
  database: process.env.DB_NAME || 'sparfinder', // Nom de la base
});

// Export de l'instance drizzle pour les requêtes ORM
export const db = drizzle(pool);

/**
 * Teste la connexion à la base de données
 * Affiche un message de succès ou d'erreur dans la console
 */
export async function testConnection() {
  try {
    // Tente d'obtenir une connexion du pool
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully');
    // Libère la connexion terug dans le pool
    connection.release();
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  }
}
