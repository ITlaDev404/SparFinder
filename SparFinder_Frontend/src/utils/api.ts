/**
 * apiCall - Utilitaire pour les appels API
 * 
 * Ce fichier fournit une fonction helper pour faire des requêtes
 * vers le backend avec gestion automatique du token JWT
 * 
 * @version 1.0.0
 */

// URL de base de l'API (proxy Vite vers localhost:3000)
const API_BASE = '/api';

/**
 * Options pour les requêtes API
 */
interface RequestOptions {
  method?: string;      // Méthode HTTP (GET, POST, PUT, DELETE)
  body?: unknown;       // Corps de la requête (sérialisé en JSON)
}

/**
 * Fonction helper pour les appels API
 * Ajoute automatiquement le token JWT dans les headers
 * 
 * @param endpoint - Chemin de l'endpoint (ex: '/users')
 * @param options - Options de la requête (method, body)
 * @returns Promise avec la réponse JSON
 */
export async function apiCall(endpoint: string, options: RequestOptions = {}) {
  // Récupère le token JWT depuis localStorage
  const token = localStorage.getItem('token');
  
  // Construit les headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  // Ajoute le token Bearer si présent
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Construit les options de fetch
  const fetchOptions: RequestInit = {
    method: options.method || 'GET', // Par défaut GET
    headers,
  };

  // Ajoute le body s'il y en a un
  if (options.body) {
    fetchOptions.body = JSON.stringify(options.body);
  }

  // Effectue la requête et retourne le JSON
  const res = await fetch(`${API_BASE}${endpoint}`, fetchOptions);
  return res.json();
}