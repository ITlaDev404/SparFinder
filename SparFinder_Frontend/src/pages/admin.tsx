import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiCall } from '../utils/api';
import { useToast } from '../components/Toast';
import Loader from '../components/Loader';

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  country: string;
  region: string;
  isAdmin: string;
}

export default function Admin() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<{ id: number; isAdmin: boolean } | null>(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id) {
      navigate('/login');
      return;
    }
    
    if (!user.isAdmin) {
      showToast('Accès refusé', 'error');
      navigate('/search');
      return;
    }
    
    setCurrentUser(user);
    loadUsers();
  }, [navigate]);

  const loadUsers = async () => {
    const data = await apiCall('/users');
    setUsers(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  const handleDelete = async (userId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return;
    
    const result = await apiCall(`/users/${userId}`, { method: 'DELETE' });
    if (result.error) {
      showToast(result.error, 'error');
    } else {
      showToast('Utilisateur supprimé', 'success');
      loadUsers();
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gray-100 p-5">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Admin - Gestion des utilisateurs</h1>
          <button onClick={() => navigate('/search')} className="text-blue-500">← Retour</button>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">ID</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Nom</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Email</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Pays</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Admin</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm">{user.id}</td>
                  <td className="px-6 py-4 text-sm">{user.firstName} {user.lastName}</td>
                  <td className="px-6 py-4 text-sm">{user.email}</td>
                  <td className="px-6 py-4 text-sm">{user.country}{user.region ? `, ${user.region}` : ''}</td>
                  <td className="px-6 py-4 text-sm">
                    {user.isAdmin === 'true' ? (
                      <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">Admin</span>
                    ) : (
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">User</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {user.id !== currentUser?.id && user.isAdmin !== 'true' && (
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="text-red-500 hover:text-red-700 text-sm font-medium"
                      >
                        Supprimer
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {users.length === 0 && (
          <p className="text-center text-gray-500 mt-10">Aucun utilisateur</p>
        )}
      </div>
    </div>
  );
}