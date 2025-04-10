
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Cadastro from './pages/Cadastro';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import Sobre from './pages/Sobre';
import Perfil from './pages/Perfil';
import PrivateLayout from './components/PrivateLayout';

const PrivateRoute = ({ element }) => {
  const token = localStorage.getItem('token');
  return token ? <PrivateLayout>{element}</PrivateLayout> : <Navigate to="/login" />;
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} /> 
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro" element={<Cadastro />} />
      <Route path="/dashboard" element={<PrivateRoute element={<Dashboard />} />} />
      <Route path="/sobre" element={<PrivateRoute element={<Sobre />} />} />
      <Route path="/perfil" element={<PrivateRoute element={<Perfil />} />} />
    </Routes>
  );
}

export default App;
