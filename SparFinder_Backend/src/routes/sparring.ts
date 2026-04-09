/**
 * Routes API pour la gestion des demandes de sparring
 * 
 * Ce fichier définit les routes pour :
 * - Envoyer des demandes de sparring
 * - Accepter/Refuser des demandes
 * - Consulter les demandes envoyées/reçues
 * 
 * @version 1.0.0
 */

// Import d'Elysia pour les types de validation
import { Elysia, t } from 'elysia';

// Import des opérateurs Drizzle
import { eq, and, or } from 'drizzle-orm';

// Import de la base de données
import { db } from '../db/database';

// Import des modèles
import { sparringRequest, user, sport } from '../models';

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
 * Routes relatives aux demandes de sparring
 * Préfixe : /sparring
 */
const sparringRoute = new Elysia({ prefix: '/sparring' })
  
  /**
   * GET /sparring
   * Liste toutes les demandes (admin seulement)
   */
  .get('/', async ({ headers }) => {
    const payload = authenticate(headers);
    if (!payload) return { error: 'Unauthorized' };
    return await db.select().from(sparringRequest);
  })
  
  /**
   * GET /sparring/received/:userId
   * Obtenir les demandes de sparring reçues par un utilisateur
   * Enrichit les données avec les infos de l'expéditeur et du sport
   */
  .get('/received/:userId', async ({ params: { userId }, headers }) => {
    const payload = authenticate(headers);
    if (!payload) return { error: 'Unauthorized' };
    if (payload.id !== Number(userId)) return { error: 'Forbidden' };
    
    const numericId = Number(userId);
    
    // Récupère les demandes où l'utilisateur est le destinataire
    const requests = await db.select().from(sparringRequest)
      .where(eq(sparringRequest.receiverId, numericId));
    
    // Enrichit chaque demande avec les infos de l'expéditeur et du sport
    return Promise.all(requests.map(async (r) => {
      const sender = await db.select().from(user).where(eq(user.id, r.senderId));
      const sportData = await db.select().from(sport).where(eq(sport.id, r.sportId));
      return { ...r, sender: sender[0], sport: sportData[0] };
    }));
  })
  
  /**
   * GET /sparring/sent/:userId
   * Obtenir les demandes de sparring envoyées par un utilisateur
   * Enrichit les données avec les infos du destinataire et du sport
   */
  .get('/sent/:userId', async ({ params: { userId }, headers }) => {
    const payload = authenticate(headers);
    if (!payload) return { error: 'Unauthorized' };
    if (payload.id !== Number(userId)) return { error: 'Forbidden' };
    
    const numericId = Number(userId);
    
    // Récupère les demandes où l'utilisateur est l'expéditeur
    const requests = await db.select().from(sparringRequest)
      .where(eq(sparringRequest.senderId, numericId));
    
    // Enrichit chaque demande avec les infos du destinataire et du sport
    return Promise.all(requests.map(async (r) => {
      const receiver = await db.select().from(user).where(eq(user.id, r.receiverId));
      const sportData = await db.select().from(sport).where(eq(sport.id, r.sportId));
      return { ...r, receiver: receiver[0], sport: sportData[0] };
    }));
  })
  
  /**
   * POST /sparring
   * Envoyer une demande de sparring
   * Vérifie qu'une demande similaire n'existe pas déjà
   */
  .post('/', async ({ body, headers }) => {
    const payload = authenticate(headers);
    if (!payload) return { error: 'Unauthorized' };

    const { senderId, receiverId, sportId, message } = body as {
      senderId: number;
      receiverId: number;
      sportId: number;
      message?: string;
    };

    // L'expéditeur doit être l'utilisateur connecté
    if (payload.id !== senderId) return { error: 'Forbidden' };

    // Vérifie qu'une demande pendante n'existe pas déjà
    const existing = await db.select().from(sparringRequest).where(
      and(
        eq(sparringRequest.senderId, senderId),
        eq(sparringRequest.receiverId, receiverId),
        eq(sparringRequest.status, 'pending')
      )
    );

    if (existing.length > 0) {
      return { success: false, error: 'Request already exists' };
    }

    // Crée la nouvelle demande avec statut 'pending'
    return { 
      success: true, 
      data: await db.insert(sparringRequest)
        .values({ senderId, receiverId, sportId, message, status: 'pending' }) 
    };
  }, {
    body: t.Object({
      senderId: t.Number(),
      receiverId: t.Number(),
      sportId: t.Number(),
      message: t.Optional(t.String()),
    })
  })
  
  /**
   * PUT /sparring/:id/accept
   * Accepter une demande de sparring
   * Seul le destinataire peut accepter
   */
  .put('/:id/accept', async ({ params: { id }, headers }) => {
    const payload = authenticate(headers);
    if (!payload) return { error: 'Unauthorized' };
    
    // Récupère la demande
    const request = await db.select().from(sparringRequest)
      .where(eq(sparringRequest.id, Number(id)));
    
    if (request.length === 0) return { error: 'Not found' };
    
    // Seul le destinataire peut accepter
    if (request[0].receiverId !== payload.id) return { error: 'Forbidden' };
    
    const numericId = Number(id);
    return { 
      success: true, 
      data: await db.update(sparringRequest)
        .set({ status: 'accepted' })
        .where(eq(sparringRequest.id, numericId)) 
    };
  })
  
  /**
   * PUT /sparring/:id/reject
   * Refuser une demande de sparring
   * Seul le destinataire peut refuser
   */
  .put('/:id/reject', async ({ params: { id }, headers }) => {
    const payload = authenticate(headers);
    if (!payload) return { error: 'Unauthorized' };
    
    const request = await db.select().from(sparringRequest)
      .where(eq(sparringRequest.id, Number(id)));
    
    if (request.length === 0) return { error: 'Not found' };
    if (request[0].receiverId !== payload.id) return { error: 'Forbidden' };
    
    const numericId = Number(id);
    return { 
      success: true, 
      data: await db.update(sparringRequest)
        .set({ status: 'rejected' })
        .where(eq(sparringRequest.id, numericId)) 
    };
  })
  
  /**
   * DELETE /sparring/:id
   * Supprimer une demande de sparring
   * L'expéditeur ou le destinataire peut supprimer
   */
  .delete('/:id', async ({ params: { id }, headers }) => {
    const payload = authenticate(headers);
    if (!payload) return { error: 'Unauthorized' };
    
    const request = await db.select().from(sparringRequest)
      .where(eq(sparringRequest.id, Number(id)));
    
    if (request.length === 0) return { error: 'Not found' };
    
    // Vérifie que l'utilisateur est expéditeur ou destinataire
    if (request[0].senderId !== payload.id && request[0].receiverId !== payload.id) {
      return { error: 'Forbidden' };
    }
    
    const numericId = Number(id);
    return { 
      success: true, 
      data: await db.delete(sparringRequest)
        .where(eq(sparringRequest.id, numericId)) 
    };
  });

export default sparringRoute;
