/**
 * Toast - Système de notifications
 * 
 * Ce fichier fournit un système de notifications temporaires
 * accessible globalelement via React Context
 * 
 * @version 1.0.0
 */

// Import des hooks et fonctions React
import { useState, createContext, useContext, ReactNode } from 'react';

/**
 * Structure d'une notification toast
 */
interface Toast {
  id: number;                                    // ID unique
  message: string;                                // Message à afficher
  type: 'success' | 'error' | 'info';          // Type de notification
}

/**
 * Interface du contexte Toast
 */
interface ToastContextType {
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

// Création du Context pour les notifications
const ToastContext = createContext<ToastContextType | null>(null);

/**
 * ToastProvider - Fournisseur de contexte pour les toasts
 * 
 * Enveloppe l'application pour donner accès aux notifications
 * Affiche automatiquement les toasts en haut à droite
 * 
 * @param children - Composants enfants
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  // État contenant la liste des toasts actifs
  const [toasts, setToasts] = useState<Toast[]>([]);

  /**
   * Affiche une notification toast
   * 
   * @param message - Message à afficher
   * @param type - Type de notification (success/error/info)
   */
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now(); // Génère un ID unique
    
    // Ajoute le toast à la liste
    setToasts(prev => [...prev, { id, message, type }]);
    
    // Supprime automatiquement le toast après 3 secondes
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* Zone d'affichage des toasts - en haut à droite */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map(toast => (
          <div 
            key={toast.id} 
            className={`px-6 py-3 rounded-lg shadow-lg text-white font-medium animate-slide-in
              ${toast.type === 'success' ? 'bg-green-500' : 
                toast.type === 'error' ? 'bg-red-500' : 'bg-blue-500'}`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/**
 * Hook pour utiliser les toasts dans un composant
 * 
 * @returns Fonction showToast pour afficher des notifications
 * @throws Error si utilisé hors du ToastProvider
 */
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
}