/**
 * Routes API pour la gestion des utilisateurs
 * 
 * Ce fichier définit toutes les routes relatives aux utilisateurs :
 * - Inscription / Connexion
 * - Consultation / Modification / Suppression de profil
 * - Gestion des sports pratiqués
 * 
 * @version 1.0.0
 */

// Import d'Elysia pour les types de validation
import { Elysia, t } from 'elysia';

// Import des opérateurs Drizzle
import { eq, and } from 'drizzle-orm';

// Import de la base de données
import { db } from '../db/database';

// Import des modèles
import { user, userSport, sport } from '../models';

// Import des utilitaires d'authentification
import { hashPassword, comparePassword, generateToken, verifyToken } from '../utils/auth';

/**
 * Extrait et vérifie le token JWT des headers
 * 
 * @param headers - Headers de la requête HTTP
 * @returns Payload du token ou null si invalide
 */
const authenticate = (headers: Record<string, string | undefined>) => {
  // Extraction du token du header Authorization
  const token = headers['authorization']?.replace('Bearer ', '');
  if (!token) return null;
  return verifyToken(token);
};

/**
 * Vérifie si un utilisateur est administrateur
 * 
 * @param userId - ID de l'utilisateur à vérifier
 * @returns true si l'utilisateur est admin
 */
const isAdmin = async (userId: number): Promise<boolean> => {
  const result = await db.select().from(user).where(eq(user.id, userId));
  return result.length > 0 && result[0].isAdmin === 'true';
};

/**
 * Routes relatives aux utilisateurs
 * Préfixe : /users
 */
