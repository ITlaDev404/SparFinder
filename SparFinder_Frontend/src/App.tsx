import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/home';
import Login from './pages/login';
import SignUp from './pages/signup';
import Profile from './pages/profile';
import Search from './pages/search';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/profile/:id" element={<Profile />} />
        <Route path="/search" element={<Search />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App;
