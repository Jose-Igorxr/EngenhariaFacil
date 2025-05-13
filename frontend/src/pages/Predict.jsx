import React, { useState, useEffect } from 'react';
import Chart from 'chart.js/auto';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/Predict.css';

const Toast = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      className="toast"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      {message}
    </motion.div>
  );
};

const Predict = () => {
  const [area, setArea] = useState('');
  const [predictions, setPredictions] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);
  const navigate = useNavigate();

  const showToast = (msg) => setToastMsg(msg);

  const handleCalculate = async () => {
    setPredictions(null);

    try {
      const response = await api.post('/api/predict/', {
        area: parseFloat(area),
      });

      setPredictions({
        cement: response.data.cimento,
        sand: response.data.areia,
        bricks: response.data.tijolos,
      });
    } catch (err) {
      showToast(err?.response?.data?.erro || 'Erro ao prever materiais.');
    }
  };

  useEffect(() => {
    if (!predictions) return;

    const ctx = document.getElementById('predictionChart')?.getContext('2d');
    if (!ctx) return;

    const chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Cimento (kg)', 'Areia (kg)', 'Tijolos (milhares)'],
        datasets: [{
          label: 'Materiais',
          data: [
            predictions.cement,
            predictions.sand,
            predictions.bricks / 1000, // Normalizar tijolos
          ],
          backgroundColor: ['#3b82f6', '#f59e0b', '#ef4444'],
          borderColor: ['#1e40af', '#b45309', '#991b1b'],
          borderWidth: 1,
        }],
      },
      options: {
        animation: {
          animateScale: true,
          animateRotate: true,
          duration: 1000,
          easing: 'easeOutQuart',
        },
        plugins: {
          legend: {
            position: 'bottom',
            labels: { font: { size: 12, family: 'Arial' }, color: '#2d3748' },
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const index = context.dataIndex;
                const value = context.raw;
                if (index === 2) {
                  return `Tijolos: ${(value * 1000).toFixed(0)} unidades`;
                }
                return `${context.label}: ${value.toFixed(1)} kg`;
              },
            },
          },
        },
        cutout: '70%', // Faz o "donut" com um buraco maior
      },
    });

    return () => chart.destroy();
  }, [predictions]);

  return (
    <div className="predict-container">
      <h1 className="predict-title">Calcular Materiais</h1>
      <div className="predict-form">
        <motion.div
          className="input-group"
          whileFocus={{ scale: 1.02, boxShadow: '0 0 8px rgba(59, 130, 246, 0.5)' }}
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <label htmlFor="area">Área (m²)</label>
          <input
            id="area"
            type="number"
            value={area}
            onChange={(e) => setArea(e.target.value)}
            placeholder="Ex: 100"
            min="1"
            step="0.1"
            required
          />
        </motion.div>
        <motion.button
          onClick={handleCalculate}
          className="predict-button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Calcular
        </motion.button>
      </div>

      <AnimatePresence>
        {toastMsg && (
          <Toast message={toastMsg} onClose={() => setToastMsg(null)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {predictions && (
          <motion.div
            className="predictions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ staggerChildren: 0.1 }}
          >
            <h2 className="predictions-title">Resultado:</h2>
            <ul className="predictions-list">
              <motion.li
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                Cimento: {predictions.cement.toFixed(1)} kg
              </motion.li>
              <motion.li
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                Areia: {predictions.sand.toFixed(1)} kg
              </motion.li>
              <motion.li
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                Tijolos: {predictions.bricks.toFixed(0)} unidades
              </motion.li>
            </ul>
            <canvas
              id="predictionChart"
              className="prediction-chart"
            ></canvas>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Predict;