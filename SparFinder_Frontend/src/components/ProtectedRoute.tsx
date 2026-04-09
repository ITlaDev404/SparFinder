/**
 * ProtectedRoute - Composant de protection des routes
 * 
 * Ce composant vérifie si un utilisateur est connecté
 * avant d'afficher le contenu protégé. Sinon, redirige vers login.
 * 
 * @version 1.0.0
 */

// Import des hooks et composants React Router
import { Navigate, useLocation } from 'react-router-dom';

/**
 * Propriétés du composant ProtectedRoute
 */
interface ProtectedRouteProps {
  children: React.ReactNode; // Contenu à afficher si autorisé
}

/**
 * Route protégée - vérifie l'authentification
 * 
 * @param children - Contenu à protéger
 * @returns children si connecté, sinon redirection vers /login
 */
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  // Récupère la location actuelle pour la redirection après login
  const location = useLocation();
  
  // Vérifie si un utilisateur est stocké dans localStorage
  const user = localStorage.getItem('user');

  // Si pas d'utilisateur, redirige vers la page de connexion
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Sinon, affiche le contenu protégé
  return children;
}