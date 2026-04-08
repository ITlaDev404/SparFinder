import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '../components/Toast';
import Loader from '../components/Loader';

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

export default function Profile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [sports, setSports] = useState<any[]>([]);
  const [allSports, setAllSports] = useState<any[]>([]);
  const [selectedSport, setSelectedSport] = useState<number>(1);
  const [requests, setRequests] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    height: '',
    weight: '',
    level: '',
    location: '',
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id) {
      navigate('/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await fetch(`/api/users/${id}`);
        const data = await res.json();
        if (data.length > 0) {
          setUser(data[0]);
          setFormData({
            height: data[0].height?.toString() || '',
            weight: data[0].weight?.toString() || '',
            level: data[0].level || '',
            location: data[0].location || '',
          });
        }

        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        setIsOwner(currentUser.id === Number(id));

        const sportsRes = await fetch(`/api/users/${id}/sports`);
        setSports(await sportsRes.json());

        const allSportsRes = await fetch('/api/users/sports');
        setAllSports(await allSportsRes.json());

        const requestsRes = await fetch(`/api/sparring/received/${id}`);
        setRequests(await requestsRes.json());
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch(`/api/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        height: Number(formData.height),
        weight: Number(formData.weight),
        level: formData.level,
        location: formData.location,
      }),
    });
    showToast('Profil mis à jour !', 'success');
  };

  const handleSendRequest = async () => {
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (!currentUser.id) return;

    await fetch('/api/sparring', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        senderId: currentUser.id,
        receiverId: Number(id),
        sportId: selectedSport,
      }),
    });
    showToast('Demande envoyée !', 'success');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-5">
      <div className="max-w-2xl mx-auto">
        <button onClick={() => navigate('/search')} className="mb-4 text-blue-500">← Back</button>
        
        {loading ? (
          <Loader />
        ) : user && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h1 className="text-3xl font-bold mb-6">
              {user.firstName} {user.lastName}
            </h1>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div><strong>Height:</strong> {user.height} cm</div>
              <div><strong>Weight:</strong> {user.weight} kg</div>
              <div><strong>Level:</strong> {user.level}</div>
              <div><strong>Location:</strong> {user.location}</div>
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Sports</h2>
              <div className="flex gap-2 flex-wrap">
                {sports.map((sport) => (
                  <span key={sport.id} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    {sport.name}
                  </span>
                ))}
              </div>
            </div>

            {isOwner ? (
              <form onSubmit={handleUpdate} className="flex flex-col gap-4">
                <input
                  type="number"
                  placeholder="Height (cm)"
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                  className="p-3 border rounded-lg"
                />
                <input
                  type="number"
                  placeholder="Weight (kg)"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  className="p-3 border rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Level"
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  className="p-3 border rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="p-3 border rounded-lg"
                />
                <button type="submit" className="p-3 bg-green-500 text-white rounded-lg font-semibold">
                  Update Profile
                </button>
              </form>
            ) : (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Select Sport</label>
                  <select
                    value={selectedSport}
                    onChange={(e) => setSelectedSport(Number(e.target.value))}
                    className="w-full p-3 border rounded-lg"
                  >
                    {allSports.map((sport) => (
                      <option key={sport.id} value={sport.id}>
                        {sport.name}
                      </option>
                    ))}
                  </select>
                </div>
                <button onClick={handleSendRequest} className="w-full p-3 bg-blue-500 text-white rounded-lg font-semibold">
                  Send Sparring Request
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
