import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { COMPANY_NAME } from '../constants/company';
import { FaClock, FaMoneyBillWave, FaUsers, FaLock, FaCheck, FaRocket, FaBuilding } from 'react-icons/fa';
import '../styles/LandingPage.css';

import image01 from '../assets/images/image - 01.jpeg';
import image02 from '../assets/images/image - 02.jpeg';
import image03 from '../assets/images/image - 03.jpeg';

const LandingPage = () => {
  const originalItems = [
    { src: image01, alt: 'Imagem 1', caption: 'Planeje sua obra com precisão' },
    { src: image02, alt: 'Imagem 2', caption: 'Estimativas confiáveis com IA' },
    { src: image03, alt: 'Imagem 3', caption: 'Conecte-se e colabore' },
  ];

  const carouselItems = [
    originalItems[originalItems.length - 1],
    ...originalItems,
    originalItems[0],
  ];

  const [currentIndex, setCurrentIndex] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);
  const [showButtons, setShowButtons] = useState(true);

  const nextSlide = () => {
    if (isInteracting) return;
    setIsInteracting(true);
    setIsTransitioning(true);
    setShowButtons(true); // Garante que os botões estejam visíveis
    setCurrentIndex((prevIndex) => prevIndex + 1);
  };

  const prevSlide = () => {
    if (isInteracting) return;
    setIsInteracting(true);
    setIsTransitioning(true);
    setShowButtons(true); // Garante que os botões estejam visíveis
    setCurrentIndex((prevIndex) => prevIndex - 1);
  };

  const handleTransitionEnd = () => {
    setIsInteracting(false);
    setShowButtons(true); // Mantém botões visíveis após transição
    if (currentIndex === 0) {
      setIsTransitioning(false);
      setCurrentIndex(carouselItems.length - 2);
    } else if (currentIndex === carouselItems.length - 1) {
      setIsTransitioning(false);
      setCurrentIndex(1);
    }
  };

  useEffect(() => {
    if (!isTransitioning) {
      setIsInteracting(false);
      setShowButtons(true); // Força visibilidade dos botões
    }
  }, [isTransitioning, currentIndex]);

  return (
    <div className="landing-container">
      <header className="landing-header">
        <div className="logo">{COMPANY_NAME}</div>
        <nav className="nav-menu">
          <Link to="/login" className="login-link">Entrar</Link>
        </nav>
      </header>

      <section className="hero">
        <div className="carousel-container">
          <button
            className="carousel-btn prev"
            onClick={prevSlide}
            style={{ display: showButtons ? 'block' : 'none' }}
          >
            ❮
          </button>
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
          <button
            className="carousel-btn next"
            onClick={nextSlide}
            style={{ display: showButtons ? 'block' : 'none' }}
          >
            ❯
          </button>
        </div>
        <div className="hero-content">
          <h1>Construa com Inteligência e Simplicidade</h1>
          <p>Obra Fácil utiliza IA avançada para estimar materiais, otimizar projetos e conectar profissionais e iniciantes em uma plataforma colaborativa.</p>
          <Link to="/cadastro">
            <button className="cta-button">Experimente Grátis</button>
          </Link>
        </div>
      </section>

      <section id="recursos" className="features">
        <h2>Por que Escolher a Obra Fácil?</h2>
        <div className="features-list">
          <div className="feature-item">
            <FaClock className="feature-icon" />
            <h3>Rapidez</h3>
            <p>Gere estimativas precisas de materiais em minutos com nossa IA treinada em milhares de obras.</p>
          </div>
          <div className="feature-item">
            <FaMoneyBillWave className="feature-icon" />
            <h3>Economia</h3>
            <p>Evite desperdícios planejando com dados confiáveis e otimize seu orçamento.</p>
          </div>
          <div className="feature-item">
            <FaUsers className="feature-icon" />
            <h3>Colaboração</h3>
            <p>Compartilhe projetos, receba feedback e conecte-se com a comunidade da construção civil.</p>
          </div>
          <div className="feature-item">
            <FaLock className="feature-icon" />
            <h3>Confiabilidade</h3>
            <p>Valide estimativas com dados reais e proteja seus projetos com segurança de ponta.</p>
          </div>
        </div>
      </section>

      <section className="testimonials">
        <h2>Histórias de Sucesso</h2>
        <div className="testimonial-items">
          <div className="testimonial-item">
            <p>"A Engenharia Fácil simplificou o planejamento das minhas obras. A IA é impressionante e economizou horas de trabalho!"</p>
            <span>- André, Engenheiro Civil</span>
          </div>
          <div className="testimonial-item">
            <p>"Como iniciante, consegui planejar minha reforma com confiança. A plataforma é intuitiva e os dados são confiáveis."</p>
            <span>- Luiza, Proprietária</span>
          </div>
          <div className="testimonial-item">
            <p>"A validação das estimativas e o espaço colaborativo transformaram a gestão dos meus projetos. Altamente recomendável!"</p>
            <span>- Marcos, Gerente de Construção</span>
          </div>
          <div className="testimonial-item">
            <p>"Os relatórios detalhados e o suporte dedicado fazem toda a diferença para nossa equipe. Melhor investimento!"</p>
            <span>- Ana, Diretora de Construtora</span>
          </div>
        </div>
      </section>

      <section className="pricing">
        <h2>Planos para Todos os Projetos</h2>
        <p>Escolha o plano ideal e construa com precisão, eficiência e colaboração.</p>
        <div className="pricing-cards">
          <div className="pricing-card basic">
            <h3><FaCheck /> Básico</h3>
            <p className="price">Grátis</p>
            <p className="description">Perfeito para iniciantes ou pequenas reformas.</p>
            <ul>
              <li>Estimativas básicas de materiais com IA</li>
              <li>Limite de 2 projetos por mês</li>
              <li>Acesso ao fórum da comunidade</li>
              <li>Suporte via e-mail (resposta em até 48h)</li>
            </ul>
            <button><Link to="/cadastro" className="link-style">Começar Grátis</Link></button>
          </div>
          <div className="pricing-card professional">
            <h3><FaRocket /> Profissional</h3>
            <p className="price">R$ 99,90/mês</p>
            <p className="description">Ideal para profissionais que buscam eficiência e precisão.</p>
            <ul>
              <li>Estimativas ilimitadas com validação de IA</li>
              <li>Exportação de relatórios em PDF e Excel</li>
              <li>Feedback e compartilhamento de projetos</li>
              <li>Suporte prioritário via chat (resposta em até 12h)</li>
              <li>Acesso ao histórico completo de projetos</li>
            </ul>
            <button>Assinar Agora</button>
          </div>
          <div className="pricing-card enterprise highlighted">
            <div className="highlight-badge">Mais Popular</div>
            <h3><FaBuilding /> Empresarial</h3>
            <p className="price">R$ 249,90/mês</p>
            <p className="description">Solução completa para empresas e grandes obras.</p>
            <ul>
              <li>Acesso multiusuário (até 20 contas)</li>
              <li>Integração avançada via API</li>
              <li>Validação personalizada de estimativas com IA</li>
              <li>Relatórios analíticos com insights de obras</li>
              <li>Espaço colaborativo para equipes e clientes</li>
              <li>Suporte dedicado 24/7 com gerente de conta</li>
            </ul>
            <button>Assinar Agora</button>
          </div>
        </div>
      </section>

      <footer className="landing-footer" id="contato">
        <p>© {new Date().getFullYear()} {COMPANY_NAME}. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
};

export default LandingPage;