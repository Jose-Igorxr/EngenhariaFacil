import axios from 'axios';
import { API_URL } from '../config';

export const login = async (credentials) => {
  console.log("Enviando para login:", credentials); // Adicione isso
  try {
    const response = await axios.post(`${API_URL}/accounts/login/`, credentials, {
      headers: { 'Content-Type': 'application/json' } // Garanta o header correto
    });
    return response.data;
  } catch (error) {
    console.error("Error during login:", error.response?.data || error.message);
    throw new Error('Erro ao fazer login');
  }
};