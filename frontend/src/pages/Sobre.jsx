// src/pages/Sobre.jsx
import React from 'react';
import { Link } from 'react-router-dom'; // Importado Link
import { motion } from 'framer-motion';
import '../styles/Sobre.css';
// import { COMPANY_NAME } from '../constants/company'; // COMPANY_NAME não está sendo usado neste JSX

// Importe a imagem corretamente. Ajuste o caminho se a estrutura do seu projeto for diferente.
// Assumindo que 'assets' está na pasta 'src'.
import imagemSobre from '../assets/images/ia-na-construcao-civil-scaled.jpg';

const Sobre = () => {
  const sectionVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.6, ease: "easeOut" } 
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.15,
        duration: 0.5,
        ease: "easeOut",
      },
    }),
  };

  const developers = [
    { initials: 'RA', name: 'Renan Amorim' },
    { initials: 'JI', name: 'José Igor' },
    // Adicione mais desenvolvedores aqui se necessário
  ];

  return (
    <div className="sobre-page-container"> {/* Container principal para sticky footer */}
      <motion.section 
        className="about-section-main"
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
      >
        <div className="about-container-grid">
          <motion.div className="about-text-content" variants={itemVariants} custom={0}>
            <h2>
              Ajudando pessoas a <span className="highlight">construírem com confiança</span>
            </h2>
            <p>
              Nossa plataforma foi criada para descomplicar o início de obras civis. Facilitamos a busca por materiais e estimativas de consumo com o apoio da inteligência artificial.
            </p>
            <p className="subtext">
              Acreditamos que toda construção deve começar com informação clara, apoio técnico e praticidade, capacitando tanto cidadãos quanto profissionais da área.
            </p>
            <Link to="/predict" className="about-cta-button"> {/* Usando Link e classe de botão CTA */}
              Comece sua estimativa agora
            </Link>
          </motion.div>

          <motion.div className="about-image-wrapper" variants={itemVariants} custom={1}>
            <img src={imagemSobre} alt="Inteligência Artificial na Construção Civil" />
          </motion.div>
        </div>
      </motion.section>

      <motion.section 
        className="developers-section"
        initial="hidden"
        whileInView="visible" // Anima quando entra na viewport
        viewport={{ once: true, amount: 0.3 }}
        variants={sectionVariants}
      >
        <div className="developers-container-content">
          <h3 className="section-title">Nossos Desenvolvedores</h3>
          <div className="developer-cards-grid">
            {developers.map((dev, index) => (
              <motion.div 
                className="developer-card-item" 
                key={dev.name}
                custom={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.5 }}
                variants={itemVariants}
                whileHover={{ y: -6, boxShadow: "0 10px 20px rgba(0,0,0,0.12)"}}
              >
                <div className="dev-avatar">{dev.initials}</div>
                <p className="dev-name">{dev.name}</p>
                {/* <p className="dev-role">Full Stack Developer</p>  Exemplo de papel */}
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>
    </div>
  );
};

export default Sobre;
