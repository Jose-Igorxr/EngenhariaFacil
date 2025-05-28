import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Cadastro from './pages/Cadastro';
import LandingPage from './pages/LandingPage';
import Home from './pages/Home';
import Perfil from './pages/Perfil';
import Sobre from './pages/Sobre';

import PostagensList from './pages/PostagensList';
import PostagemDetalhada from './pages/PostagemDetalhada';
import MinhasPostagens from './pages/MinhasPostagens';
import PrivateLayout from './components/PrivateLayout';
import EditarPostagem from './pages/EditarPostagem';
import CriarPostagem from './pages/CriarPostagem';

import Predict from './pages/Predict';
import './App.css';

const PrivateRoute = ({ element }) => {
  const token = localStorage.getItem('access_token');
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
      <Route path="/postagens" element={<PrivateRoute element={<PostagensList />} />} />
      <Route path="/postagens/:id" element={<PrivateRoute element={<PostagemDetalhada />} />} />
      <Route path="/minhas-postagens" element={<PrivateRoute element={<MinhasPostagens />} />} />
      <Route path="/criar-postagem" element={<PrivateRoute element={<CriarPostagem />} />} />
      <Route path="/editar-postagem/:id" element={<PrivateRoute element={<EditarPostagem />} />} />
      <Route path="/predict" element={<PrivateRoute element={<Predict />} />} />
    </Routes>
  );
}

export default App;