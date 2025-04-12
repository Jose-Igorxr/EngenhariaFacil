import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config';
import '../styles/Cadastro.css';

const Cadastro = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState({
    length: false,
    uppercase: false,
    number: false,
    special: false,
  });

  const validatePassword = (value) => {
    const errors = {
      length: value.length >= 8,
      uppercase: /[A-Z]/.test(value),
      number: /\d/.test(value),
      special: /[!@#$%^&*(),.?":{}|<> -]/.test(value),
    };
    setPasswordErrors(errors);
    return Object.values(errors).every((valid) => valid);
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    validatePassword(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    console.log("📝 Submetendo cadastro...", { email, username, password });
    console.log("URL chamada:", `${API_URL}/profiles/register/`); // Log para depuração

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Por favor, insira um email válido.');
      console.error("❌ Erro: email inválido.");
      setIsLoading(false);
      return;
    }

    if (username.length < 3) {
      setError('O nome de usuário deve ter pelo menos 3 caracteres.');
      console.error("❌ Erro: username muito curto.");
      setIsLoading(false);
      return;
    }

    if (!validatePassword(password)) {
      setError('A senha não atende aos requisitos. Verifique os critérios abaixo.');
      console.error("❌ Erro: senha inválida.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        `${API_URL}/profiles/register/`,
        {
          email,
          username,
          password,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      console.log("✅ Cadastro bem-sucedido!", response.data);
      navigate('/login');
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Erro ao cadastrar. Verifique os dados e tente novamente.';
      console.error("❌ Erro no cadastro:", err.response?.data || err.message); // Log mais detalhado do erro
      setError(errorMessage);
    } finally {
      setIsLoading(false);
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
                className={`input ${email && !/\S+@\S+\.\S+/.test(email) ? 'invalid' : ''}`}
                placeholder="Digite seu email"
                disabled={isLoading}
              />
            </div>
            <div className="input-group">
              <label className="label">Nome de usuário</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className={`input ${username && username.length < 3 ? 'invalid' : ''}`}
                placeholder="Escolha um nome de usuário"
                disabled={isLoading}
              />
            </div>
            <div className="input-group">
              <label className="label">Senha</label>
              <input
                type="password"
                value={password}
                onChange={handlePasswordChange}
                required
                className={`input ${password && !Object.values(passwordErrors).every((v) => v) ? 'invalid' : ''}`}
                placeholder="Digite sua senha"
                disabled={isLoading}
              />
              <ul className="password-requirements">
                <li className={passwordErrors.length ? 'valid' : 'invalid'}>
                  Pelo menos 8 caracteres
                </li>
                <li className={passwordErrors.uppercase ? 'valid' : 'invalid'}>
                  Pelo menos uma letra maiúscula
                </li>
                <li className={passwordErrors.number ? 'valid' : 'invalid'}>
                  Pelo menos um número
                </li>
                <li className={passwordErrors.special ? 'valid' : 'invalid'}>
                  Pelo menos um caractere especial (ex.: !@#$% -)
                </li>
              </ul>
            </div>
            {error && <p className="error">{error}</p>}
            <button
              type="submit"
              className="button"
              disabled={isLoading}
            >
              {isLoading ? 'Cadastrando...' : 'Cadastrar'}
            </button>
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
