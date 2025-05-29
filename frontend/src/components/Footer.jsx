// src/components/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { COMPANY_NAME } from '../constants/company'; // Reutilizando sua constante
import '../styles/Footer.css'; // Novo arquivo CSS para o Footer
import { FiInstagram, FiFacebook, FiTwitter } from 'react-icons/fi'; // Ícones de redes sociais (exemplo)

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-info">
          <p className="copyright-text">
            &copy; {currentYear} {COMPANY_NAME}. Todos os direitos reservados.
          </p>
        </div>
        </div>
    </footer>
  );
};

export default Footer;