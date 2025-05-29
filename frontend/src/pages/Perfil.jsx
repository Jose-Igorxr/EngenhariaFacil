import React, { useState, useEffect, useRef } from 'react';
import {
  FaUserCircle,
  FaEnvelope,
  FaLock,
  FaCamera // Reintroduzido para o overlay da imagem
} from 'react-icons/fa';
// Ícones de olho customizados ou FaRegEye/FaRegEyeSlash não são mais necessários
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
  const [isLoading, setIsLoading] = useState(true);

  // Estados para controlar a visibilidade de cada senha
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [passwordErrors, setPasswordErrors] = useState({
    length: false,
    uppercase: false,
    number: false,
    special: false,
  });

  const fileInputRef = useRef(null);

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
      setIsLoading(true);
      try {
        const data = await getProfile();
        if (isMounted) {
          setUser(data);
          setFormData((prev) => ({
            ...prev,
            username: data.username || '',
            email: data.email || '',
          }));
          setProfileImagePreview(data.profile?.profile_picture || null);
        }
      } catch (err) {
        if (isMounted) {
          setError('Erro ao carregar perfil. Tente novamente.');
          setProfileImagePreview(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
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
      setSuccess('Imagem carregada. Salve as alterações para aplicá-la.');
      setError('');
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const debouncedSaveProfile = debounce(async (formDataToSave) => {
    const submission = new FormData();
    let hasChangesToSubmit = false;

    if (user && formDataToSave.username && formDataToSave.username !== user.username) {
      submission.append('username', formDataToSave.username);
      hasChangesToSubmit = true;
    }
    if (user && formDataToSave.email && formDataToSave.email !== user.email) {
      submission.append('email', formDataToSave.email);
      hasChangesToSubmit = true;
    }
    if (formDataToSave.newPassword) {
      submission.append('current_password', formDataToSave.currentPassword);
      submission.append('password', formDataToSave.newPassword);
      hasChangesToSubmit = true;
    }
    if (formDataToSave.profileImageFile) {
      submission.append('profile.profile_picture', formDataToSave.profileImageFile);
      hasChangesToSubmit = true;
    }

    if (!hasChangesToSubmit) {
      setSuccess('Nenhuma alteração para salvar.');
      setIsLoading(false);
      return;
    }

    try {
      const updatedUser = await updateProfile(submission);
      setUser(updatedUser);
      setSuccess('Perfil atualizado com sucesso!');
      
      if (updatedUser.profile?.profile_picture) {
        if (profileImagePreview && profileImagePreview.startsWith('blob:')) {
          URL.revokeObjectURL(profileImagePreview);
        }
        setProfileImagePreview(updatedUser.profile.profile_picture);
      } else if (!formDataToSave.profileImageFile) {
         setProfileImagePreview(null);
      }

      setFormData((prev) => ({
        ...prev,
        username: updatedUser.username || '',
        email: updatedUser.email || '',
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
        profileImageFile: null,
      }));
      setPasswordErrors({ length: false, uppercase: false, number: false, special: false });
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.message || 'Erro ao atualizar perfil.';
      setError(errorMessage);
      if (formDataToSave.profileImageFile && user?.profile?.profile_picture) {
        setProfileImagePreview(user.profile.profile_picture);
      } else if (formDataToSave.profileImageFile) {
        setProfileImagePreview(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, 500);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    const { username, email, currentPassword, newPassword, confirmNewPassword } = formData;

    if (newPassword || confirmNewPassword) {
        if (!currentPassword) {
            setError('Senha atual é obrigatória para alterar a senha.');
            return;
        }
        if (!newPassword || !confirmNewPassword) {
            setError('Preencha os campos de nova senha e confirmação para alterar.');
            return;
        }
        if (newPassword !== confirmNewPassword) {
            setError('As novas senhas não coincidem.');
            return;
        }
        if (!validatePassword(newPassword)) {
            setError('A nova senha não atende aos requisitos.');
            return;
        }
    }

    if (username && username.length < 3) {
      setError('O nome de usuário deve ter pelo menos 3 caracteres.');
      return;
    }
    if (email && !/\S+@\S+\.\S+/.test(email)) {
      setError('Por favor, insira um e-mail válido.');
      return;
    }
    
    const { profileImageFile } = formData;
    const hasUsernameChanged = user && username !== user.username;
    const hasEmailChanged = user && email !== user.email;
    const hasPasswordChanged = newPassword;
    const hasProfileImageChanged = profileImageFile;

    if (!hasUsernameChanged && !hasEmailChanged && !hasPasswordChanged && !hasProfileImageChanged) {
        setSuccess('Nenhuma alteração detectada.');
        return;
    }
    
    setIsLoading(true);
    debouncedSaveProfile(formData);
  };

  if (isLoading && !user) {
    return <div className="profile-container"><p className="loading-message">Carregando perfil...</p></div>;
  }

  if (!user && !isLoading) {
    return <div className="profile-container"><p className="error-message">{error || 'Não foi possível carregar o perfil.'}</p></div>;
  }
  
  const hasPendingChanges =
    (user && (formData.username !== user.username || formData.email !== user.email)) ||
    formData.newPassword ||
    formData.profileImageFile;

  return (
    <div className="profile-container">
      <section className="profile-card">
        <div className="profile-header">
          <div className="avatar-section">
            <div
              className="profile-image-wrapper"
              onClick={triggerFileInput}
              onKeyPress={(e) => e.key === 'Enter' && triggerFileInput()}
              role="button"
              tabIndex={0}
              aria-label="Mudar foto do perfil"
            >
              {profileImagePreview ? (
                <img src={profileImagePreview} alt="Perfil" className="profile-image" />
              ) : (
                <div className="profile-image-placeholder">
                  <FaUserCircle />
                </div>
              )}
              <div className="profile-image-overlay">
                <FaCamera /> {/* Ícone da React-Icons para a câmera */}
                <span>Mudar foto</span>
              </div>
            </div>
            <input
              type="file"
              accept="image/*"
              id="profile-image-upload"
              ref={fileInputRef}
              onChange={handleImageUpload}
              style={{ display: 'none' }}
              disabled={isLoading}
            />
          </div>
          <div className="profile-info">
            <h1>Olá, {user?.username || 'Usuário'}</h1>
            <p>Gerencie suas informações pessoais e personalize seu perfil.</p>
          </div>
        </div>

        <form className="profile-form" onSubmit={handleSaveProfile}>
          <div className="profile-section">
            <h2>Nome de Usuário</h2>
            <div className="input-group">
              <label htmlFor="username">Novo nome de usuário (atual: {user?.username || 'Não definido'})</label>
              <input
                id="username"
                type="text"
                name="username"
                placeholder="Digite o novo nome de usuário"
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
              <label htmlFor="email">Novo e-mail (atual: {user?.email || 'Não definido'})</label>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="Digite o novo e-mail"
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
              <input
                id="current-password"
                name="currentPassword"
                type={showCurrentPassword ? 'text' : 'password'}
                placeholder="Digite sua senha atual"
                value={formData.currentPassword}
                onChange={handleChange}
                className="profile-input"
                disabled={isLoading}
              />
              <div className="show-password-control">
                <input
                  type="checkbox"
                  id="showCurrentPasswordCheckbox"
                  checked={showCurrentPassword}
                  onChange={() => setShowCurrentPassword(!showCurrentPassword)}
                />
                <label htmlFor="showCurrentPasswordCheckbox">Mostrar senha</label>
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="new-password">Nova Senha</label>
              <input
                id="new-password"
                name="newPassword"
                type={showNewPassword ? 'text' : 'password'}
                placeholder="Digite a nova senha"
                value={formData.newPassword}
                onChange={handleChange}
                className="profile-input"
                disabled={isLoading}
              />
              <div className="show-password-control">
                <input
                  type="checkbox"
                  id="showNewPasswordCheckbox"
                  checked={showNewPassword}
                  onChange={() => setShowNewPassword(!showNewPassword)}
                />
                <label htmlFor="showNewPasswordCheckbox">Mostrar senha</label>
              </div>
              {formData.newPassword && (
                <ul className="password-requirements">
                  <li className={passwordErrors.length ? 'valid' : 'invalid'}>Pelo menos 8 caracteres</li>
                  <li className={passwordErrors.uppercase ? 'valid' : 'invalid'}>Pelo menos uma letra maiúscula</li>
                  <li className={passwordErrors.number ? 'valid' : 'invalid'}>Pelo menos um número</li>
                  <li className={passwordErrors.special ? 'valid' : 'invalid'}>Pelo menos um caractere especial</li>
                </ul>
              )}
            </div>

            <div className="input-group">
              <label htmlFor="confirm-new-password">Confirmar Nova Senha</label>
              <input
                id="confirm-new-password"
                name="confirmNewPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirme a nova senha"
                value={formData.confirmNewPassword}
                onChange={handleChange}
                className="profile-input"
                disabled={isLoading}
              />
              <div className="show-password-control">
                <input
                  type="checkbox"
                  id="showConfirmPasswordCheckbox"
                  checked={showConfirmPassword}
                  onChange={() => setShowConfirmPassword(!showConfirmPassword)}
                />
                <label htmlFor="showConfirmPasswordCheckbox">Mostrar senha</label>
              </div>
            </div>
          </div>

          <div className="profile-actions">
            <button
              type="submit"
              className="cta-button save-button"
              disabled={isLoading || !hasPendingChanges}
            >
              {isLoading ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>

          {error && <p className="error-message global-message">{error}</p>}
          {success && <p className="success-message global-message">{success}</p>}
        </form>
      </section>
    </div>
  );
};

export default Perfil;
