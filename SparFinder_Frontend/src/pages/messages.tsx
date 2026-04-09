import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiCall } from '../utils/api';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  country: string;
  region: string;
}

export default function Messages() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<{ id: number } | null>(null);
  const [conversations, setConversations] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id) {
      navigate('/login');
      return;
    }
    setCurrentUser(user);
    loadConversations(user.id);
  }, [navigate]);

  const loadConversations = async (userId: number) => {
    setLoading(true);
    
    const [received, sent] = await Promise.all([
      apiCall(`/sparring/received/${userId}`),
      apiCall(`/sparring/sent/${userId}`)
    ]);

    const userIds = new Set<number>();

    if (Array.isArray(received)) {
      received
        .filter((r: any) => r.status === 'accepted')
        .forEach((r: any) => userIds.add(r.senderId));
    }

    if (Array.isArray(sent)) {
      sent
        .filter((r: any) => r.status === 'accepted')
        .forEach((r: any) => userIds.add(r.receiverId));
    }

    const users = await Promise.all(
      Array.from(userIds).map(async (id) => {
        const res = await apiCall(`/users/${id}`);
        return Array.isArray(res) ? res[0] : null;
      })
    );
    setConversations(users.filter(Boolean));
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-5">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Messages</h1>
          <button onClick={() => navigate('/search')} className="text-blue-500">← Retour</button>
        </div>

        {loading ? (
          <p className="text-center text-gray-500">Chargement...</p>
        ) : (
          <div className="space-y-4">
            {conversations.map((user) => (
              <div
                key={user.id}
                onClick={() => navigate(`/chat/${user.id}`)}
                className="bg-white rounded-xl shadow-lg p-6 cursor-pointer hover:bg-gray-50"
              >
                <h3 className="text-xl font-bold">{user.firstName} {user.lastName}</h3>
                <p className="text-gray-500 text-sm">{user.country}{user.region ? `, ${user.region}` : ''}</p>
              </div>
            ))}

            {conversations.length === 0 && (
              <div className="text-center py-10">
                <p className="text-gray-500 mb-4">Aucune conversation</p>
                <p className="text-sm text-gray-400">Acceptez des demandes de sparring pour discuter</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}