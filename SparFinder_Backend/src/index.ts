/**
 * SparFinder Backend - Point d'entrée principal
 * 
 * Ce fichier initialise le serveur Elysia et configure :
 * - CORS pour autoriser les requêtes cross-origin
 * - Swagger pour la documentation API
 * - Les routes API (users, sparring, messages)
 * 
 * @version 1.0.0
 */

// Import des configurations et packages
import 'dotenv/config';                    // Charge les variables d'environnement
import { Elysia } from 'elysia';             // Framework web Bun
import cors from '@elysiajs/cors';           // Gestion CORS
import { swagger } from '@elysiajs/swagger'; // Documentation API automatique
import { testConnection } from './db/database'; // Test connexion BDD

// Import des routes API
import userRoute from './routes/user';      // Routes utilisateurs
import sparringRoute from './routes/sparring'; // Routes demandes sparring
import messageRoute from './routes/message'; // Routes messages

// Création de l'application Elysia
const app = new Elysia()
  // Active CORS pour autoriser le frontend à communiquer avec le backend
  .use(cors())
  
  // Active Swagger (documentation API) accessible à /swagger
  .use(swagger())
  
  // Groupe toutes les routes sous /api
  .group('/api', (app) => app
    .use(userRoute)        // Routes /api/users
    .use(sparringRoute)   // Routes /api/sparring
    .use(messageRoute)    // Routes /api/messages
  )
  
  // Démarre le serveur sur le port 3000
  .listen(3000, async () => {
    // Teste la connexion à la base de données au démarrage
    await testConnection();
  });

// Affiche l'URL du serveur dans la console
console.log(`Server running at ${app.server?.hostname}:${app.server?.port}`);
console.log(`Swagger: http://localhost:3000/swagger`);
