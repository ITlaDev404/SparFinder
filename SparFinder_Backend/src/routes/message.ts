/**
 * Routes API pour la gestion des messages
 * 
 * Ce fichier définit les routes pour :
 * - Lister tous les messages (admin)
 * - Consulter une conversation entre deux utilisateurs
 * - Envoyer un nouveau message
 * 
 * @version 1.0.0
 */

// Import d'Elysia pour les types de validation
import { Elysia, t } from 'elysia';

// Import des opérateurs Drizzle
import { eq, and, or } from 'drizzle-orm';

// Import de la base de données
import { db } from '../db/database';

// Import du modèle message
import { message } from '../models';

// Import des utilitaires d'authentification
import { verifyToken } from '../utils/auth';

/**
 * Extrait et vérifie le token JWT des headers
 */
const authenticate = (headers: Record<string, string | undefined>) => {
  const token = headers['authorization']?.replace('Bearer ', '');
  if (!token) return null;
  return verifyToken(token);
};

/**
 * Routes relatives aux messages
 * Préfixe : /messages
 */
const messageRoute = new Elysia({ prefix: '/messages' })
  
  /**
   * GET /messages
   * Liste tous les messages (admin seulement)
   */
  .get('/', async ({ headers }) => {
    const payload = authenticate(headers);
    if (!payload) return { error: 'Unauthorized' };
    return await db.select().from(message);
  })
  
  /**
   * GET /messages/conversation/:user1Id/:user2Id
   * Obtenir tous les messages échangés entre deux utilisateurs
   * Les deux utilisateurs doivent être participants à la conversation
   */
  .get('/conversation/:user1Id/:user2Id', async ({ params: { user1Id, user2Id }, headers }) => {
    const payload = authenticate(headers);
    if (!payload) return { error: 'Unauthorized' };
    
    const id1 = Number(user1Id);
    const id2 = Number(user2Id);
    
    // Vérifie que l'utilisateur connecté fait partie de la conversation
    if (payload.id !== id1 && payload.id !== id2) return { error: 'Forbidden' };
    
    // Récupère les messages dans les deux sens
    return await db.select().from(message).where(
      or(
        and(eq(message.senderId, id1), eq(message.receiverId, id2)),
        and(eq(message.senderId, id2), eq(message.receiverId, id1))
      )
    );
  })
  
  /**
   * POST /messages
   * Envoyer un nouveau message
   * L'expéditeur doit être l'utilisateur connecté
   */
  .post('/', async ({ body, headers }) => {
    const payload = authenticate(headers);
    if (!payload) return { error: 'Unauthorized' };

    const { senderId, receiverId, content } = body as {
      senderId: number;
      receiverId: number;
      content: string;
    };

    // L'expéditeur doit être l'utilisateur connecté
    if (payload.id !== senderId) return { error: 'Forbidden' };

    // Génère la date actuelle
    const createdAt = new Date().toISOString();
    
    return { 
      success: true, 
      data: await db.insert(message)
        .values({ senderId, receiverId, content, createdAt }) 
    };
  }, {
    body: t.Object({
      senderId: t.Number(),
      receiverId: t.Number(),
      content: t.String(),
    })
  });

export default messageRoute;
