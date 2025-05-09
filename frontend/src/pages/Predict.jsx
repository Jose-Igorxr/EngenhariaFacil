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
  const [constructionType, setConstructionType] = useState('residential');
  const [region, setRegion] = useState('urban');
  const [predictions, setPredictions] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);
  const navigate = useNavigate();

  const showToast = (msg) => setToastMsg(msg);

  const validateResponse = (data) => {
    if (!data.cimento || !data.areia || !data.tijolos) {
      throw new Error('Resposta incompleta da API.');
    }
    const a = parseFloat(area);
    const valid =
      data.cimento >= a * 10 &&
      data.areia >= a * 30 &&
      data.tijolos * 1000 <= a * 100;

    if (!valid) {
      throw new Error('Valores fora da faixa esperada.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPredictions(null);

    try {
      const response = await api.post('/api/predict/', {
        area: parseFloat(area),
        construction_type: constructionType,
        region,
      });

      validateResponse(response.data);

      setPredictions({
        cement: response.data.cimento,
        sand: response.data.areia,
        bricks: response.data.tijolos,
      });
    } catch (err) {
      showToast(err?.message || 'Erro ao prever materiais.');
    }
  };

  useEffect(() => {
    if (!predictions) return;

    const ctx = document.getElementById('predictionChart')?.getContext('2d');
    if (!ctx) return;

    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Cimento (kg)', 'Areia (kg)', 'Tijolos (unidades)'],
        datasets: [{
          label: 'Materiais',
          data: [
            predictions.cement,
            predictions.sand,
            predictions.bricks * 1000,
          ],
          backgroundColor: ['#3b82f6', '#f59e0b', '#ef4444'],
          borderColor: ['#1e40af', '#b45309', '#991b1b'],
          borderWidth: 1,
        }],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
            title: { display: true, text: 'Quantidade' },
          },
        },
        plugins: { legend: { display: false } },
      },
    });

    return () => chart.destroy();
  }, [predictions]);

  return (
    <div className="predict-container">
      <h1 className="predict-title">Calcular Materiais</h1>
      <form onSubmit={handleSubmit} className="predict-form">
        <motion.div className="form-group" whileFocus={{ scale: 1.02 }}>
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

        <motion.div className="form-group" whileFocus={{ scale: 1.02 }}>
          <label htmlFor="constructionType">Tipo</label>
          <select
            id="constructionType"
            value={constructionType}
            onChange={(e) => setConstructionType(e.target.value)}
          >
            <option value="residential">Residencial</option>
            <option value="commercial">Comercial</option>
            <option value="industrial">Industrial</option>
          </select>
        </motion.div>

        <motion.div className="form-group" whileFocus={{ scale: 1.02 }}>
          <label htmlFor="region">Região</label>
          <select
            id="region"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
          >
            <option value="urban">Urbana</option>
            <option value="suburban">Suburbana</option>
            <option value="rural">Rural</option>
          </select>
        </motion.div>

        <motion.button
          type="submit"
          className="predict-button"
          whileHover={{ scale: 1.05 }}
        >
          Calcular
        </motion.button>
      </form>

      <AnimatePresence>
        {toastMsg && (
          <Toast message={toastMsg} onClose={() => setToastMsg(null)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {predictions && (
          <motion.div
            className="predictions"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <h2 className="predictions-title">Resultado:</h2>
            <ul className="predictions-list">
              <li>Cimento: {predictions.cement.toFixed(1)} kg</li>
              <li>Areia: {predictions.sand.toFixed(1)} kg</li>
              <li>Tijolos: {(predictions.bricks * 1000).toFixed(0)} unidades</li>
            </ul>
            <canvas id="predictionChart" className="prediction-chart"></canvas>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Predict;
