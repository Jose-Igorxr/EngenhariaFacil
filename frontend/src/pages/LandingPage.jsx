import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { COMPANY_NAME } from '../constants/company';
import { FaMoneyBillWave, FaUsers, FaLock } from 'react-icons/fa'; // FaClock removido
import Footer from '../components/Footer';
import { motion } from 'framer-motion';
import '../styles/LandingPage.css';

// VERIFIQUE SE ESTES CAMINHOS ESTÃO CORRETOS E SE AS IMAGENS EXISTEM LÁ
import image01 from '../assets/images/image - 01.jpeg';
import image02 from '../assets/images/image - 02.jpeg';
import image03 from '../assets/images/image - 03.jpeg';

const LandingPage = () => {
  const originalItems = [
    { src: image01, alt: 'Planejamento de obra preciso', caption: 'Planeje sua obra com precisão' },
    { src: image02, alt: 'Estimativas com Inteligência Artificial', caption: 'Estimativas confiáveis com IA' },
    { src: image03, alt: 'Colaboração em projetos de construção', caption: 'Conecte-se e colabore' },
  ];

  const carouselItems = [
    originalItems[originalItems.length - 1],
    ...originalItems,
    originalItems[0],
  ];

  const [currentIndex, setCurrentIndex] = useState(1);
  const [isCssTransitionEnabled, setIsCssTransitionEnabled] = useState(true); // Controla a transição CSS
  const intervalRef = useRef(null);
  const CAROUSEL_INTERVAL = 3500; // Intervalo reduzido para 3.5 segundos
  const TRANSITION_DURATION_MS = 600; // Duração da transição CSS em milissegundos

  const advanceSlide = () => {
    setIsCssTransitionEnabled(true); // Garante que a transição CSS esteja ativa para o movimento
    setCurrentIndex((prevIndex) => prevIndex + 1);
  };

  useEffect(() => {
    intervalRef.current = setInterval(advanceSlide, CAROUSEL_INTERVAL);
    return () => clearInterval(intervalRef.current);
  }, []);

  const handleTransitionEnd = () => {
    // A transição CSS terminou. Agora verificamos se precisamos "pular" para o slide real.
    if (currentIndex === 0) { // Chegou ao clone do último item (no início)
      setIsCssTransitionEnabled(false); // Desativa a transição CSS para o salto
      setCurrentIndex(carouselItems.length - 2); // Salta para o último item real
    } else if (currentIndex === carouselItems.length - 1) { // Chegou ao clone do primeiro item (no fim)
      setIsCssTransitionEnabled(false); // Desativa a transição CSS para o salto
      setCurrentIndex(1); // Salta para o primeiro item real
    }
    // Não é necessário reativar isCssTransitionEnabled aqui,
    // pois advanceSlide() fará isso no próximo movimento.
  };
  
  // Animações de hover/tap mantidas, mas as de entrada de seção foram removidas
  // const sectionVariants = { ... };
  // const itemVariants = { ... };

  const featuresList = [
    // { icon: <FaClock className="feature-icon" />, title: "Rapidez", description: "Gere estimativas precisas de materiais em minutos com nossa IA treinada." }, // Removido
    { icon: <FaMoneyBillWave className="feature-icon" />, title: "Economia", description: "Evite desperdícios planejando com dados confiáveis e otimize seu orçamento." },
    { icon: <FaUsers className="feature-icon" />, title: "Colaboração", description: "Compartilhe projetos, receba feedback e conecte-se com a comunidade." },
    { icon: <FaLock className="feature-icon" />, title: "Confiabilidade", description: "Valide estimativas com dados reais e proteja seus projetos com segurança." },
  ];

  const testimonialsList = [
    { quote: "\"A Obra Fácil simplificou o planejamento das minhas obras. A IA é impressionante!\"", author: "- André, Engenheiro Civil" },
    { quote: "\"Como iniciante, consegui planejar minha reforma com confiança. Plataforma intuitiva.\"", author: "- Luiza, Proprietária" },
    { quote: "\"A validação das estimativas e o espaço colaborativo transformaram meus projetos.\"", author: "- Marcos, Gerente de Construção" },
  ];
  
  const pricingPlans = [
    { type: "Básico", price: "Grátis", description: "Perfeito para iniciantes ou pequenas reformas.", features: ["Estimativas básicas com IA", "Limite de 2 projetos/mês", "Acesso ao fórum", "Suporte via e-mail"], cta: "Começar Grátis", link: "/cadastro", iconName: "FaCheck" },
    { type: "Profissional", price: "R$ 49,90/mês", description: "Ideal para profissionais que buscam eficiência.", features: ["Estimativas ilimitadas", "Exportação de relatórios", "Compartilhamento de projetos", "Suporte prioritário", "Histórico de projetos"], cta: "Assinar Agora", link: "/cadastro", iconName: "FaRocket", highlighted: false },
    { type: "Empresarial", price: "R$ 199,90/mês", description: "Solução completa para empresas e grandes obras.", features: ["Acesso multiusuário (10)", "Integração API", "Validação IA personalizada", "Relatórios analíticos", "Suporte dedicado 24/7"], cta: "Fale Conosco", link: "/contato", iconName: "FaBuilding", highlighted: true },
  ];

  const getIconComponent = (iconName) => {
    return <span className="pricing-plan-default-icon">✓</span>;
  };

  return (
    <div className="landing-container">
      <header className="landing-header">
        {/* Logo não é mais um Link */}
        <div className="logo">{COMPANY_NAME}</div>
        <nav className="landing-nav-menu">
          <Link to="/login" className="login-link-landing">Entrar</Link>
        </nav>
      </header>

      <section className="hero">
        <div className="carousel-container">
          <div className="carousel">
            <div
              className="carousel-inner"
              style={{
                transform: `translateX(-${currentIndex * 100}%)`,
                transition: isCssTransitionEnabled ? `transform ${TRANSITION_DURATION_MS}ms cubic-bezier(0.77, 0, 0.175, 1)` : 'none',
              }}
              onTransitionEnd={handleTransitionEnd}
            >
              {carouselItems.map((item, index) => (
                <div key={index} className="carousel-item">
                  {/* Adicionada verificação se item.src existe */}
                  {item.src ? (
                    <img src={item.src} alt={item.alt} className="carousel-image" />
                  ) : (
                    <div className="carousel-image-placeholder">Imagem não disponível</div>
                  )}
                  <div className="carousel-caption">{item.caption}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <motion.div className="hero-content"> {/* Animações de entrada removidas, mas motion.div mantido para whileHover/Tap no botão */}
          <h1>Construa com Inteligência e Simplicidade</h1>
          <p>Obra Fácil utiliza IA avançada para estimar materiais, otimizar projetos e conectar profissionais e iniciantes em uma plataforma colaborativa.</p>
          <Link to="/cadastro">
            <motion.button 
              className="cta-button hero-cta"
              whileHover={{ scale: 1.05, y: -2, boxShadow: "0 8px 20px rgba(211, 84, 0, 0.4)" }}
              whileTap={{ scale: 0.95 }}
            >
              Experimente Grátis
            </motion.button>
          </Link>
        </motion.div>
      </section>

      <section id="recursos" className="features">
        <h2>Por que Escolher a Obra Fácil?</h2>
        <div className="features-list">
          {featuresList.map((feature, index) => (
            <motion.div // Animações de entrada removidas
              key={index} 
              className="feature-item"
              whileHover={{ y: -7, boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)"}} // Mantido hover
            >
              {feature.icon}
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="testimonials">
        <h2>Histórias de Sucesso</h2>
        <div className="testimonial-items">
          {testimonialsList.map((testimonial, index) => (
             <motion.div // Animações de entrada removidas
              key={index} 
              className="testimonial-item"
              whileHover={{ y: -5, boxShadow: "0 8px 20px rgba(0, 0, 0, 0.08)"}} // Mantido hover
            >
              <p>{testimonial.quote}</p>
              <span>{testimonial.author}</span>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="pricing">
        <h2>Planos para Todos os Projetos</h2>
        <p className="pricing-subtitle">Escolha o plano ideal e construa com precisão, eficiência e colaboração.</p>
        <div className="pricing-cards">
          {pricingPlans.map((plan, index) => (
            <motion.div // Animações de entrada removidas
              key={index} 
              className={`pricing-card ${plan.highlighted ? 'highlighted' : ''}`}
              whileHover={{ y: -10, boxShadow: "0 12px 30px rgba(44, 62, 80, 0.15)"}} // Mantido hover
            >
              {plan.highlighted && <div className="highlight-badge">Mais Popular</div>}
              <h3>{getIconComponent(plan.iconName)} {plan.type}</h3>
              <p className="price">{plan.price}</p>
              <p className="description">{plan.description}</p>
              <ul>
                {plan.features.map((feature, fIndex) => (
                  <li key={fIndex}>{feature}</li>
                ))}
              </ul>
              <Link to={plan.link} className="pricing-cta-link">
                <motion.button 
                  className="cta-button pricing-button"
                  whileHover={{ scale: 1.03, boxShadow: "0 6px 18px rgba(211, 84, 0, 0.35)" }}
                  whileTap={{ scale: 0.97 }}
                >
                  {plan.cta}
                </motion.button>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default LandingPage;
