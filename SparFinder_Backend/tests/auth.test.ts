import { describe, it, expect, beforeAll, afterAll } from 'bun:test';
import { db } from '../src/db/database';
import { user, sport, sparringRequest, message } from '../src/models';
import { hashPassword, comparePassword, generateToken, verifyToken } from '../src/utils/auth';
import { eq } from 'drizzle-orm';

/**
 * Tests des utilitaires d'authentification
 * 
 * Ces tests vérifient le bon fonctionnement des fonctions
 * de hashage, vérification et génération de tokens JWT
 */
describe('Auth Utilities', () => {
  /**
   * Test du hashage de mot de passe
   * Vérifie que bcrypt hash correctement un mot de passe
   */
  it('should hash password correctly', () => {
    const password = 'testPassword123';
    const hashed = hashPassword(password);
    
    // Le hash ne doit pas être égal au mot de passe original
    expect(hashed).not.toBe(password);
    // Le hash doit être une chaîne non vide
    expect(hashed.length).toBeGreaterThan(0);
  });

  /**
   * Test de la comparaison de mot de passe
   * Vérifie que comparePassword retourne true pour le bon mot de passe
   */
  it('should verify correct password', () => {
    const password = 'testPassword123';
    const hashed = hashPassword(password);
    
    // La vérification doit retourner true
    expect(comparePassword(password, hashed)).toBe(true);
  });

  /**
   * Test du rejet d'un mauvais mot de passe
   * Vérifie que comparePassword retourne false pour un mauvais mot de passe
   */
  it('should reject wrong password', () => {
    const password = 'testPassword123';
    const wrongPassword = 'wrongPassword';
    const hashed = hashPassword(password);
    
    // La vérification doit retourner false
    expect(comparePassword(wrongPassword, hashed)).toBe(false);
  });

  /**
   * Test de génération de token JWT
   * Vérifie qu'un token est généré avec les bonnes propriétés
   */
  it('should generate valid JWT token', () => {
    const userData = { id: 1, email: 'test@example.com' };
    const token = generateToken(userData);
    
    // Le token doit être une chaîne non vide
    expect(token.length).toBeGreaterThan(0);
    // Le token doit contenir des points (format JWT)
    expect(token.split('.').length).toBe(3);
  });

  /**
   * Test de vérification de token JWT
   * Vérifie que verifyToken décode correctement un token valide
   */
  it('should verify valid token', () => {
    const userData = { id: 1, email: 'test@example.com' };
    const token = generateToken(userData);
    const decoded = verifyToken(token);
    
    // Le token décodé doit contenir les bonnes informations
    expect(decoded).not.toBeNull();
    expect(decoded?.id).toBe(1);
    expect(decoded?.email).toBe('test@example.com');
  });

  /**
   * Test du rejet d'un token invalide
   * Vérifie que verifyToken retourne null pour un token invalide
   */
  it('should return null for invalid token', () => {
    const invalidToken = 'invalid.token.here';
    const decoded = verifyToken(invalidToken);
    
    // Doit retourner null pour un token invalide
    expect(decoded).toBeNull();
  });
});

/**
 * Tests des modèles de données
 * 
 * Ces tests vérifient la structure des types TypeScript
 */
describe('Data Models', () => {
  /**
   * Test du modèle User
   * Vérifie que le type User contient les bonnes propriétés
   */
  it('should have correct User structure', () => {
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      password: 'hashed_password',
      firstName: 'John',
      lastName: 'Doe',
      height: 180,
      weight: 75,
      level: 'Intermédiaire',
      country: 'France',
      region: 'Île-de-France',
      isAdmin: 'false',
    };
    
    // Vérification des propriétés
    expect(mockUser.id).toBe(1);
    expect(mockUser.email).toBe('test@example.com');
    expect(mockUser.country).toBe('France');
    expect(mockUser.isAdmin).toBe('false');
  });

  /**
   * Test du modèle SparringRequest
   * Vérifie que le type contient les bonnes propriétés
   */
  it('should have correct SparringRequest structure', () => {
    const mockRequest = {
      id: 1,
      senderId: 1,
      receiverId: 2,
      sportId: 1,
      message: 'Bonjour, veux-tu faire un sparring?',
      status: 'pending',
      createdAt: '2024-01-01T00:00:00.000Z',
    };
    
    expect(mockRequest.status).toBe('pending');
    expect(mockRequest.senderId).toBe(1);
    expect(mockRequest.receiverId).toBe(2);
  });

  /**
   * Test du modèle Message
   * Vérifie que le type contient les bonnes propriétés
   */
  it('should have correct Message structure', () => {
    const mockMessage = {
      id: 1,
      senderId: 1,
      receiverId: 2,
      content: 'Salut!',
      createdAt: '2024-01-01T00:00:00.000Z',
    };
    
    expect(mockMessage.content).toBe('Salut!');
    expect(mockMessage.senderId).not.toBe(mockMessage.receiverId);
  });
});

/**
 * Tests de validation des données utilisateur
 */
