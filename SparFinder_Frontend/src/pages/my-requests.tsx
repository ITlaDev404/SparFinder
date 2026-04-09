import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiCall } from '../utils/api';

interface Request {
  id: number;
  senderId: number;
  receiverId: number;
  sportId: number;
  message: string;
  status: string;
  sender?: { firstName: string; lastName: string; level: string };
  receiver?: { firstName: string; lastName: string; level: string };
  sport?: { name: string };
}

export default function MyRequests() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<{ id: number } | null>(null);
  const [received, setReceived] = useState<Request[]>([]);
  const [sent, setSent] = useState<Request[]>([]);
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id) {
      navigate('/login');
      return;
    }
    setCurrentUser(user);
    loadRequests(user.id);
  }, [navigate]);

  const loadRequests = async (userId: number) => {
    const [recv, sentRes] = await Promise.all([
      apiCall(`/sparring/received/${userId}`),
      apiCall(`/sparring/sent/${userId}`)
    ]);

    if (recv.error) {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      navigate('/login');
      return;
    }

    setReceived(Array.isArray(recv) ? recv : []);
    setSent(Array.isArray(sentRes) ? sentRes : []);
  };

  const handleAccept = async (id: number) => {
    await apiCall(`/sparring/${id}/accept`, { method: 'PUT' });
    loadRequests(currentUser!.id);
  };

  const handleReject = async (id: number) => {
    await apiCall(`/sparring/${id}/reject`, { method: 'PUT' });
    loadRequests(currentUser!.id);
  };

  const requests = activeTab === 'received' ? received : sent;

  return (
    <div className="min-h-screen bg-gray-100 p-5">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Mes Demandes</h1>
          <button onClick={() => navigate('/search')} className="text-blue-500">← Retour</button>
        </div>

        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('received')}
            className={`px-6 py-3 rounded-lg font-semibold ${activeTab === 'received' ? 'bg-blue-500 text-white' : 'bg-white'}`}
          >
            Reçues ({received.length})
          </button>
          <button
            onClick={() => setActiveTab('sent')}
            className={`px-6 py-3 rounded-lg font-semibold ${activeTab === 'sent' ? 'bg-blue-500 text-white' : 'bg-white'}`}
          >
            Envoyées ({sent.length})
          </button>
        </div>

        <div className="space-y-4">
          {requests.map((req) => (
            <div key={req.id} className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold">
                    {activeTab === 'received' 
                      ? `${req.sender?.firstName} ${req.sender?.lastName}`
                      : `${req.receiver?.firstName} ${req.receiver?.lastName}`}
                  </h3>
                  <p className="text-gray-600">Niveau: {activeTab === 'received' ? req.sender?.level : req.receiver?.level}</p>
                  <p className="text-blue-600">Sport: {req.sport?.name}</p>
                </div>
                <span className={`px-4 py-2 rounded-full text-sm font-semibold
                  ${req.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                    req.status === 'accepted' ? 'bg-green-100 text-green-800' : 
                    'bg-red-100 text-red-800'}`}>
                  {req.status === 'pending' ? 'En attente' : req.status === 'accepted' ? 'Acceptée' : 'Refusée'}
                </span>
              </div>
              
              {req.message && (
                <p className="text-gray-600 mb-4">Message: {req.message}</p>
              )}

              {activeTab === 'received' && req.status === 'pending' && (
                <div className="flex gap-4">
                  <button
                    onClick={() => handleAccept(req.id)}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600"
                  >
                    Accepter
                  </button>
                  <button
                    onClick={() => handleReject(req.id)}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600"
                  >
                    Refuser
                  </button>
                </div>
              )}
            </div>
          ))}

          {requests.length === 0 && (
            <p className="text-center text-gray-500 py-10">Aucune demande {activeTab === 'received' ? 'reçue' : 'envoyée'}</p>
          )}
        </div>
      </div>
    </div>
  );
}