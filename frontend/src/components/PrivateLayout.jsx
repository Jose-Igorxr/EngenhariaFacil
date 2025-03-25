// src/components/PrivateLayout.jsx
import React from 'react';
import Navbar from './Navbar';

const PrivateLayout = ({ children }) => {
  return (
    <div>
      <Navbar />
      {children}
    </div>
  );
};

export default PrivateLayout;