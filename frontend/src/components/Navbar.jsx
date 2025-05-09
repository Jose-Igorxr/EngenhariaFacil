import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { COMPANY_NAME } from '../constants/company';
import '../styles/Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/login');
  };

  return (
    <header className="navbar">
      <div className="logo">{COMPANY_NAME}</div>
      <nav className="nav-menu">
        <Link to="/home" className="nav-link">INÍCIO</Link>
        <Link to="/predict" className="nav-link">CALCULAR MATERIAIS</Link>
        <Link to="/perfil" className="nav-link">PERFIL</Link>
        <Link to="/sobre" className="nav-link">SOBRE</Link>
        <button onClick={handleLogout} className="logout-link">
          SAIR
        </button>
      </nav>
    </header>
  );
};

export default Navbar;