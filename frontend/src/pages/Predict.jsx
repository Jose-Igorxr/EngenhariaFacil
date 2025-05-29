import React, { useState, useEffect, useRef } from 'react';
// Chart.js não é mais necessário
// import Chart from 'chart.js/auto';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/Predict.css';

const Toast = ({ message, onClose, type }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3800);
    return () => clearTimeout(timer);
  }, [onClose]);

  let toastClass = 'toast';
  if (type === 'success') {
    toastClass += ' toast-success';
  } else if (type === 'warning') {
    toastClass += ' toast-warning';
  } else if (type === 'error') { // Adicionado para consistência, caso use 'error'
    toastClass += ' toast-error';
  }


  return (
    <motion.div
      className={toastClass}
      initial={{ opacity: 0, y: -30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -30, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
    >
      {message}
    </motion.div>
  );
};

const AlertDialog = ({ isOpen, title, children, onConfirm, confirmButtonDisabled }) => {
  if (!isOpen) return null;

  return (
    <motion.div
      className="dialog-overlay-clean"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
    >
      <motion.div
        className="dialog-content-clean"
        initial={{ opacity: 0, y: -30, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -30, scale: 0.9 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
      >
        <h3 className="dialog-title-clean">{title}</h3>
        <div className="dialog-body-clean">
          {children}
        </div>
        <div className="dialog-actions-clean">
          <button
            onClick={onConfirm}
            className="dialog-confirm-button-clean predict-button-fullscreen-v2" // Corrigido para usar a classe correta do botão
            disabled={confirmButtonDisabled}
          >
            {confirmButtonDisabled ? 'Aguarde...' : 'Entendi, Prosseguir'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const CalculatingAnimation = () => {
  return (
    <motion.div
      className="calculating-animation-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="calculating-spinner">
        <svg viewBox="0 0 50 50">
          <circle className="path" cx="25" cy="25" r="20" fill="none" strokeWidth="4"></circle>
        </svg>
      </div>
      <p className="calculating-text">IA processando os dados...</p>
    </motion.div>
  );
};


const Predict = () => {
  const [area, setArea] = useState('');
  const [predictions, setPredictions] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);
  // useNavigate não está sendo usado, pode ser removido se não houver planos para ele.
  // const navigate = useNavigate(); 
  const [isLoading, setIsLoading] = useState(false);
  // Estados e referências de gráfico removidos
  // const [activeChartMaterial, setActiveChartMaterial] = useState(null);
  // const chartRefs = { ... };
  // const chartInstances = useRef({ ... });
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
  const [isDialogConfirmButtonDisabled, setIsDialogConfirmButtonDisabled] = useState(false);

  const MIN_AREA = 1;
  const MAX_AREA = 500;

  const showToast = (msg, type = 'error') => {
    setToastMsg({ text: msg, type });
  };

  const handleOpenDialog = () => {
    const numericArea = parseFloat(area);
    if (isNaN(numericArea) || numericArea < MIN_AREA || numericArea > MAX_AREA) {
      showToast(`Por favor, insira uma área válida entre ${MIN_AREA} e ${MAX_AREA} m².`, 'warning');
      return;
    }
    setPredictions(null); 
    // setActiveChartMaterial(null); // Removido
    setIsAlertDialogOpen(true);
    setIsDialogConfirmButtonDisabled(true);
    setTimeout(() => {
      setIsDialogConfirmButtonDisabled(false);
    }, 3000); // Tempo para reabilitar o botão do diálogo
  };

  const proceedWithCalculation = async () => {
    setIsAlertDialogOpen(false);
    setIsLoading(true);
    
    // Limpeza de instâncias de gráfico removida
    // Object.values(chartInstances.current).forEach(instance => { ... });
    // chartInstances.current = { ... };

    try {
      const response = await api.post('/api/predict/', { // Certifique-se que 'api' está configurado corretamente
        area: parseFloat(area),
      });

      setPredictions({
        cement: response.data.cimento,
        sand: response.data.areia,
        bricks: response.data.tijolos,
      });
      // setActiveChartMaterial('cement'); // Removido
      showToast('Cálculo realizado com sucesso!', 'success');
    } catch (err) {
      // Tratamento de erro aprimorado
      const errorMsg = err.response?.data?.detail || err.response?.data?.erro || err.message || 'Erro ao prever materiais.';
      showToast(errorMsg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // useEffect para renderizar gráficos foi completamente removido.

  const materialDisplayInfo = [
    { id: 'cement', name: 'Cimento', unit: 'kg', icon: '🧱' }, // Ícone pode ser melhorado, ex:  saco de cimento
    { id: 'sand', name: 'Areia', unit: 'kg', icon: '⏳' },
    { id: 'bricks', name: 'Tijolos', unit: 'unidades', icon: '🧱' },
  ];

  return (
    <div className="fullscreen-container-v2">
      <AlertDialog
        isOpen={isAlertDialogOpen}
        title="Aviso Importante sobre a IA"
        onConfirm={proceedWithCalculation}
        confirmButtonDisabled={isDialogConfirmButtonDisabled}
      >
        <p>Os resultados gerados são estimativas e podem conter imprecisões. A IA é uma ferramenta de suporte.</p>
        <p><strong>Para decisões finais e precisas, consulte sempre um profissional qualificado da área de construção.</strong></p>
      </AlertDialog>

      <AnimatePresence>
        {toastMsg && (
          <Toast
            message={toastMsg.text}
            onClose={() => setToastMsg(null)}
            type={toastMsg.type}
          />
        )}
      </AnimatePresence>

      <header className="app-header-fullscreen-v2">
        <h1 className="predict-title-fullscreen-v2">Calculadora IA de Materiais</h1>
        <p className="app-subtitle-fullscreen-v2">Estimativas Inteligentes para Sua Obra</p>
      </header>

      <main className="content-area-fullscreen-v2">
        <section className="input-section-fullscreen-v2">
          <div className="input-card-fullscreen-v2">
            <h2 className="input-card-title-v2">Dados da Construção</h2>
            <div className="input-group-fullscreen-v2">
              <label htmlFor="area">Área Total (m²)</label>
              <input
                id="area"
                type="number"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder={`Ex: 150 (entre ${MIN_AREA} e ${MAX_AREA})`}
                min={MIN_AREA.toString()}
                max={MAX_AREA.toString()}
                step="0.1"
                required
              />
            </div>
            <motion.button
              onClick={handleOpenDialog}
              className="predict-button-fullscreen-v2"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98, y: 0 }}
              disabled={isLoading || !area} // Desabilitar se a área não for preenchida
            >
              {isLoading ? 'Analisando...' : 'Calcular Estimativa'}
            </motion.button>
          </div>
        </section>

        {isLoading && <CalculatingAnimation />}

        <AnimatePresence>
          {!isLoading && predictions && (
            <motion.section
              className="results-section-fullscreen-v2"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6, ease: "circOut" }}
            >
              <h2 className="results-title-v2">Estimativa de Materiais</h2>
              <div className="numerical-results-grid-v2">
                {materialDisplayInfo.map((material, index) => (
                  <motion.div
                    key={material.id}
                    className="material-result-card-v2"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }} // Ajustado delay
                  >
                    <span className="material-icon-v2">{material.icon}</span>
                    <h3 className="material-name-v2">{material.name}</h3>
                    <p className="material-quantity-v2">
                      {/* Verifica se predictions[material.id] existe antes de chamar toFixed */}
                      {predictions[material.id] !== undefined ? predictions[material.id].toFixed(material.id === 'bricks' ? 0 : 1) : 'N/A'}
                      <span className="material-unit-v2">{material.unit}</span>
                    </p>
                  </motion.div>
                ))}
              </div>

              {/* Seção de gráficos removida */}
              {/* <div className="charts-grid-v2"> ... </div> */}

              <div className="ai-accuracy-info">
                <h4>Sobre a Precisão da Estimativa:</h4>
                <p>
                  As quantidades apresentadas são estimativas geradas por Inteligência Artificial.
                  O modelo foi treinado com dados que incluem variações inerentes ao processo construtivo:
                </p>
                <ul>
                  <li><strong>Cimento:</strong> Quantidade base de 8 kg/m², com variação de ±5%.</li>
                  <li><strong>Areia:</strong> Quantidade base de 20 kg/m², com variação de ±5%.</li>
                  <li><strong>Tijolos:</strong> Quantidade base de 14 unidades/m², com variações de ±8% a ±10% dependendo da área.</li>
                </ul>
                <p>
                  Estas estimativas servem como um ponto de partida e podem não refletir todas as particularidades do seu projeto.
                  Fatores como tipo de solo, design específico, perdas de material e técnicas construtivas podem influenciar as quantidades reais.
                </p>
                <p>
                  <strong>Recomendamos enfaticamente que você consulte um engenheiro civil ou profissional qualificado para obter um orçamento preciso e detalhado antes de qualquer compra ou início de obra.</strong>
                </p>
              </div>

            </motion.section>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Predict;
