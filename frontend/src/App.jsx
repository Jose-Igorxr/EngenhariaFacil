import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Cadastro from './pages/Cadastro';
import LandingPage from './pages/LandingPage';
import Home from './pages/Home';
import Perfil from './pages/Perfil';
import Sobre from './pages/Sobre';
import PrivateLayout from './components/PrivateLayout';

const PrivateRoute = ({ element }) => {
  const token = localStorage.getItem('access_token'); // Alterado de 'token' para 'access_token'
  return token ? <PrivateLayout>{element}</PrivateLayout> : <Navigate to="/login" />;
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro" element={<Cadastro />} />
      <Route path="/home" element={<PrivateRoute element={<Home />} />} />
      <Route path="/perfil" element={<PrivateRoute element={<Perfil />} />} />
      <Route path="/sobre" element={<PrivateRoute element={<Sobre />} />} />
    </Routes>
  );
}

export default App