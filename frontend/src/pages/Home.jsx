// src/pages/Home.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Home.css'; // Crie este arquivo CSS

const Home = () => {
  return (
    <div className="hero-container">
      <div className="hero-overlay"></div> {}
      <div className="hero-content">
        <h1 className="hero-title">
          Bem-vindo ao futuro da tecnologia e construção
        </h1>
        <Link to="/predict" className="hero-cta-button">
          Faça já sua estimativa
        </Link>
      </div>
      {}
    </div>
  );
};

export default Home;
