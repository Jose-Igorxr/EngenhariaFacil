// src/components/PrivateLayout.jsx
import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

const PrivateLayout = ({ children }) => {
  return (
    <div className="app-container">
      <Navbar />
      <div className="main-content">
        {children}
      </div>
      <Footer />
    </div>
  );
};

export default PrivateLayout;
