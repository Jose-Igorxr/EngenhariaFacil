// src/pages/Dashboard.jsx
import React from 'react';
import '../styles/Dashboard.css';

const Dashboard = () => { // Renomeei pra Dashboard conforme você pediu
  return (
    <div className="dashboard-container">
      <div className="dashboard-box">
        <h2 className="title">Bem-vindo ao Dashboard!</h2>
        <p className="welcome-text">Esta é a tela inicial após o login.</p>
      </div>
    </div>
  );
};

export default Dashboard;