import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '../components/Toast';
import Loader from '../components/Loader';
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

const regions: Record<string, string[]> = {
  'France': ['Île-de-France', 'Auvergne-Rhône-Alpes', 'Nouvelle-Aquitaine', 'Occitanie', 'Hauts-de-France', 'Provence-Alpes-Côte d\'Azur', 'Grand Est', 'Bretagne', 'Pays de la Loire', 'Normandie'],
  'Belgique': ['Bruxelles', 'Wallonie', 'Flamande'],
  'Suisse': ['Zurich', 'Genève', 'Vaud', 'Berne'],
  'Canada': ['Québec', 'Ontario', 'Colombie-Britannique', 'Alberta'],
  'Maroc': ['Casablanca', 'Rabat', 'Marrakech', 'Fès', 'Tanger'],
  'Belgique': ['Bruxelles', 'Wallonie', 'Flandre'],
};

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
    country: '',
    region: '',
  });
  const [showSportSelector, setShowSportSelector] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id) {
      navigate('/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        const data = await apiCall(`/users/${id}`);
        if (Array.isArray(data) && data.length > 0) {
          setUser(data[0]);
          setFormData({
            height: data[0].height?.toString() || '',
            weight: data[0].weight?.toString() || '',
            level: data[0].level || '',
            country: data[0].country || '',
            region: data[0].region || '',
          });
        }

        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        setIsOwner(currentUser.id === Number(id));

        const sportsRes = await apiCall(`/users/${id}/sports`);
        setSports(Array.isArray(sportsRes) ? sportsRes : []);

        const allSportsRes = await apiCall('/users/sports');
        setAllSports(Array.isArray(allSportsRes) ? allSportsRes : []);

        const requestsRes = await apiCall(`/sparring/received/${id}`);
        setRequests(Array.isArray(requestsRes) ? requestsRes : []);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    await apiCall(`/users/${id}`, {
      method: 'PUT',
      body: {
        height: Number(formData.height),
        weight: Number(formData.weight),
        level: formData.level,
        country: formData.country,
        region: formData.region,
      },
    });
    showToast('Profil mis à jour !', 'success');
  };

  const handleAddSport = async (sportId: number) => {
    await apiCall(`/users/${id}/sports`, {
      method: 'POST',
      body: { sportId },
    });
    const sportsRes = await apiCall(`/users/${id}/sports`);
    setSports(Array.isArray(sportsRes) ? sportsRes : []);
    setShowSportSelector(false);
    showToast('Sport ajouté !', 'success');
  };

  const handleRemoveSport = async (sportId: number) => {
    await apiCall(`/users/${id}/sports/${sportId}`, { method: 'DELETE' });
    const sportsRes = await apiCall(`/users/${id}/sports`);
    setSports(Array.isArray(sportsRes) ? sportsRes : []);
    showToast('Sport supprimé !', 'success');
  };

  const handleSendRequest = async () => {
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (!currentUser.id) return;

    await apiCall('/sparring', {
      method: 'POST',
      body: {
        senderId: currentUser.id,
        receiverId: Number(id),
        sportId: selectedSport,
      },
    });
    showToast('Demande envoyée !', 'success');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-5">
      <div className="max-w-2xl mx-auto">
        <button onClick={() => navigate('/search')} className="mb-4 text-blue-500">← Retour</button>
        
        {loading ? (
          <Loader />
        ) : user && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h1 className="text-3xl font-bold mb-6">
              {user.firstName} {user.lastName}
            </h1>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div><strong>Taille:</strong> {user.height || '-'} cm</div>
              <div><strong>Poids:</strong> {user.weight || '-'} kg</div>
              <div><strong>Niveau:</strong> {user.level || '-'}</div>
              <div><strong>Pays:</strong> {user.country || '-'}</div>
              <div><strong>Région:</strong> {user.region || '-'}</div>
            </div>

            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-semibold">Sports pratiqués</h2>
                {isOwner && (
                  <button 
                    onClick={() => setShowSportSelector(!showSportSelector)}
                    className="text-blue-500 text-sm"
                  >
                    + Ajouter
                  </button>
                )}
              </div>
              
              {showSportSelector && (
                <div className="mb-4 p-4 bg-gray-100 rounded-lg">
                  <select
                    onChange={(e) => {
                      if (e.target.value) handleAddSport(Number(e.target.value));
                    }}
                    className="w-full p-2 border rounded-lg mb-2"
                    defaultValue=""
                  >
                    <option value="">Sélectionner un sport...</option>
                    {allSports
                      .filter(s => !sports.some(us => us.id === s.id))
                      .map(sport => (
                        <option key={sport.id} value={sport.id}>{sport.name}</option>
                      ))
                    }
                  </select>
                </div>
              )}
              
              <div className="flex gap-2 flex-wrap">
                {sports.map((sport) => (
                  <span key={sport.id} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-2">
                    {sport.name}
                    {isOwner && (
                      <button 
                        onClick={() => handleRemoveSport(sport.id)}
                        className="text-red-500 hover:text-red-700 font-bold"
                      >
                        ×
                      </button>
                    )}
                  </span>
                ))}
                {sports.length === 0 && (
                  <p className="text-gray-500 text-sm">Aucun sport ajouté</p>
                )}
              </div>
            </div>

            {isOwner ? (
              <form onSubmit={handleUpdate} className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="number"
                    placeholder="Taille (cm)"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                    className="p-3 border rounded-lg"
                  />
                  <input
                    type="number"
                    placeholder="Poids (kg)"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    className="p-3 border rounded-lg"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Niveau (Débutant, Intermédiaire, Avancé, Expert)"
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  className="p-3 border rounded-lg"
                />
                <div className="grid grid-cols-2 gap-4">
                  <select
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value, region: '' })}
                    className="p-3 border rounded-lg"
                  >
                    <option value="">Sélectionner un pays</option>
                    {countries.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <select
                    value={formData.region}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                    className="p-3 border rounded-lg"
                    disabled={!formData.country}
                  >
                    <option value="">Sélectionner une région</option>
                    {(regions[formData.country] || []).map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <button type="submit" className="p-3 bg-green-500 text-white rounded-lg font-semibold">
                  Mettre à jour le profil
                </button>
              </form>
            ) : (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Sélectionner un sport</label>
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
                  Envoyer une demande de sparring
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}