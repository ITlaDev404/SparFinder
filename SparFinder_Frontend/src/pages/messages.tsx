import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface User {
  id: number;
  firstName: string;
  lastName: string;
}

export default function Messages() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<{ id: number } | null>(null);
  const [conversations, setConversations] = useState<User[]>([]);

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
    const allMessages = await fetch('/api/messages').then(r => r.json());
    const userIds = new Set<number>();
    
    allMessages
      .filter((m: any) => m.senderId === userId || m.receiverId === userId)
      .forEach((m: any) => {
        if (m.senderId === userId) userIds.add(m.receiverId);
        else userIds.add(m.senderId);
      });

    const users = await Promise.all(
      Array.from(userIds).map(async (id) => {
        const res = await fetch(`/api/users/${id}`);
        return (await res.json())[0];
      })
    );
    setConversations(users.filter(Boolean));
  };

  return (
    <div className="min-h-screen bg-gray-100 p-5">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Messages</h1>
          <button onClick={() => navigate('/search')} className="text-blue-500">← Retour</button>
        </div>

        <div className="space-y-4">
          {conversations.map((user) => (
            <div
              key={user.id}
              onClick={() => navigate(`/chat/${user.id}`)}
              className="bg-white rounded-xl shadow-lg p-6 cursor-pointer hover:bg-gray-50"
            >
              <h3 className="text-xl font-bold">{user.firstName} {user.lastName}</h3>
            </div>
          ))}

          {conversations.length === 0 && (
            <p className="text-center text-gray-500 py-10">Aucun message</p>
          )}
        </div>
      </div>
    </div>
  );
}