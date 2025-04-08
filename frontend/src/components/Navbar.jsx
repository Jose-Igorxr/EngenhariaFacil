// src/components/Navbar.jsx
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { COMPANY_NAME } from '../constants/company';
import '../styles/Navbar.css'; // Novo arquivo de estilo pra navbar

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token'); // Remove o token
    navigate('/'); // Redireciona pro login
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
      <h1>{COMPANY_NAME}</h1>
      </div>
      <ul className="navbar-links">
        <li><Link to="/dashboard" className="nav-link">INÍCIO</Link></li>
        <li><Link to="/sobre" className="nav-link">SOBRE</Link></li>
        <li>
          <button onClick={handleLogout} className="logout-button">
            SAIR
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;