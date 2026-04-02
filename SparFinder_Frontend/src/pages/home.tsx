import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-5">
      <div className="text-center mb-10">
        <h1 className="text-5xl font-bold text-gray-800 mb-4">SparFinder</h1>
        <p className="text-xl text-gray-600">Trouvez votre partenaire de sparring idéal</p>
      </div>
      <div className="flex gap-4">
        <Link to="/login" className="px-8 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600">
          Login
        </Link>
        <Link to="/signup" className="px-8 py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300">
          Sign Up
        </Link>
      </div>
    </div>
  );
}
