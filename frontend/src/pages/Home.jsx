// src/pages/Home.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion'; // Para animações sutis
import '../styles/Home.css';

const Home = () => {
  const heroContentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
        staggerChildren: 0.2 // Anima os filhos em sequência
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <div className="hero-container">
      <div className="hero-overlay"></div>
      <motion.div 
        className="hero-content"
        variants={heroContentVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h1 className="hero-title" variants={itemVariants}>
          Bem-vindo ao Futuro da Construção Inteligente
        </motion.h1>
        <motion.p className="hero-subtitle" variants={itemVariants}>
          Com <strong>Obra Fácil</strong>, transformamos a complexidade da construção em simplicidade e precisão.
          Utilize nossa Inteligência Artificial para estimar materiais, otimizar seus projetos e conectar-se
          com uma comunidade vibrante de profissionais e entusiastas.
        </motion.p>
        <motion.div variants={itemVariants}>
          <Link to="/predict" className="hero-cta-button">
            Faça sua Estimativa Agora
          </Link>
        </motion.div>

        <motion.div className="hero-quick-features" variants={itemVariants}>
          <div className="quick-feature">
            <span role="img" aria-label="Cálculo">📐</span>
            <p>Estimativas Rápidas</p>
          </div>
          <div className="quick-feature">
            <span role="img" aria-label="Economia">💰</span>
            <p>Planejamento Econômico</p>
          </div>
          <div className="quick-feature">
            <span role="img" aria-label="Comunidade">🤝</span>
            <p>Comunidade Ativa</p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Home;
