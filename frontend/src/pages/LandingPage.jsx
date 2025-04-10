import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { COMPANY_NAME } from '../constants/company';
import { FaClock, FaMoneyBillWave, FaUsers, FaLock, FaCheck, FaRocket, FaBuilding } from 'react-icons/fa';
import '../styles/LandingPage.css';

import image01 from '../assets/images/image - 01.jpeg';
import image02 from '../assets/images/image - 02.jpeg';
import image03 from '../assets/images/image - 03.jpeg';

const LandingPage = () => {
  const originalItems = [
    { src: image01, alt: 'Imagem 1', caption: 'Simplifique seus projetos com IA' },
    { src: image02, alt: 'Imagem 2', caption: 'Estimativas precisas em minutos' },
    { src: image03, alt: 'Imagem 3', caption: 'Construa com confiança' },
  ];

  const carouselItems = [
    originalItems[originalItems.length - 1],
    ...originalItems,
    originalItems[0],
  ];

  const [currentIndex, setCurrentIndex] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(true);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => prevIndex + 1);
    setIsTransitioning(true);
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => prevIndex - 1);
    setIsTransitioning(true);
  };

  const handleTransitionEnd = () => {
    if (currentIndex === 0) {
      setIsTransitioning(false);
      setCurrentIndex(carouselItems.length - 2);
    } else if (currentIndex === carouselItems.length - 1) {
      setIsTransitioning(false);
      setCurrentIndex(1);
    }
  };

  return (
    <div className="landing-container">
      <header className="landing-header">
        <div className="logo">{COMPANY_NAME}</div>
        <nav className="nav-menu">
          <Link to="/sobre">Sobre</Link>
          <Link to="#recursos">Recursos</Link>
          <Link to="#contato">Contato</Link>
          <Link to="/login" className="login-link">Entrar</Link>
        </nav>
      </header>

      <section className="hero">
        <div className="carousel-container">
          <button className="carousel-btn prev" onClick={prevSlide}>❮</button>
          <div className="carousel">
            <div
              className="carousel-inner"
              style={{
                transform: `translateX(-${currentIndex * 100}%)`,
                transition: isTransitioning ? 'transform 0.5s ease' : 'none',
              }}
              onTransitionEnd={handleTransitionEnd}
            >
              {carouselItems.map((item, index) => (
                <div key={index} className="carousel-item">
                  <img src={item.src} alt={item.alt} className="carousel-image" />
                  <div className="carousel-caption">{item.caption}</div>
                </div>
              ))}
            </div>
          </div>
          <button className="carousel-btn next" onClick={nextSlide}>❯</button>
        </div>
        <div className="hero-content">
          <h1>Planeje sua obra com inteligência</h1>
          <p>Descubra como a nossa plataforma simplifica o planejamento e a execução de projetos de construção com o uso de IA.</p>
          <Link to="/cadastro">
            <button className="cta-button">Comece Agora</button>
          </Link>
        </div>
      </section>

      <section id="recursos" className="features">
        <h2>Recursos que fazem a diferença</h2>
        <div className="features-list">
          <div className="feature-item">
            <FaClock className="feature-icon" />
            <h3>Agilidade</h3>
            <p>Obtenha estimativas em minutos e acelere o planejamento do seu projeto.</p>
          </div>
          <div className="feature-item">
            <FaMoneyBillWave className="feature-icon" />
            <h3>Eficiência</h3>
            <p>Reduza desperdícios e otimize os investimentos na sua obra.</p>
          </div>
          <div className="feature-item">
            <FaUsers className="feature-icon" />
            <h3>Comunidade</h3>
            <p>Conecte-se com outros profissionais e compartilhe experiências.</p>
          </div>
          <div className="feature-item">
            <FaLock className="feature-icon" />
            <h3>Segurança</h3>
            <p>Tenha a garantia de que seus dados estão sempre protegidos.</p>
          </div>
        </div>
      </section>

      <section className="testimonials">
        <h2>O que dizem nossos clientes</h2>
        <div className="testimonial-items">
          <div className="testimonial-item">
            <p>"A {COMPANY_NAME} transformou completamente a forma como planejamos nossas obras. Simples e eficiente!"</p>
            <span>- Carlos, Engenheiro</span>
          </div>
          <div className="testimonial-item">
            <p>"Economizei tempo e dinheiro utilizando a plataforma. Recomendo a todos!"</p>
            <span>- Marina, Arquiteta</span>
          </div>
          <div className="testimonial-item">
            <p>"A interface moderna e os recursos de planejamento me surpreenderam. Nunca foi tão fácil gerenciar um projeto!"</p>
            <span>- João, Gerente de Obras</span>
          </div>
          <div className="testimonial-item">
            <p>"Os planos se adaptam perfeitamente às necessidades de qualquer obra. Excelente custo-benefício!"</p>
            <span>- Fernanda, Designer de Interiores</span>
          </div>
        </div>
      </section>

      {/* Seção de Planos */}
      <section className="pricing">
        <h2>Escolha o Plano Perfeito para Sua Obra</h2>
        <p>Construa com confiança e eficiência com a Obra Fácil</p>
        <div className="pricing-cards">
          <div className="pricing-card basic">
            <h3><FaCheck /> Básico</h3>
            <p className="price">Grátis</p>
            <p className="description">Ideal para quem está começando ou testando a plataforma.</p>
            <ul>
              <li>Estimativas simples de materiais</li>
              <li>Limite de 3 projetos por mês</li>
              <li>Suporte básico via e-mail</li>
            </ul>
            <button>Assinar</button>
          </div>
          <div className="pricing-card professional">
            <h3><FaRocket /> Profissional</h3>
            <p className="price">R$ 49,90/mês</p>
            <p className="description">Para profissionais que buscam mais recursos e flexibilidade.</p>
            <ul>
              <li>Estimativas ilimitadas</li>
              <li>Exportação de relatórios em PDF</li>
              <li>Suporte prioritário via chat</li>
              <li>Acesso ao histórico de projetos</li>
            </ul>
            <button>Assinar</button>
          </div>
          <div className="pricing-card enterprise highlighted">
            <div className="highlight-badge">Mais Popular</div>
            <h3><FaBuilding /> Empresarial</h3>
            <p className="price">R$ 99,90/mês</p>
            <p className="description">Solução completa para empresas e grandes projetos.</p>
            <ul>
              <li>Acesso multiusuário (até 15 contas)</li>
              <li>Integração completa via API</li>
              <li>Suporte dedicado 24/7 com gerente de conta</li>
              <li>Relatórios avançados com analytics</li>
              <li>Validação de estimativas com IA personalizada</li>
              <li>Espaço exclusivo para compartilhamento de projetos</li>
            </ul>
            <button>Assinar</button>
          </div>
        </div>
      </section>

      <section className="final-cta">
        <h2>Pronto para transformar seu projeto?</h2>
        <Link to="/cadastro">
          <button className="cta-button">Cadastre-se Gratuitamente</button>
        </Link>
      </section>

      <footer className="landing-footer" id="contato">
        <p>&copy; {new Date().getFullYear()} {COMPANY_NAME}. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
