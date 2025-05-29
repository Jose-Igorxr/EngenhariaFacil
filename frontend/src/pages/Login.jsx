import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../services/api';
import '../styles/Login.css';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const emailInputRef = useRef(null);
  const passwordInputRef = useRef(null); // Referência para o campo de senha, se necessário focar

  useEffect(() => {
    // Foca no campo de email se houver um erro genérico de login
    // ou se o erro for específico de email e não estiver carregando.
    // Para erros de senha, poderia focar no campo de senha.
    if (error && !isLoading && emailInputRef.current) {
      // Se o erro não for sobre a senha, foca no email.
      // Poderíamos adicionar uma lógica mais granular se soubermos o tipo de erro.
      emailInputRef.current.focus();
    }
  }, [error, isLoading]);

  const validateEmail = (emailToValidate) => {
    if (!emailToValidate) {
      setError('Por favor, preencha o campo de email.');
      setIsLoading(false);
      if (emailInputRef.current) emailInputRef.current.focus();
      return false;
    }
    // Regex simples para validação de formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailToValidate)) {
      setError('Por favor, insira um formato de email válido (ex: nome@dominio.com).');
      setIsLoading(false);
      if (emailInputRef.current) emailInputRef.current.focus();
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validação customizada do email antes de prosseguir
    if (!validateEmail(email)) {
      return; // Interrompe se o email for inválido
    }

    if (!password) { // Validação simples para senha não vazia
        setError('Por favor, preencha o campo de senha.');
        if (passwordInputRef.current) passwordInputRef.current.focus();
        return;
    }

    setIsLoading(true);

    try {
      const response = await login({ email, password });
      localStorage.setItem('access_token', response.access);
      localStorage.setItem('refresh_token', response.refresh);
      localStorage.setItem('userId', response.user_id);
      navigate('/home');
    } catch (err) {
      const apiError = err.response?.data?.detail || err.response?.data?.error || 'Email ou senha inválidos. Verifique suas credenciais.';
      setError(apiError);
      // Foca no campo de email após erro da API, pois é o primeiro campo
      if (emailInputRef.current) emailInputRef.current.focus();
    } finally {
      setIsLoading(false);
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
          {/* Adicionado noValidate para usar validação customizada */}
          <form onSubmit={handleSubmit} className="form" noValidate>
            <div className="input-group">
              <label className="label" htmlFor="email">Email</label>
              <input
                ref={emailInputRef}
                type="email" // Mantém o tipo para sugestões de teclado em mobile, etc.
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                // 'required' pode ser removido se a validação customizada for suficiente,
                // mas mantê-lo não prejudica e adiciona uma camada de acessibilidade.
                required 
                className="input"
                placeholder="Digite seu email"
                disabled={isLoading}
                aria-describedby={error && email.length > 0 && !/\S+@\S+\.\S+/.test(email) ? "email-error" : undefined}
              />
            </div>
            <div className="input-group">
              <label className="label" htmlFor="password">Senha</label>
              <input
                ref={passwordInputRef} // Adiciona ref ao campo de senha
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input"
                placeholder="Digite sua senha"
                disabled={isLoading}
                aria-describedby={error && password.length === 0 ? "password-error" : undefined}
              />
              <div className="show-password-control">
                <input
                  type="checkbox"
                  id="showPasswordCheckbox"
                  checked={showPassword}
                  onChange={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                />
                <label htmlFor="showPasswordCheckbox">Mostrar senha</label>
              </div>
            </div>
            {/* Renderiza a mensagem de erro do estado */}
            {error && <p id={error.toLowerCase().includes("email") ? "email-error" : "password-error"} className="error-message">{error}</p>}
            <button 
              type="submit" 
              className="button" 
              disabled={isLoading}
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
          <p className="alternative-action-text">
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