const userRoute = new Elysia({ prefix: '/users' })
  
  /**
   * GET /users
   * Liste tous les utilisateurs
   * Requiert authentification JWT
   */
  .get('/', async ({ headers }) => {
    const payload = authenticate(headers);
    if (!payload) return { error: 'Unauthorized' };
    return await db.select().from(user);
  })
  
  /**
   * GET /users/:id
   * Obtenir un utilisateur par son ID
   * Route publique
   */
  .get('/:id', async ({ params: { id } }) => {
    const numericId = Number(id);
    return await db.select().from(user).where(eq(user.id, numericId));
  })
  
  /**
   * POST /users
   * Créer un nouveau compte utilisateur
   * - Valide que l'email n'existe pas déjà
   * - Hash le mot de passe avec bcrypt
   */
  .post('/', async ({ body }) => {
    // Extraction des données du body
    const { email, password, firstName, lastName } = body as {
      email: string;
      password: string;
      firstName?: string;
      lastName?: string;
    };

    // Validation des champs obligatoires
    if (!email || !password) {
      return { success: false, error: 'Email and password are required' };
    }

    // Validation de la longueur du mot de passe
    if (password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters' };
    }

    // Vérification si l'email existe déjà
    const existing = await db.select().from(user).where(eq(user.email, email));
    if (existing.length > 0) {
      return { success: false, error: 'Email already exists' };
    }

    // Hashage du mot de passe et création de l'utilisateur
    const hashedPassword = hashPassword(password);
    const result = await db.insert(user).values({ 
      email, 
      password: hashedPassword, 
      firstName, 
      lastName 
    });
    return { success: true, data: result };
  }, {
    body: t.Object({
      email: t.String({ format: 'email' }),
      password: t.String({ minLength: 6 }),
      firstName: t.Optional(t.String()),
      lastName: t.Optional(t.String()),
    })
  })
  
  /**
   * POST /users/login
   * Authentifie un utilisateur et génère un token JWT
   */
  .post('/login', async ({ body }) => {
    const { email, password } = body as { email: string; password: string };

    // Validation des champs
    if (!email || !password) {
      return { success: false, error: 'Email and password are required' };
    }

    // Recherche de l'utilisateur par email
    const result = await db.select().from(user).where(eq(user.email, email));

    // Vérification que l'utilisateur existe
    if (result.length === 0) {
      return { success: false, error: 'User not found' };
    }

    const foundUser = result[0];
    
    // Vérification du mot de passe
    if (!comparePassword(password, foundUser.password)) {
      return { success: false, error: 'Invalid password' };
    }

    // Génération du token JWT
    const token = generateToken({ id: foundUser.id, email: foundUser.email });
    return { 
      success: true, 
      token, 
      user: { 
        id: foundUser.id, 
        email: foundUser.email, 
        firstName: foundUser.firstName,
        isAdmin: foundUser.isAdmin === 'true'
      } 
    };
  }, {
    body: t.Object({
      email: t.String(),
      password: t.String(),
    })
  })
  
  /**
   * PUT /users/:id
   * Modifier le profil d'un utilisateur
   * L'utilisateur peut modifier son propre profil
   * L'admin peut modifier n'importe quel profil
   */
  .put('/:id', async ({ params: { id }, headers, body }) => {
    const payload = authenticate(headers);
    if (!payload) return { error: 'Unauthorized' };
    
    const numericId = Number(id);
    const isUserAdmin = await isAdmin(payload.id);
    
    // Vérification des droits : proprio ou admin
    if (payload.id !== numericId && !isUserAdmin) return { error: 'Forbidden' };

    // Extraction des données à mettre à jour
    const { firstName, lastName, height, weight, level, country, region } = body as {
      firstName?: string;
      lastName?: string;
      height?: number;
      weight?: number;
      level?: string;
      country?: string;
      region?: string;
    };

    // Mise à jour en base de données
    return { 
      success: true, 
      data: await db.update(user)
        .set({ firstName, lastName, height, weight, level, country, region })
        .where(eq(user.id, numericId)) 
    };
  }, {
    body: t.Object({
      firstName: t.Optional(t.String()),
      lastName: t.Optional(t.String()),
      height: t.Optional(t.Number()),
      weight: t.Optional(t.Number()),
      level: t.Optional(t.String()),
      country: t.Optional(t.String()),
      region: t.Optional(t.String()),
    })
  })
  
  /**
   * DELETE /users/:id
   * Supprimer un compte utilisateur
   * L'utilisateur peut supprimer son propre compte
   * L'admin peut supprimer n'importe quel compte (sauf autres admins)
   */
  .delete('/:id', async ({ params: { id }, headers }) => {
    const payload = authenticate(headers);
    if (!payload) return { error: 'Unauthorized' };
    
    const numericId = Number(id);
    const isUserAdmin = await isAdmin(payload.id);
    
    // Vérification des droits
    if (payload.id !== numericId && !isUserAdmin) return { error: 'Forbidden' };

    return { success: true, data: await db.delete(user).where(eq(user.id, numericId)) };
  })
  
  /**
   * POST /users/:id/sports
   * Ajouter un sport pratiqué par l'utilisateur
   */
  .post('/:id/sports', async ({ params: { id }, headers, body }) => {
    const payload = authenticate(headers);
    if (!payload) return { error: 'Unauthorized' };
    if (payload.id !== Number(id)) return { error: 'Forbidden' };

    const numericId = Number(id);
    const { sportId } = body as { sportId: number };

    return { 
      success: true, 
      data: await db.insert(userSport).values({ userId: numericId, sportId }) 
    };
  }, {
    body: t.Object({
      sportId: t.Number(),
    })
  })
  
  /**
   * DELETE /users/:id/sports/:sportId
   * Supprimer un sport pratiqué par l'utilisateur
   */
  .delete('/:id/sports/:sportId', async ({ params: { id, sportId }, headers }) => {
    const payload = authenticate(headers);
    if (!payload) return { error: 'Unauthorized' };
    if (payload.id !== Number(id)) return { error: 'Forbidden' };

    const numericId = Number(id);
    const numericSportId = Number(sportId);

    return { 
      success: true, 
      data: await db.delete(userSport)
        .where(and(eq(userSport.userId, numericId), eq(userSport.sportId, numericSportId))) 
    };
  })
  
  /**
   * GET /users/:id/sports
   * Obtenir la liste des sports pratiqués par un utilisateur
   */
  .get('/:id/sports', async ({ params: { id } }) => {
    const numericId = Number(id);
    // Récupère les associations user-sport
    const userSports = await db.select().from(userSport).where(eq(userSport.userId, numericId));
    // Pour chaque association, récupère les détails du sport
    const sports = await Promise.all(
      userSports.map(async (us) => {
        const sportData = await db.select().from(sport).where(eq(sport.id, us.sportId));
        return sportData[0];
      })
    );
    return sports;
  })
  
  /**
   * GET /users/sports
   * Obtenir la liste de tous les sports disponibles
   */
  .get('/sports', async () => {
    return await db.select().from(sport);
  });

export default userRoute;