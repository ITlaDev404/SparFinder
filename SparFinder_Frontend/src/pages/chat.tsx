import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiCall } from '../utils/api';

interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  createdAt: string;
}

interface User {
  id: number;
  firstName: string;
  lastName: string;
}

export default function Chat() {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [currentUser, setCurrentUser] = useState<{ id: number } | null>(null);
  const [otherUser, setOtherUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id) {
      navigate('/login');
      return;
    }
    setCurrentUser(user);

    const loadChat = async () => {
      const otherRes = await apiCall(`/users/${userId}`);
      setOtherUser(Array.isArray(otherRes) ? otherRes[0] : null);

      const msgRes = await apiCall(`/messages/conversation/${user.id}/${userId}`);
      setMessages(Array.isArray(msgRes) ? msgRes : []);
    };
    loadChat();
  }, [navigate, userId]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser) return;

    await apiCall('/messages', {
      method: 'POST',
      body: {
        senderId: currentUser.id,
        receiverId: Number(userId),
        content: newMessage
      }
    });

    setNewMessage('');
    const msgRes = await apiCall(`/messages/conversation/${currentUser.id}/${userId}`);
    setMessages(Array.isArray(msgRes) ? msgRes : []);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <div className="bg-white shadow p-4 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="text-blue-500">←</button>
        <h2 className="text-xl font-bold">
          {otherUser ? `${otherUser.firstName} ${otherUser.lastName}` : 'Chat'}
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.senderId === currentUser?.id ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[70%] p-3 rounded-lg ${msg.senderId === currentUser?.id ? 'bg-blue-500 text-white' : 'bg-white'}`}>
              <p>{msg.content}</p>
              <p className={`text-xs mt-1 ${msg.senderId === currentUser?.id ? 'text-blue-100' : 'text-gray-500'}`}>
                {msg.createdAt ? new Date(msg.createdAt).toLocaleString() : ''}
              </p>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSend} className="bg-white p-4 flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Tapez votre message..."
          className="flex-1 p-3 border rounded-lg"
        />
        <button type="submit" className="px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold">
          Envoyer
        </button>
      </form>
    </div>
  );
}