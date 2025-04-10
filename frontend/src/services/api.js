import axios from 'axios';
import { API_URL } from '../config';

// Criar instância do axios com baseURL
const api = axios.create({
  baseURL: API_URL,
});

// Função para configurar o token nos headers
const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// Interceptar respostas para renovar o token automaticamente
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await axios.post(`${API_URL}/token/refresh/`, { refresh: refreshToken }, {
          headers: { 'Content-Type': 'application/json' },
        });
        const newAccessToken = response.data.access;
        localStorage.setItem('access_token', newAccessToken);
        setAuthToken(newAccessToken);
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error('Erro ao renovar token:', refreshError.response?.data || refreshError.message);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

// Função de login (mantida do seu código, com ajustes para JWT)
export const login = async (credentials) => {
  console.log("Enviando para login:", credentials);
  try {
    const response = await axios.post(`${API_URL}/accounts/login/`, credentials, {
      headers: { 'Content-Type': 'application/json' },
    });
    // Armazenar os tokens no localStorage (assumindo que a resposta contém access e refresh)
    localStorage.setItem('access_token', response.data.access);
    localStorage.setItem('refresh_token', response.data.refresh);
    setAuthToken(response.data.access); // Configurar o token imediatamente
    return response.data;
  } catch (error) {
    console.error("Error during login:", error.response?.data || error.message);
    throw new Error('Erro ao fazer login');
  }
};

// Função para pegar os dados do perfil
export const getProfile = async () => {
  const token = localStorage.getItem('access_token');
  setAuthToken(token);
  try {
    const response = await api.get('/profile/');
    return response.data;
  } catch (error) {
    console.error("Error fetching profile:", error.response?.data || error.message);
    throw new Error('Erro ao carregar perfil');
  }
};

// Função para atualizar o perfil
export const updateProfile = async (data) => {
  const token = localStorage.getItem('access_token');
  setAuthToken(token);

  const formData = new FormData();
  if (data.username) formData.append('username', data.username);
  if (data.current_password) formData.append('current_password', data.current_password);
  if (data.new_password) formData.append('new_password', data.new_password);
  if (data.profile_picture) formData.append('profile_picture', data.profile_picture);

  try {
    const response = await api.put('/profile/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    console.error("Error updating profile:", error.response?.data || error.message);
    throw new Error('Erro ao atualizar perfil');
  }
};