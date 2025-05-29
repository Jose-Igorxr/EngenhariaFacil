import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../services/api';
import '../styles/Login.css';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("🚀 Formulário de login enviado");
    console.log("📧 Email:", email);
    console.log("🔒 Senha:", password);

    try {
      const response = await login({ email, password });
      console.log("✅ Login realizado com sucesso");
      console.log("📦 Tokens recebidos:", response);

      // Salvando tokens
      localStorage.setItem('access_token', response.access);
      localStorage.setItem('refresh_token', response.refresh);
      localStorage.setItem('userId', response.user_id);

      console.log("💾 Tokens salvos no localStorage");

      navigate('/Home'); 
    } catch (error) {
      console.error("❌ Erro ao fazer login:", error.message);
      if (error.response) {
        console.error("📡 Resposta do servidor:", error.response.data);
      }

      setError('Email ou senha inválidos');
    }
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <h1 className="main-title">Obra Fácil</h1>
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
          <p className="register-text">Esqueceu a senha?</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
