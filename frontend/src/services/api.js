import axios from 'axios';
import { API_URL } from '../config';

// Criar instância do axios com baseURL
const api = axios.create({
  baseURL: API_URL || '/api',
});

// Configura o token JWT no header
const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// Interceptador para renovar token automaticamente
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await axios.post(`${API_URL}/profiles/token/refresh/`, {
          refresh: refreshToken,
        });
        const newAccessToken = response.data.access;
        localStorage.setItem('access_token', newAccessToken);
        setAuthToken(newAccessToken);
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

// Login
export const login = async (credentials) => {
  const response = await axios.post(`${API_URL}/profiles/login/`, credentials, {
    headers: { 'Content-Type': 'application/json' },
  });
  const { access, refresh } = response.data;
  localStorage.setItem('access_token', access);
  localStorage.setItem('refresh_token', refresh);
  setAuthToken(access);
  return response.data;
};

// Obter perfil do usuário autenticado
export const getProfile = async () => {
  const token = localStorage.getItem('access_token');
  console.log("📦 Token acessado:", token);
  setAuthToken(token);
  try {
    const response = await api.get('/profiles/me/');
    console.log("✅ Dados do perfil recebidos:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Erro ao carregar perfil:", error.response?.data || error.message);
    throw error; // Propagar erro para o componente
  }
};

// Atualizar perfil
export const updateProfile = async (data) => {
  const token = localStorage.getItem('access_token');
  setAuthToken(token);
  try {
    const response = await api.put('/profiles/me/', data, {
      headers: { 'Content-Type': 'application/json' },
    });
    console.log("✅ Perfil atualizado:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Erro ao atualizar perfil:", error.response?.data || error.message);
    throw error;
  }
};