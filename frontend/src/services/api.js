import axios from 'axios';
import { API_URL } from '../config';

const api = axios.create({
  baseURL: API_URL || 'http://localhost:8000',
});

const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    console.log('🔐 Token de autorização definido:', token.slice(0, 10) + '...');
  } else {
    delete api.defaults.headers.common['Authorization'];
    console.log('🔐 Token de autorização removido');
  }
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refresh_token');
      console.log('🔄 Tentando refresh com refresh_token:', refreshToken ? refreshToken.slice(0, 10) + '...' : 'Nenhum');
      if (!refreshToken) {
        console.error('❌ Nenhum refresh_token disponível, redirecionando para login');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(new Error('Nenhum refresh_token disponível'));
      }
      try {
        const response = await api.post('/api/token/refresh/', {
          refresh: refreshToken,
        });
        const newAccessToken = response.data.access;
        console.log('✅ Novo access_token obtido:', newAccessToken.slice(0, 10) + '...');
        localStorage.setItem('access_token', newAccessToken);
        setAuthToken(newAccessToken);
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error('❌ Erro ao renovar token:', refreshError.response?.data || refreshError.message);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    console.error('❌ Erro na requisição:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const login = async (credentials) => {
  try {
    const response = await api.post('/api/token/', credentials, {
      headers: { 'Content-Type': 'application/json' },
    });
    const { access, refresh } = response.data;
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    setAuthToken(access);
    console.log('🔑 Login bem-sucedido, tokens salvos:', { access: access.slice(0, 10) + '...', refresh: refresh.slice(0, 10) + '...' });
    return response.data;
  } catch (error) {
    console.error('❌ Erro ao fazer login:', error.response?.data || error.message);
    throw error;
  }
};

export const getProfile = async () => {
  const token = localStorage.getItem('access_token');
  console.log('📦 Token acessado para perfil:', token ? token.slice(0, 10) + '...' : 'Nenhum');
  setAuthToken(token);
  try {
    const response = await api.get('/api/profiles/me/');
    console.log('✅ Dados do perfil recebidos:', response.data);
    if (!response.data.profile) {
      console.warn('⚠️ Campo "profile" ausente na resposta do backend.');
    } else if (!response.data.profile.profile_picture) {
      console.warn('⚠️ Campo "profile.profile_picture" ausente ou null.');
    }
    return response.data;
  } catch (error) {
    console.error('❌ Erro ao carregar perfil:', error.response?.data || error.message);
    throw error;
  }
};

export const updateProfile = async (formData) => {
  const token = localStorage.getItem('access_token');
  console.log('📦 Token acessado para atualização:', token ? token.slice(0, 10) + '...' : 'Nenhum');
  setAuthToken(token);
  try {
    const response = await api.put('/api/profiles/me/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    console.log('✅ Perfil atualizado:', response.data);
    if (!response.data.profile) {
      console.warn('⚠️ Campo "profile" ausente na resposta do backend.');
    } else if (!response.data.profile.profile_picture) {
      console.warn('⚠️ Campo "profile.profile_picture" ausente ou null após atualização.');
    }
    return response.data;
  } catch (error) {
    console.error('❌ Erro ao atualizar perfil:', error.response?.data || error.message);
    throw error;
  }
};

export const predictMaterials = async (data) => {
  const token = localStorage.getItem('access_token');
  console.log('📦 Token acessado para previsão:', token ? token.slice(0, 10) + '...' : 'Nenhum');
  if (!token) {
    console.error('❌ Nenhum access_token disponível, redirecionando para login');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    window.location.href = '/login';
    throw new Error('Nenhum access_token disponível');
  }
  setAuthToken(token);
  try {
    const response = await api.post('/api/predict/', data);
    console.log('✅ Previsão recebida:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Erro ao realizar previsão:', error.response?.data || error.message);
    throw error;
  }
};

export default api;