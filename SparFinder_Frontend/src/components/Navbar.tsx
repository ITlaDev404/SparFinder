import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [menuOpen, setMenuOpen] = useState(false);

  const isAuthPage = location.pathname === '/' || location.pathname === '/login' || location.pathname === '/signup';

  if (isAuthPage || !user.id) return null;

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md p-4">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <Link to="/search" className="text-2xl font-bold text-blue-500">SparFinder</Link>
        
        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>

        <div className={`md:flex items-center gap-6 ${menuOpen ? 'absolute top-16 left-0 right-0 bg-white p-4 flex-col shadow-md' : 'hidden'}`}>
          <Link to="/search" className="text-gray-700 hover:text-blue-500 block py-2">Rechercher</Link>
          <Link to="/my-requests" className="text-gray-700 hover:text-blue-500 block py-2">Demandes</Link>
          <Link to="/messages" className="text-gray-700 hover:text-blue-500 block py-2">Messages</Link>
          <Link to={`/profile/${user.id}`} className="text-gray-700 hover:text-blue-500 block py-2">
            {user.firstName || 'Profil'}
          </Link>
          <button onClick={handleLogout} className="text-red-500 hover:text-red-700 block py-2">Logout</button>
        </div>
      </div>
    </nav>
  );
}