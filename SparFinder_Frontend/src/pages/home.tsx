import { Link } from 'react-router-dom';

const sports = [
  { name: 'MMA', icon: '🥊', desc: 'Arts Martiaux Mixtes' },
  { name: 'Boxe', icon: '🏅', desc: 'Sport de combat' },
  { name: 'Kickboxing', icon: '🦵', desc: 'Poings et pieds' },
  { name: 'Lutte', icon: '🤼', desc: 'Combat au sol' },
  { name: 'Judo', icon: '🥋', desc: 'Art martial' },
  { name: 'Taekwondo', icon: '🔶', desc: 'Art martial coréen' },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-6xl mx-auto px-5 py-24">
          <div className="text-center animate-fade-in">
            <div className="inline-block px-4 py-2 bg-blue-500/30 rounded-full text-blue-300 text-sm mb-6">
              Trouve ton partenaire de combat
            </div>
            <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
              SparFinder
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-10 max-w-2xl mx-auto">
              La plateforme pour trouver des partenaires d'entraînement dans tous les sports de combat
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/login" 
                className="px-8 py-4 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 hover:scale-105 transition-all duration-300 shadow-lg shadow-blue-500/30"
              >
                Se connecter
              </Link>
              <Link 
                to="/signup" 
                className="px-8 py-4 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/20 border border-white/20 hover:scale-105 transition-all duration-300"
              >
                Créer un compte
              </Link>
            </div>
          </div>

          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/5 backdrop-blur rounded-2xl p-6 border border-white/10 hover:border-blue-500/50 transition-all duration-300 hover:-translate-y-2">
              <div className="w-14 h-14 bg-blue-500/20 rounded-xl flex items-center justify-center text-3xl mb-4">🔍</div>
              <h3 className="text-xl font-bold mb-2">Recherche</h3>
              <p className="text-gray-400">Trouve des partenaires selon ta localisation, niveau et sport</p>
            </div>
            <div className="bg-white/5 backdrop-blur rounded-2xl p-6 border border-white/10 hover:border-purple-500/50 transition-all duration-300 hover:-translate-y-2">
              <div className="w-14 h-14 bg-purple-500/20 rounded-xl flex items-center justify-center text-3xl mb-4">🤝</div>
              <h3 className="text-xl font-bold mb-2">Sparring</h3>
              <p className="text-gray-400">Envoyez des demandes et organisez vos sessions d'entraînement</p>
            </div>
            <div className="bg-white/5 backdrop-blur rounded-2xl p-6 border border-white/10 hover:border-green-500/50 transition-all duration-300 hover:-translate-y-2">
              <div className="w-14 h-14 bg-green-500/20 rounded-xl flex items-center justify-center text-3xl mb-4">💬</div>
              <h3 className="text-xl font-bold mb-2">Communauté</h3>
              <p className="text-gray-400">Échangez avec d'autres combattants et progressez ensemble</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto py-20 px-5">
        <h2 className="text-4xl font-bold text-center mb-4">Les sports disponibles</h2>
        <p className="text-gray-600 text-center mb-12">Choisissez parmi une large sélection de sports de combat</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {sports.map((sport, index) => (
            <div 
              key={sport.name} 
              className="bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-2xl hover:scale-105 transition-all duration-300 border border-gray-100"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="text-6xl mb-4">{sport.icon}</div>
              <h3 className="text-2xl font-bold mb-2 text-gray-800">{sport.name}</h3>
              <p className="text-gray-500">{sport.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-20 px-5">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl font-bold mb-6">Prêt à commencer ?</h2>
          <p className="text-xl mb-8 opacity-90">Rejoignez des milliers de combattants partout en France</p>
          <Link 
            to="/signup" 
            className="inline-block px-10 py-4 bg-white text-blue-600 rounded-xl font-bold text-lg hover:scale-105 transition-all duration-300 shadow-lg"
          >
            Inscription gratuite
          </Link>
        </div>
      </div>

      <footer className="bg-gray-900 text-gray-400 py-12 px-5">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h4 className="text-white font-bold text-xl mb-4">SparFinder</h4>
            <p className="text-sm">La plateforme n°1 pour trouver des partenaires de sparring</p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Liens rapides</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/login" className="hover:text-white">Connexion</Link></li>
              <li><Link to="/signup" className="hover:text-white">Inscription</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Sports</h4>
            <ul className="space-y-2 text-sm">
              <li>MMA</li>
              <li>Boxe</li>
              <li>Judo</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Contact</h4>
            <p className="text-sm">contact@sparfinder.fr</p>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-8 pt-8 border-t border-gray-800 text-center text-sm">
          © 2026 SparFinder. Tous droits réservés.
        </div>
      </footer>
    </div>
  );
}
