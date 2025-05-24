import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiLogOut } from 'react-icons/fi'; // ícone de logout
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
        <Link to="/home" className="nav-link"><b>INÍCIO</b></Link>
        <Link to="/perfil" className="nav-link"><b>PERFIL</b></Link>
        <Link to="/sobre" className="nav-link"><b>SOBRE</b></Link>
        <Link to="/postagens" className="nav-link"><b>POSTAGENS</b></Link>
        <Link to="/minhas-postagens" className="nav-link"><b>POSTAGENS PESSOAIS</b></Link>
        <button onClick={handleLogout} className="logout-button" title="Sair">
          <FiLogOut size={20} />
        </button>
      </nav>
    </header>
  );
};

export default Navbar;