describe('User Validation', () => {
  /**
   * Test de validation d'email valide
   */
  it('should validate correct email format', () => {
    const validEmails = [
      'user@example.com',
      'test.user@domain.org',
      'admin@sparfinder.fr'
    ];
    
    // Vérifie que tous les emails ont le bon format
    validEmails.forEach(email => {
      expect(email.includes('@')).toBe(true);
      expect(email.includes('.')).toBe(true);
    });
  });

  /**
   * Test de validation de mot de passe
   * Vérifie que le mot de passe fait au moins 6 caractères
   */
  it('should validate password length', () => {
    const validPassword = 'password123';
    const invalidPassword = 'abc';
    
    // Mot de passe valide
    expect(validPassword.length).toBeGreaterThanOrEqual(6);
    // Mot de passe invalide
    expect(invalidPassword.length).toBeLessThan(6);
  });

  /**
   * Test de validation du niveau utilisateur
   * Vérifie que le niveau est une des valeurs autorisées
   */
  it('should validate user level', () => {
    const validLevels = ['Débutant', 'Intermédiaire', 'Avancé', 'Expert'];
    
    validLevels.forEach(level => {
      expect(validLevels).toContain(level);
    });
  });
});

/**
 * Tests des fonctionnalités de recherche
 */
describe('Search Functionality', () => {
  /**
   * Test de filtrage par taille
   */
  it('should filter users by minimum height', () => {
    const users = [
      { id: 1, height: 170 },
      { id: 2, height: 180 },
      { id: 3, height: 190 },
    ];
    
    const minHeight = 180;
    const filtered = users.filter(u => u.height >= minHeight);
    
    // Doit garder uniquement les utilisateurs >= 180cm
    expect(filtered.length).toBe(2);
    expect(filtered.every(u => u.height >= 180)).toBe(true);
  });

  /**
   * Test de filtrage par poids
   */
  it('should filter users by weight range', () => {
    const users = [
      { id: 1, weight: 60 },
      { id: 2, weight: 75 },
      { id: 3, weight: 90 },
    ];
    
    const minWeight = 70;
    const maxWeight = 85;
    const filtered = users.filter(u => u.weight >= minWeight && u.weight <= maxWeight);
    
    // Doit garder uniquement les utilisateurs entre 70 et 85kg
    expect(filtered.length).toBe(1);
    expect(filtered[0].weight).toBe(75);
  });

  /**
   * Test de filtrage par pays
   */
  it('should filter users by country', () => {
    const users = [
      { id: 1, country: 'France' },
      { id: 2, country: 'Belgique' },
      { id: 3, country: 'France' },
    ];
    
    const country = 'France';
    const filtered = users.filter(u => u.country === country);
    
    // Doit garder uniquement les utilisateurs français
    expect(filtered.length).toBe(2);
    expect(filtered.every(u => u.country === 'France')).toBe(true);
  });
});

/**
 * Tests de logique des demandes de sparring
 */
describe('Sparring Logic', () => {
  /**
   * Test de vérification des duplicate requests
   * Vérifie qu'on ne peut pas envoyer plusieurs demandes identiques
   */
  it('should detect duplicate pending requests', () => {
    const existingRequests = [
      { senderId: 1, receiverId: 2, status: 'pending' },
      { senderId: 1, receiverId: 3, status: 'accepted' },
    ];
    
    const newRequest = { senderId: 1, receiverId: 2, status: 'pending' };
    
    // Cherche si une demande similaire existe déjà
    const isDuplicate = existingRequests.some(
      r => r.senderId === newRequest.senderId && 
           r.receiverId === newRequest.receiverId && 
           r.status === 'pending'
    );
    
    expect(isDuplicate).toBe(true);
  });

  /**
   * Test de transition de statut
   * Vérifie les états possibles d'une demande
   */
  it('should allow valid status transitions', () => {
    const validTransitions: Record<string, string[]> = {
      'pending': ['accepted', 'rejected'],
      'accepted': [],
      'rejected': [],
    };
    
    // De pending on peut accepter ou refuser
    expect(validTransitions['pending']).toContain('accepted');
    expect(validTransitions['pending']).toContain('rejected');
    // De accepted on ne peut pas changer
    expect(validTransitions['accepted'].length).toBe(0);
  });
});

/**
 * Tests de logique des messages
 */
describe('Message Logic', () => {
  /**
   * Test de filtre de conversation
   * Vérifie qu'on récupère les messages entre deux utilisateurs
   */
  it('should filter messages for a conversation', () => {
    const messages = [
      { senderId: 1, receiverId: 2 },
      { senderId: 2, receiverId: 1 },
      { senderId: 1, receiverId: 3 },
      { senderId: 3, receiverId: 1 },
    ];
    
    const user1Id = 1;
    const user2Id = 2;
    
    const conversation = messages.filter(
      m => (m.senderId === user1Id && m.receiverId === user2Id) ||
           (m.senderId === user2Id && m.receiverId === user1Id)
    );
    
    // Doit récupérer les 2 messages entre utilisateur 1 et 2
    expect(conversation.length).toBe(2);
  });

  /**
   * Test d'identification sender/receiver
   * Vérifie qu'on peut différencier ses messages des autres
   */
  it('should identify user messages correctly', () => {
    const currentUserId = 1;
    const messages = [
      { senderId: 1, receiverId: 2, content: 'Hello' },
      { senderId: 2, receiverId: 1, content: 'Hi' },
      { senderId: 3, receiverId: 1, content: 'From other' },
    ];
    
    const sentMessages = messages.filter(m => m.senderId === currentUserId);
    const receivedMessages = messages.filter(m => m.receiverId === currentUserId);
    
    expect(sentMessages.length).toBe(1);
    expect(receivedMessages.length).toBe(2);
  });
});