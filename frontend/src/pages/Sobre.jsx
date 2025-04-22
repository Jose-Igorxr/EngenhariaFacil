// src/pages/Sobre.jsx
import React from 'react';
import '../styles/Sobre.css';
import { COMPANY_NAME } from '../constants/company';

const Sobre = () => {
  return (
    <section className="about-section">
  <div className="about-container">
    <div className="about-text-content">
      <h2>
        Ajudando pessoas a <span className="highlight">construírem com confiança</span>
      </h2>
      <p>
        Nossa plataforma foi criada para descomplicar o início de obras civis. Facilitamos a busca por materiais, e estimativas de consumo com o apoio da inteligência artificial.
      </p>
      <p className="subtext">
        Acreditamos que toda construção deve começar com informação clara, apoio técnico e praticidade.
      </p>
      <a href="#inicio" className="about-button">Comece agora</a>
    </div>

    <div className="about-image">
      <img src={'src/assets/images/ia-na-construcao-civil-scaled.jpg'} alt="Imagem representativa da nossa plataforma" />
    </div>
  </div>

  <div className="developers-container">
    <h3>Desenvolvedores</h3>
    <div className="developer-cards">
      <div className="developer-card">
        <span className="dev-avatar">RA</span>
        <p>Renan Amorim</p>
      </div>
      <div className="developer-card">
        <span className="dev-avatar">MG</span>
        <p>José Igor</p>
      </div>
    </div>
  </div>


</section>
  );
};

export default Sobre;