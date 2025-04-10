import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../services/api';
import '../styles/Login.css'; // Importando o CSS

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting form...", { email, password });
    try {
      const response = await login({ email, password });
      console.log("Login successful!", response);
      localStorage.setItem('token', response.access);
      navigate('/dashboard'); // Redireciona para o dashboard
    } catch (error) {
      console.log("Login error", error);
      setError('Email ou senha inválidos');
    }
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <h1 className="main-title">Engenharia Fácil</h1>
        <p className="sub-title">
          Simplifique o processo da sua obra com inteligência artificial! Estime facilmente a quantidade de materiais necessários e compartilhe experiências com outros usuários.
        </p>
        <p className="sub-title">
          Para cidadãos comuns e profissionais da construção civil, estamos aqui para ajudar a tornar sua obra mais eficiente e sem complicação!
        </p>
      </div>
      <div className="login-right">
        <div className="login-box">
          <h2 className="title">Login</h2>
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
            <button type="submit" className="button">Entrar</button>
          </form>
          <p className="register-text">
            Não tem uma conta?{' '}
            <Link to="/cadastro" className="link">
              Crie uma
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
