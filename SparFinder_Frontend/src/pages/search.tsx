import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  height: number;
  weight: number;
  level: string;
  location: string;
}

export default function Search() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [filters, setFilters] = useState({
    minHeight: '',
    maxHeight: '',
    minWeight: '',
    maxWeight: '',
    level: '',
    location: '',
    sport: '',
  });

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/users');
    let data = await res.json();

    if (filters.minHeight) {
      data = data.filter((u: User) => u.height >= Number(filters.minHeight));
    }
    if (filters.maxHeight) {
      data = data.filter((u: User) => u.height <= Number(filters.maxHeight));
    }
    if (filters.minWeight) {
      data = data.filter((u: User) => u.weight >= Number(filters.minWeight));
    }
    if (filters.maxWeight) {
      data = data.filter((u: User) => u.weight <= Number(filters.maxWeight));
    }
    if (filters.level) {
      data = data.filter((u: User) => u.level?.toLowerCase().includes(filters.level.toLowerCase()));
    }
    if (filters.location) {
      data = data.filter((u: User) => u.location?.toLowerCase().includes(filters.location.toLowerCase()));
    }

    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    data = data.filter((u: User) => u.id !== currentUser.id);

    setUsers(data);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-5">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Find Sparring Partners</h1>
          <button
            onClick={() => {
              localStorage.removeItem('user');
              navigate('/login');
            }}
            className="px-4 py-2 bg-red-500 text-white rounded-lg"
          >
            Logout
          </button>
        </div>

        <form onSubmit={handleSearch} className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <input
              type="number"
              placeholder="Min Height (cm)"
              value={filters.minHeight}
              onChange={(e) => setFilters({ ...filters, minHeight: e.target.value })}
              className="p-3 border rounded-lg"
            />
            <input
              type="number"
              placeholder="Max Height (cm)"
              value={filters.maxHeight}
              onChange={(e) => setFilters({ ...filters, maxHeight: e.target.value })}
              className="p-3 border rounded-lg"
            />
            <input
              type="number"
              placeholder="Min Weight (kg)"
              value={filters.minWeight}
              onChange={(e) => setFilters({ ...filters, minWeight: e.target.value })}
              className="p-3 border rounded-lg"
            />
            <input
              type="number"
              placeholder="Max Weight (kg)"
              value={filters.maxWeight}
              onChange={(e) => setFilters({ ...filters, maxWeight: e.target.value })}
              className="p-3 border rounded-lg"
            />
            <input
              type="text"
              placeholder="Level"
              value={filters.level}
              onChange={(e) => setFilters({ ...filters, level: e.target.value })}
              className="p-3 border rounded-lg"
            />
            <input
              type="text"
              placeholder="Location"
              value={filters.location}
              onChange={(e) => setFilters({ ...filters, location: e.target.value })}
              className="p-3 border rounded-lg"
            />
          </div>
          <button type="submit" className="mt-4 w-full p-3 bg-blue-500 text-white rounded-lg font-semibold">
            Search
          </button>
        </form>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user) => (
            <div key={user.id} className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold mb-2">
                {user.firstName} {user.lastName}
              </h3>
              <div className="text-gray-600 space-y-1 mb-4">
                <p>📏 {user.height} cm | ⚖️ {user.weight} kg</p>
                <p>🏆 {user.level}</p>
                <p>📍 {user.location}</p>
              </div>
              <button
                onClick={() => navigate(`/profile/${user.id}`)}
                className="w-full p-3 bg-blue-500 text-white rounded-lg font-semibold"
              >
                View Profile
              </button>
            </div>
          ))}
        </div>

        {users.length === 0 && (
          <p className="text-center text-gray-500 mt-10">No partners found. Try adjusting your filters.</p>
        )}
      </div>
    </div>
  );
}
