import React, { useState, useEffect } from 'react';
import { FaUser, FaEnvelope, FaLock, FaCamera, FaEye, FaEyeSlash } from 'react-icons/fa';
import { debounce } from 'lodash';
import { useNavigate } from 'react-router-dom';
import '../styles/Perfil.css';
import { getProfile, updateProfile } from '../services/api';

const Perfil = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
    profileImageFile: null,
  });
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

  useEffect(() => {
    let isMounted = true;
    const fetchUser = async () => {
      try {
        const data = await getProfile();
        if (isMounted) {
          setUser(data);
          setFormData((prev) => ({
            ...prev,
            username: data.username || '',
            email: data.email || '',
          }));
          if (data.profile?.profile_picture) {
            setProfileImagePreview(data.profile.profile_picture);
          } else {
            setProfileImagePreview(null);
          }
        }
      } catch (err) {
        if (isMounted) {
          setError('Erro ao carregar perfil. Tente novamente.');
        }
      }
    };
    fetchUser();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === 'newPassword') {
      validatePassword(value);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (profileImagePreview && profileImagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(profileImagePreview);
      }
      setFormData((prev) => ({ ...prev, profileImageFile: file }));
      setProfileImagePreview(URL.createObjectURL(file));
      setSuccess('Imagem carregada com sucesso!');
      setError('');
    }
  };

  const debouncedSaveProfile = debounce(async (formData, token) => {
    const submission = new FormData();
    if (formData.username && formData.username !== user.username) {
      submission.append('username', formData.username);
    }
    if (formData.email && formData.email !== user.email) {
      submission.append('email', formData.email);
    }
    if (formData.newPassword) {
      submission.append('current_password', formData.currentPassword);
      submission.append('password', formData.newPassword);
    }
    if (formData.profileImageFile) {
      submission.append('profile.profile_picture', formData.profileImageFile);
    }

    try {
      const updatedUser = await updateProfile(submission);
      if (updatedUser.profile?.profile_picture) {
        if (profileImagePreview && profileImagePreview.startsWith('blob:')) {
          URL.revokeObjectURL(profileImagePreview);
        }
        setProfileImagePreview(updatedUser.profile.profile_picture);
      }
      setUser(updatedUser);
      setSuccess('Perfil atualizado com sucesso!');
      setFormData({
        username: updatedUser.username || '',
        email: updatedUser.email || '',
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
        profileImageFile: null,
      });
      setPasswordErrors({
        length: false,
        uppercase: false,
        number: false,
        special: false,
      });
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Erro ao atualizar perfil.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, 500);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    const { username, email, currentPassword, newPassword, confirmNewPassword } = formData;

    if (currentPassword || newPassword || confirmNewPassword) {
      if (!currentPassword || !newPassword || !confirmNewPassword) {
        setError('Preencha todos os campos de senha para alterar.');
        setIsLoading(false);
        return;
      }
      if (newPassword !== confirmNewPassword) {
        setError('As novas senhas não coincidem.');
        setIsLoading(false);
        return;
      }
      if (!validatePassword(newPassword)) {
        setError('A nova senha não atende aos requisitos.');
        setIsLoading(false);
        return;
      }
    }

    if (username && username.length < 3) {
      setError('O nome de usuário deve ter pelo menos 3 caracteres.');
      setIsLoading(false);
      return;
    }

    if (email && !/\S+@\S+\.\S+/.test(email)) {
      setError('Por favor, insira um e-mail válido.');
      setIsLoading(false);
      return;
    }

    const token = localStorage.getItem('access_token');
    if (!token) {
      setError('Usuário não autenticado. Faça login novamente.');
      setIsLoading(false);
      return;
    }

    debouncedSaveProfile(formData, token);
  };

  if (!user) {
    return <p>Carregando perfil...</p>;
  }

  const hasPasswordChanges =
    formData.currentPassword && formData.newPassword && formData.confirmNewPassword;
  const hasOtherChanges =
    formData.username !== user.username ||
    formData.email !== user.email ||
    formData.profileImageFile;

  const hasChanges = hasPasswordChanges || hasOtherChanges;

  return (
<div className="profile-container">
  <section className="profile-card">
    <div className="profile-header">
      <div className="profile-image-wrapper">
        {profileImagePreview ? (
          <img src={profileImagePreview} alt="Perfil" className="profile-image" />
        ) : (
          <div className="profile-image-placeholder">+</div>
        )}
        <input
          type="file"
          accept="image/*"
          id="profile-image-upload"
          onChange={handleImageUpload}
          style={{ display: 'none' }}
          disabled={isLoading}
        />
        <label htmlFor="profile-image-upload" className="cta-button small-button">
          Escolher Imagem
        </label>
      </div>
      <div className="profile-info">
        <h1>Olá, {user.username || 'Usuário'}</h1>
        <p>Gerencie suas informações pessoais e personalize seu perfil.</p>
      </div>
    </div>

    <form className="profile-form" onSubmit={handleSaveProfile}>
      <div className="profile-section">
        <h2>Nome de Usuário</h2>
        <div className="input-group">
          <label>Nome de usuário atual: {user.username || 'Não definido'}</label>
          <input
            type="text"
            name="username"
            placeholder="Novo nome de usuário"
            value={formData.username}
            onChange={handleChange}
            className="profile-input"
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="profile-section">
        <h2>E-mail</h2>
        <div className="input-group">
          <label>E-mail atual: {user.email || 'Não definido'}</label>
          <input
            type="email"
            name="email"
            placeholder="Novo e-mail"
            value={formData.email}
            onChange={handleChange}
            className="profile-input"
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="profile-section">
        <h2>Alterar Senha</h2>

        <div className="input-group">
          <label htmlFor="current-password">Senha Atual</label>
          <div className="input-wrapper">
            <input
              id="current-password"
              name="currentPassword"
              type={showCurrentPassword ? 'text' : 'password'}
              value={formData.currentPassword}
              onChange={handleChange}
              className="profile-input"
              disabled={isLoading}
            />
            <span
              className="toggle-password"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
            >
              {showCurrentPassword ? (
                <FaEyeSlash style={{ color: '#000' }} />
              ) : (
                <FaEye style={{ color: '#000' }} />
              )}
            </span>
          </div>
        </div>

        <div className="input-group">
          <label htmlFor="new-password">Nova Senha</label>
          <div className="input-wrapper">
            <input
              id="new-password"
              name="newPassword"
              type={showNewPassword ? 'text' : 'password'}
              value={formData.newPassword}
              onChange={handleChange}
              className="profile-input"
              disabled={isLoading}
            />
            <span
              className="toggle-password"
              onClick={() => setShowNewPassword(!showNewPassword)}
            >
              {showNewPassword ? (
                <FaEyeSlash style={{ color: '#000' }} />
              ) : (
                <FaEye style={{ color: '#000' }} />
              )}
            </span>
          </div>
          {formData.newPassword && (
            <ul className="password-requirements">
              {!passwordErrors.length && (
                <li className="invalid">Pelo menos 8 caracteres</li>
              )}
              {!passwordErrors.uppercase && (
                <li className="invalid">Pelo menos uma letra maiúscula</li>
              )}
              {!passwordErrors.number && (
                <li className="invalid">Pelo menos um número</li>
              )}
              {!passwordErrors.special && (
                <li className="invalid">Pelo menos um caractere especial (ex.: !@#$%)</li>
              )}
            </ul>
          )}
        </div>

        <div className="input-group">
          <label htmlFor="confirm-new-password">Confirmar Nova Senha</label>
          <div className="input-wrapper">
            <input
              id="confirm-new-password"
              name="confirmNewPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmNewPassword}
              onChange={handleChange}
              className="profile-input"
              disabled={isLoading}
            />
            <span
              className="toggle-password"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <FaEyeSlash style={{ color: '#000' }} />
              ) : (
                <FaEye style={{ color: '#000' }} />
              )}
            </span>
          </div>
        </div>
      </div>

      <div className="profile-actions">
        <button
          type="submit"
          className="cta-button"
          disabled={isLoading || !hasChanges}
        >
          {isLoading ? 'Salvando...' : 'Salvar Perfil'}
        </button>
      </div>

      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}
    </form>
  </section>
</div>
  );
  
};

export default Perfil;
