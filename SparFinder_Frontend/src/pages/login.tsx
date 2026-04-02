import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (data.success) {
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/search');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch {
      setError('Server error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-5">
      <div className="bg-white rounded-xl shadow-lg p-10 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-8">Login</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full p-3 rounded-lg border border-gray-300 outline-none focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full p-3 rounded-lg border border-gray-300 outline-none focus:border-blue-500"
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <button type="submit" className="p-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600">
            Login
          </button>
        </form>
        <p className="text-center mt-6 text-sm">
          Don't have an account? <a href="/signup" className="text-blue-500 font-semibold">Sign up</a>
        </p>
      </div>
    </div>
  );
}
