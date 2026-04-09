/**
 * Navbar - Composant de navigation principale
 * 
 * Affiche la barre de navigation en haut de l'écran
 * - Logo SparFinder cliquable
 * - Liens vers les pages (Rechercher, Demandes, Messages)
 * - Lien Admin si l'utilisateur est administrateur
 * - Lien Profil et Déconnexion
 * - Menu burger pour mobile
 * 
 * @version 1.0.0
 */

// Import des hooks et composants React
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

/**
 * Barre de navigation principale
 * Visible uniquement sur les pages authentifiées
 */
export default function Navbar() {
  // Hooks de navigation
  const navigate = useNavigate();
  const location = useLocation();
  
  // Récupère les infos utilisateur depuis localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  // État pour le menu mobile
  const [menuOpen, setMenuOpen] = useState(false);

  // Pages où la navbar ne doit pas s'afficher (authentification)
  const isAuthPage = 
    location.pathname === '/' || 
    location.pathname === '/login' || 
    location.pathname === '/signup';

  // Ne pas afficher si page d'auth ou pas connecté
  if (isAuthPage || !user.id) return null;

  /**
   * Déconnexion - vide le localStorage et redirige vers login
   */
  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md p-4">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        {/* Logo cliquable vers la recherche */}
        <Link to="/search" className="text-2xl font-bold text-blue-500">SparFinder</Link>
        
        {/* Bouton menu burger pour mobile */}
        <button 
          onClick={() => setMenuOpen(!menuOpen)} 
          className="md:hidden p-2"
          aria-label="Menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} 
            />
          </svg>
        </button>

        {/* Liens de navigation - caché sur mobile, affiché sur desktop */}
        <div className={`md:flex items-center gap-6 ${menuOpen ? 'absolute top-16 left-0 right-0 bg-white p-4 flex-col shadow-md' : 'hidden'}`}>
          {/* Lien Recherche */}
          <Link to="/search" className="text-gray-700 hover:text-blue-500 block py-2">
            Rechercher
          </Link>
          
          {/* Lien Demandes */}
          <Link to="/my-requests" className="text-gray-700 hover:text-blue-500 block py-2">
            Demandes
          </Link>
          
          {/* Lien Messages */}
          <Link to="/messages" className="text-gray-700 hover:text-blue-500 block py-2">
            Messages
          </Link>
          
          {/* Lien Admin - visible uniquement pour les administrateurs */}
          {user.isAdmin && (
            <Link to="/admin" className="text-red-600 hover:text-red-800 block py-2 font-semibold">
              Admin
            </Link>
          )}
          
          {/* Lien Profil */}
          <Link 
            to={`/profile/${user.id}`} 
            className="text-gray-700 hover:text-blue-500 block py-2"
          >
            {user.firstName || 'Profil'}
          </Link>
          
          {/* Bouton Déconnexion */}
          <button 
            onClick={handleLogout} 
            className="text-red-500 hover:text-red-700 block py-2"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}