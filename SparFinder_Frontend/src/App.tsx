/**
 * SparFinder - Application Frontend Principale
 * 
 * Ce fichier configure le router de l'application React
 * et défini toutes les routes disponibles
 * 
 * @version 1.0.0
 */

// Import des composants de routing
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

// Import des pages
import Home from './pages/home';              // Page d'accueil publique
import Login from './pages/login';            // Page de connexion
import SignUp from './pages/signup';           // Page d'inscription
import Profile from './pages/profile';        // Profil utilisateur
import Search from './pages/search';          // Recherche partenaires
import MyRequests from './pages/my-requests'; // Gestion demandes sparring
import Messages from './pages/messages';       // Liste conversations
import Chat from './pages/chat';               // Conversation individuelle
import Admin from './pages/admin';            // Interface administrateur

// Import des composants
import ProtectedRoute from './components/ProtectedRoute'; // Protection routes
import Navbar from './components/Navbar';                  // Navigation
import { ToastProvider } from './components/Toast';      // Notifications

/**
 * Point d'entrée principal de l'application
 * Configure le routing et la structure globale
 */
function App() {
  return (
    // Provider pour les notifications toast (accessible partout)
    <ToastProvider>
      {/* Router principal de l'application */}
      <BrowserRouter>
        {/* Navbar visible sur toutes les pages authentifiées */}
        <Navbar />
        
        {/* Définition des routes */}
        <Routes>
          {/* Routes publiques */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          
          {/* Routes protégées - nécessitent authentification */}
          
          {/* Page de recherche de partenaires */}
          <Route path="/search" element={
            <ProtectedRoute>
              <Search />
            </ProtectedRoute>
          } />
          
          {/* Gestion des demandes de sparring */}
          <Route path="/my-requests" element={
            <ProtectedRoute>
              <MyRequests />
            </ProtectedRoute>
          } />
          
          {/* Liste des conversations */}
          <Route path="/messages" element={
            <ProtectedRoute>
              <Messages />
            </ProtectedRoute>
          } />
          
          {/* Conversation avec un utilisateur */}
          <Route path="/chat/:userId" element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          } />
          
          {/* Interface d'administration */}
          <Route path="/admin" element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          } />
          
          {/* Profil utilisateur */}
          <Route path="/profile/:id" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          
          {/* Route par défaut - redirige vers accueil */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  )
}

export default App;
