import { useState, useRef, useEffect } from 'react'; // Adicionado useRef e useEffect
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config';
import '../styles/Cadastro.css';

const Cadastro = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState({
    length: false,
    uppercase: false,
    number: false,
    special: false,
  });
  const [hasInteractedWithPassword, setHasInteractedWithPassword] = useState(false);

  const emailInputRef = useRef(null); // Referência para o campo de email
  const usernameInputRef = useRef(null); // Referência para o campo de username
  const passwordInputRef = useRef(null); // Referência para o campo de senha

  useEffect(() => {
    // Foca no campo relevante se houver um erro e não estiver carregando
    if (error && !isLoading) {
      if (error.toLowerCase().includes("email") && emailInputRef.current) {
        emailInputRef.current.focus();
      } else if (error.toLowerCase().includes("usuário") && usernameInputRef.current) {
        usernameInputRef.current.focus();
      } else if (error.toLowerCase().includes("senha") && passwordInputRef.current) {
        // Pode ser mais específico se o erro de senha for sobre requisitos ou não coincidência
        passwordInputRef.current.focus();
      } else if (emailInputRef.current) { // Fallback para email se não for específico
        emailInputRef.current.focus();
      }
    }
  }, [error, isLoading]);


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
    if (!hasInteractedWithPassword) {
      setHasInteractedWithPassword(true);
    }
    validatePassword(value);
  };

  const validateForm = () => {
    if (!email) {
      setError('Por favor, preencha o campo de email.');
      if (emailInputRef.current) emailInputRef.current.focus();
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Por favor, insira um formato de email válido (ex: nome@dominio.com).');
      if (emailInputRef.current) emailInputRef.current.focus();
      return false;
    }
    if (!username || username.length < 3) {
      setError('O nome de usuário deve ter pelo menos 3 caracteres.');
      if (usernameInputRef.current) usernameInputRef.current.focus();
      return false;
    }
    // Valida a senha ao submeter, mesmo que o usuário não tenha interagido diretamente
    // para mostrar os erros se a senha for inválida.
    if (!hasInteractedWithPassword) {
        setHasInteractedWithPassword(true); // Força a exibição dos requisitos se não interagiu
    }
    if (!validatePassword(password)) {
      setError('A senha não atende aos requisitos. Verifique os critérios abaixo.');
      if (passwordInputRef.current) passwordInputRef.current.focus();
      return false;
    }
    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      // Poderia focar no campo de confirmar senha aqui
      return false;
    }
    return true;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      setIsLoading(false); // Garante que isLoading seja resetado se a validação falhar
      return;
    }

    setIsLoading(true);

    try {
      await axios.post(
        `${API_URL}/api/profiles/register/`,
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
      navigate('/login');
    } catch (err) {
      let errorMessage = 'Erro ao cadastrar. Verifique os dados e tente novamente.';
      if (err.response?.data) {
        const data = err.response.data;
        // Tenta pegar mensagens de erro específicas do backend
        if (data.email && Array.isArray(data.email)) errorMessage = data.email[0];
        else if (data.username && Array.isArray(data.username)) errorMessage = data.username[0];
        else if (data.password && Array.isArray(data.password)) errorMessage = data.password[0];
        else if (data.detail) errorMessage = data.detail;
        else if (typeof data === 'string') errorMessage = data;
        // Se for um objeto com várias chaves, pega a primeira mensagem de erro
        else if (typeof data === 'object' && Object.keys(data).length > 0) {
            const firstErrorKey = Object.keys(data)[0];
            if (Array.isArray(data[firstErrorKey])) {
                errorMessage = data[firstErrorKey][0];
            } else {
                errorMessage = data[firstErrorKey];
            }
        }
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="cadastro-page">
      <div className="cadastro-left">
        <h1 className="main-title">Obra Fácil</h1>
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
          <h2 className="title">Criar Conta</h2>
          {/* Adicionado noValidate */}
          <form onSubmit={handleSubmit} className="form" noValidate>
            <div className="input-group">
              <label className="label" htmlFor="email-cadastro">Email</label>
              <input
                ref={emailInputRef}
                type="email"
                id="email-cadastro"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={`input ${error.toLowerCase().includes("email") || (email && !/\S+@\S+\.\S+/.test(email) && email.length > 0) ? 'input-invalid' : ''}`}
                placeholder="Digite seu email"
                disabled={isLoading}
                aria-invalid={error.toLowerCase().includes("email") || (email && !/\S+@\S+\.\S+/.test(email) && email.length > 0) ? "true" : "false"}
                aria-describedby="email-error-message"
              />
            </div>
            <div className="input-group">
              <label className="label" htmlFor="username-cadastro">Nome de usuário</label>
              <input
                ref={usernameInputRef}
                type="text"
                id="username-cadastro"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className={`input ${error.toLowerCase().includes("usuário") || (username && username.length > 0 && username.length < 3) ? 'input-invalid' : ''}`}
                placeholder="Mínimo 3 caracteres"
                disabled={isLoading}
                aria-invalid={error.toLowerCase().includes("usuário") || (username && username.length > 0 && username.length < 3) ? "true" : "false"}
                aria-describedby="username-error-message"
              />
            </div>
            <div className="input-group">
              <label className="label" htmlFor="password-cadastro">Senha</label>
              <input
                ref={passwordInputRef}
                type={showPassword ? 'text' : 'password'}
                id="password-cadastro"
                value={password}
                onChange={handlePasswordChange}
                onFocus={() => !hasInteractedWithPassword && setHasInteractedWithPassword(true)}
                required
                className={`input ${password && hasInteractedWithPassword && !Object.values(passwordErrors).every((v) => v) ? 'input-invalid' : ''}`}
                placeholder="Digite sua senha"
                disabled={isLoading}
                aria-invalid={password && hasInteractedWithPassword && !Object.values(passwordErrors).every((v) => v) ? "true" : "false"}
                aria-describedby="password-requirements-list"
              />
              <div className="show-password-control">
                <input
                  type="checkbox"
                  id="showPasswordCadastroCheckbox"
                  checked={showPassword}
                  onChange={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                />
                <label htmlFor="showPasswordCadastroCheckbox">Mostrar senha</label>
              </div>
              {hasInteractedWithPassword && (
                <ul className="password-requirements" id="password-requirements-list">
                  <li className={passwordErrors.length ? 'met' : 'invalid'}>Pelo menos 8 caracteres</li>
                  <li className={passwordErrors.uppercase ? 'met' : 'invalid'}>Pelo menos uma letra maiúscula</li>
                  <li className={passwordErrors.number ? 'met' : 'invalid'}>Pelo menos um número</li>
                  <li className={passwordErrors.special ? 'met' : 'invalid'}>Pelo menos um caractere especial</li>
                </ul>
              )}
            </div>
            <div className="input-group">
              <label className="label" htmlFor="confirmPassword-cadastro">Confirmar Senha</label>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword-cadastro"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className={`input ${confirmPassword && password && confirmPassword !== password ? 'input-invalid' : ''}`}
                placeholder="Confirme sua senha"
                disabled={isLoading}
                aria-invalid={confirmPassword && password && confirmPassword !== password ? "true" : "false"}
                aria-describedby="confirm-password-error-message"
              />
              <div className="show-password-control">
                <input
                  type="checkbox"
                  id="showConfirmPasswordCadastroCheckbox"
                  checked={showConfirmPassword}
                  onChange={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                />
                <label htmlFor="showConfirmPasswordCadastroCheckbox">Mostrar senha</label>
              </div>
            </div>
            {error && <p id={
                error.toLowerCase().includes("email") ? "email-error-message" :
                error.toLowerCase().includes("usuário") ? "username-error-message" :
                error.toLowerCase().includes("senha não coincidem") ? "confirm-password-error-message" :
                "form-error-message"
              } className="error-message" role="alert">{error}</p>}
            <button
              type="submit"
              className="button"
              disabled={isLoading}
            >
              {isLoading ? 'Cadastrando...' : 'Cadastrar'}
            </button>
          </form>
          <p className="alternative-action-text">
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
