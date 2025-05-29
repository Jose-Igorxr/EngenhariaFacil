import React, { useState, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
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
            className="dialog-confirm-button-clean predict-button-fullscreen"
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
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [activeChartMaterial, setActiveChartMaterial] = useState(null);
  const chartRefs = {
    cement: useRef(null),
    sand: useRef(null),
    bricks: useRef(null),
  };
  const chartInstances = useRef({
    cement: null,
    sand: null,
    bricks: null,
  });
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
    setActiveChartMaterial(null);
    setIsAlertDialogOpen(true);
    setIsDialogConfirmButtonDisabled(true);
    setTimeout(() => {
      setIsDialogConfirmButtonDisabled(false);
    }, 3000);
  };

  const proceedWithCalculation = async () => {
    setIsAlertDialogOpen(false);
    setIsLoading(true);
    
    Object.values(chartInstances.current).forEach(instance => {
      if (instance) instance.destroy();
    });
    chartInstances.current = { cement: null, sand: null, bricks: null };

    try {
      const response = await api.post('/api/predict/', {
        area: parseFloat(area),
      });

      setPredictions({
        cement: response.data.cimento,
        sand: response.data.areia,
        bricks: response.data.tijolos,
      });
      setActiveChartMaterial('cement'); 
      showToast('Cálculo realizado com sucesso!', 'success');
    } catch (err) {
      showToast(err?.response?.data?.erro || 'Erro ao prever materiais.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!predictions) {
      return;
    }
  
    const materialData = {
      cement: { label: 'Cimento', unit: 'kg', value: predictions.cement, ref: chartRefs.cement, color: '#3498db' },
      sand: { label: 'Areia', unit: 'kg', value: predictions.sand, ref: chartRefs.sand, color: '#f39c12' },
      bricks: { label: 'Tijolos', unit: 'unidades', value: predictions.bricks, ref: chartRefs.bricks, color: '#e74c3c' },
    };
  
    Object.keys(materialData).forEach(key => {
      const material = materialData[key];
      const chartRef = material.ref;
      const chartCanvas = chartRef.current;
  
      if (!chartCanvas) return;
  
      if (chartInstances.current[key]) {
        chartInstances.current[key].destroy();
      }
  
      const ctx = chartCanvas.getContext('2d');
      if (!ctx) return;
  
      const dataValue = material.value;
      const maxValue = key === 'bricks' ? MAX_AREA * 20 : MAX_AREA * 25; 
  
      chartInstances.current[key] = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: [material.label],
          datasets: [{
            label: `${material.label} (${material.unit})`,
            data: [dataValue],
            backgroundColor: material.color,
            borderColor: material.color,
            borderWidth: 1,
            borderRadius: 4,
            barThickness: 30,
          }]
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              beginAtZero: true,
              max: maxValue * 1.1, 
              grid: {
                color: 'rgba(255, 255, 255, 0.1)',
                borderColor: 'rgba(255, 255, 255, 0.1)',
              },
              ticks: {
                color: '#bdc3c7',
                font: { size: 10 },
                maxTicksLimit: 5,
              }
            },
            y: {
              grid: {
                display: false,
                borderColor: 'rgba(255, 255, 255, 0.1)',
              },
              ticks: {
                color: '#ecf0f1',
                font: { size: 13, weight: '500' }
              }
            }
          },
          plugins: {
            legend: {
              display: false,
            },
            tooltip: {
              enabled: true,
              backgroundColor: 'rgba(44, 62, 80, 0.9)',
              titleFont: { size: 13, weight: 'bold' },
              bodyFont: { size: 12 },
              padding: 10,
              cornerRadius: 6,
              displayColors: false,
              callbacks: {
                label: (context) => {
                  const value = context.raw;
                  return `${material.label}: ${value.toFixed(key === 'bricks' ? 0 : 1)} ${material.unit}`;
                }
              }
            }
          }
        }
      });
    });
  
    return () => {
      Object.values(chartInstances.current).forEach(instance => {
        if (instance) instance.destroy();
      });
    };
  }, [predictions]);


  const materialDisplayInfo = [
    { id: 'cement', name: 'Cimento', unit: 'kg', icon: '🧱' },
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
        <p>O botão para prosseguir será liberado em instantes.</p>
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
              disabled={isLoading}
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
                {materialDisplayInfo.map((material) => (
                  <motion.div
                    key={material.id}
                    className="material-result-card-v2"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: materialDisplayInfo.indexOf(material) * 0.15, ease: "easeOut" }}
                  >
                    <span className="material-icon-v2">{material.icon}</span>
                    <h3 className="material-name-v2">{material.name}</h3>
                    <p className="material-quantity-v2">
                      {predictions[material.id].toFixed(material.id === 'bricks' ? 0 : 1)}
                      <span className="material-unit-v2">{material.unit}</span>
                    </p>
                  </motion.div>
                ))}
              </div>

              <div className="charts-grid-v2">
                {materialDisplayInfo.map((material) => (
                  <div key={material.id} className="chart-container-v2">
                     <h4 className="chart-title-v2">{material.name}</h4>
                    <div className="chart-canvas-wrapper-v2">
                      <canvas ref={chartRefs[material.id]} id={`chart-${material.id}`}></canvas>
                    </div>
                  </div>
                ))}
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </main>
       <footer className="app-footer-fullscreen-v2">
        <p>&copy; {new Date().getFullYear()} Obra Fácil. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
};

export default Predict;
