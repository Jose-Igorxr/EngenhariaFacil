import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config';
import '../styles/Cadastro.css'; // Importe o CSS

const Cadastro = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting form...", { email, username, password });
    try {
      const response = await axios.post(`${API_URL}/accounts/register/`, {
        email,
        username,
        password,
      });
      console.log("Cadastro successful!", response);
      navigate('/');
    } catch (error) {
      console.log("Cadastro error", error);
      setError('Erro ao cadastrar. Verifique os dados e tente novamente.');
    }
  };

  return (
    <div className="cadastro-container">
      <div className="cadastro-box">
        <h2 className="title">Cadastro</h2>
        <form onSubmit={handleSubmit} className="form">
          <div className="input-group">
            <label className="label">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input"
              placeholder="Digite seu email"
            />
          </div>
          <div className="input-group">
            <label className="label">Nome de usuário</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="input"
              placeholder="Escolha um nome de usuário"
            />
          </div>
          <div className="input-group">
            <label className="label">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="input"
              placeholder="Digite sua senha"
            />
          </div>
          {error && <p className="error">{error}</p>}
          <button type="submit" className="button">Cadastrar</button>
        </form>
        <p className="login-text">
          Já tem uma conta?{' '}
          <Link to="/" className="link">
            Faça login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Cadastro;