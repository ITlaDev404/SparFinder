/**
 * Utilitaires d'authentification pour SparFinder
 * 
 * Ce fichier fournit les fonctions pour :
 * - Hashage des mots de passe avec bcrypt
 * - Vérification des mots de passe
 * - Génération de tokens JWT
 * - Vérification des tokens JWT
 * 
 * @version 1.0.0
 */

// Import des packages
import jwt from 'jsonwebtoken';    // Gestion des tokens JWT
import bcrypt from 'bcrypt';       // Hashage des mots de passe

/**
 * Secret JWT pour la signatures des tokens
 * En production, utiliser une variable d'environnement
 */
const JWT_SECRET = process.env.JWT_SECRET || 'sparfinder-secret-key-change-in-production';

/**
 * Hash un mot de passe en clair
 * Utilise bcrypt avec 10 rounds de salt
 * 
 * @param password - Mot de passe en clair
 * @returns Mot de passe hashé
 */
export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

/**
 * Compare un mot de passe en clair avec un hash
 * 
 * @param password - Mot de passe en clair à vérifier
 * @param hash - Hash stocké en base de données
 * @returns true si les mots de passe correspondent
 */
export function comparePassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}

/**
 * Génère un token JWT pour un utilisateur
 * Le token expire après 7 jours
 * 
 * @param user - Objet contenant id et email de l'utilisateur
 * @returns Token JWT signé
 */
export function generateToken(user: { id: number; email: string }): string {
  return jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
}

/**
 * Vérifie et décode un token JWT
 * 
 * @param token - Token JWT à vérifier
 * @returns Payload décodé ou null si invalide/expiré
 */
export function verifyToken(token: string): { id: number; email: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { id: number; email: string };
  } catch {
    return null;
  }
}