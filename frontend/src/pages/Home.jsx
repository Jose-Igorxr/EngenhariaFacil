// src/pages/Home.jsx
import React from 'react';
import '../styles/Home.css';
import { Link } from 'react-router-dom';

const Home = () => { // Renomeei pra Home conforme você pediu
  return (
    <div className="Home-container">
      <div className="Home-box">
        <h2 className="title">Bem-vindo ao Home!</h2>
      </div>
    </div>
  );
};

export default Home;