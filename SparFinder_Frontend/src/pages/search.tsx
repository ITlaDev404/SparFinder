import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiCall } from '../utils/api';

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  height: number;
  weight: number;
  level: string;
  country: string;
  region: string;
}

const countries = [
  'France', 'Belgique', 'Suisse', 'Canada', 'Maroc', 'Algérie', 'Tunisie',
  'Espagne', 'Italie', 'Allemagne', 'Royaume-Uni', 'Portugal', 'Brésil'
];

export default function Search() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [filters, setFilters] = useState({
    minHeight: '',
    maxHeight: '',
    minWeight: '',
    maxWeight: '',
    level: '',
    country: '',
    sport: '',
  });

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = await apiCall('/users');

    if (data.error) {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      navigate('/login');
      return;
    }

    let filtered = data;

    if (filters.minHeight) {
      filtered = filtered.filter((u: User) => u.height >= Number(filters.minHeight));
    }
    if (filters.maxHeight) {
      filtered = filtered.filter((u: User) => u.height <= Number(filters.maxHeight));
    }
    if (filters.minWeight) {
      filtered = filtered.filter((u: User) => u.weight >= Number(filters.minWeight));
    }
    if (filters.maxWeight) {
      filtered = filtered.filter((u: User) => u.weight <= Number(filters.maxWeight));
    }
    if (filters.level) {
      filtered = filtered.filter((u: User) => u.level?.toLowerCase().includes(filters.level.toLowerCase()));
    }
    if (filters.country) {
      filtered = filtered.filter((u: User) => u.country?.toLowerCase() === filters.country.toLowerCase());
    }

    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    filtered = filtered.filter((u: User) => u.id !== currentUser.id);

    setUsers(filtered);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-5">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Rechercher des partenaires</h1>
          <button
            onClick={() => {
              localStorage.removeItem('user');
              localStorage.removeItem('token');
              navigate('/login');
            }}
            className="px-4 py-2 bg-red-500 text-white rounded-lg"
          >
            Déconnexion
          </button>
        </div>

        <form onSubmit={handleSearch} className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <input
              type="number"
              placeholder="Taille min (cm)"
              value={filters.minHeight}
              onChange={(e) => setFilters({ ...filters, minHeight: e.target.value })}
              className="p-3 border rounded-lg"
            />
            <input
              type="number"
              placeholder="Taille max (cm)"
              value={filters.maxHeight}
              onChange={(e) => setFilters({ ...filters, maxHeight: e.target.value })}
              className="p-3 border rounded-lg"
            />
            <input
              type="number"
              placeholder="Poids min (kg)"
              value={filters.minWeight}
              onChange={(e) => setFilters({ ...filters, minWeight: e.target.value })}
              className="p-3 border rounded-lg"
            />
            <input
              type="number"
              placeholder="Poids max (kg)"
              value={filters.maxWeight}
              onChange={(e) => setFilters({ ...filters, maxWeight: e.target.value })}
              className="p-3 border rounded-lg"
            />
            <input
              type="text"
              placeholder="Niveau"
              value={filters.level}
              onChange={(e) => setFilters({ ...filters, level: e.target.value })}
              className="p-3 border rounded-lg"
            />
            <select
              value={filters.country}
              onChange={(e) => setFilters({ ...filters, country: e.target.value })}
              className="p-3 border rounded-lg"
            >
              <option value="">Tous les pays</option>
              {countries.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="mt-4 w-full p-3 bg-blue-500 text-white rounded-lg font-semibold">
            Rechercher
          </button>
        </form>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user) => (
            <div key={user.id} className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold mb-2">
                {user.firstName} {user.lastName}
              </h3>
              <div className="text-gray-600 space-y-1 mb-4">
                <p>📏 {user.height || '-'} cm | ⚖️ {user.weight || '-'} kg</p>
                <p>🏆 {user.level || '-'}</p>
                <p>📍 {user.country}{user.region ? `, ${user.region}` : ''}</p>
              </div>
              <button
                onClick={() => navigate(`/profile/${user.id}`)}
                className="w-full p-3 bg-blue-500 text-white rounded-lg font-semibold"
              >
                Voir le profil
              </button>
            </div>
          ))}
        </div>

        {users.length === 0 && (
          <p className="text-center text-gray-500 mt-10">Aucun partenaire trouvé. Essayez d'autres critères.</p>
        )}
      </div>
    </div>
  );
}