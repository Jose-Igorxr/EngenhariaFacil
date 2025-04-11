import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config';
import '../styles/Cadastro.css'; // Importa o CSS

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
      const response = await axios.post(`${API_URL}/profiles/register/`, {
        email,
        username,
        password,
      });
      console.log("Cadastro successful!", response);
      navigate('/login');
    } catch (error) {
      console.log("Cadastro error", error);
      setError('Erro ao cadastrar. Verifique os dados e tente novamente.');
    }
  };

  return (
    <div className="cadastro-page">
      <div className="cadastro-left">
        <h1 className="main-title">Engenharia Fácil</h1>
        <p className="sub-title">
          Junte-se a nós para simplificar suas obras com tecnologia inteligente!
        </p>
        <p className="sub-title">
          Crie sua conta e tenha acesso a ferramentas para calcular materiais,
          compartilhar projetos e muito mais.
        </p>
      </div>
      <div className="cadastro-right">
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
            <Link to="/login" className="link">
              Faça login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Cadastro;
