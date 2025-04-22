import React, { useState, useEffect } from 'react';
import { FaUser, FaEnvelope, FaLock, FaCamera } from 'react-icons/fa';
import { debounce } from 'lodash';
import '../styles/Perfil.css';
import { getProfile, updateProfile } from '../services/api';

const Perfil = () => {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
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

  useEffect(() => {
    let isMounted = true;
    const fetchUser = async () => {
      try {
        const data = await getProfile();
        console.log('📥 Resposta do backend (GET /me/):', data); // Log para depuração
        if (isMounted) {
          setUser(data);
          setFormData((prev) => ({ ...prev, email: data.email || '' }));
          if (data.profile?.profile_picture) {
            console.log('🖼️ URL da imagem do perfil:', data.profile.profile_picture);
            setProfileImagePreview(data.profile.profile_picture);
          } else {
            console.log('⚠️ Nenhuma imagem de perfil encontrada na resposta.');
            setProfileImagePreview(null);
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error('❌ Erro ao carregar perfil:', err);
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
    if (formData.email && formData.email !== user.email) submission.append('email', formData.email);
    if (formData.newPassword) {
      submission.append('current_password', formData.currentPassword);
      submission.append('password', formData.newPassword);
    }
    if (formData.profileImageFile) {
      submission.append('profile.profile_picture', formData.profileImageFile);
    }

    try {
      const updatedUser = await updateProfile(submission);
      console.log('📥 Resposta do backend (PUT /me/):', updatedUser); // Log para depuração
      if (updatedUser.profile?.profile_picture) {
        if (profileImagePreview && profileImagePreview.startsWith('blob:')) {
          URL.revokeObjectURL(profileImagePreview);
        }
        console.log('🖼️ Nova URL da imagem do perfil:', updatedUser.profile.profile_picture);
        setProfileImagePreview(updatedUser.profile.profile_picture);
      } else {
        console.log('⚠️ Nenhuma imagem de perfil retornada após o upload.');
      }
      setUser(updatedUser);
      setSuccess('Perfil atualizado com sucesso!');
      setFormData({
        email: updatedUser.email || '',
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
        profileImageFile: null,
      });
    } catch (err) {
      console.error('❌ Erro ao atualizar perfil:', err);
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

    const { email, currentPassword, newPassword, confirmNewPassword, profileImageFile } = formData;

    if (newPassword && !currentPassword) {
      setError('A senha atual é obrigatória para alterar a senha.');
      setIsLoading(false);
      return;
    }

    if (newPassword && newPassword !== confirmNewPassword) {
      setError('As novas senhas não coincidem.');
      setIsLoading(false);
      return;
    }

    if (newPassword && newPassword.length < 8) {
      setError('A nova senha deve ter pelo menos 8 caracteres.');
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

  const hasChanges =
    formData.email !== user.email ||
    formData.currentPassword ||
    formData.newPassword ||
    formData.profileImageFile;

  return (
    <div className="profile-container">
      <section className="profile-content">
        <h1>Olá, {user.username || 'Usuário'}</h1>
        <p>Gerencie suas informações pessoais e personalize seu perfil.</p>

        <form className="profile-section" onSubmit={handleSaveProfile}>
          <h2><FaUser /> Imagem de Perfil</h2>
          <div className="profile-image-container">
            {profileImagePreview ? (
              <img src={profileImagePreview} alt="Perfil" className="profile-image" />
            ) : (
              <div className="profile-image-placeholder"><FaCamera /></div>
            )}
            <input
              type="file"
              accept="image/*"
              id="profile-image-upload"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
              disabled={isLoading}
            />
            <label htmlFor="profile-image-upload" className="cta-button">
              Escolher Imagem
            </label>
          </div>

          <h2><FaEnvelope /> E-mail</h2>
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

          <h2><FaLock /> Alterar Senha</h2>
          <div className="input-group">
            <label htmlFor="current-password">Senha Atual</label>
            <input
              id="current-password"
              name="currentPassword"
              type="password"
              value={formData.currentPassword}
              onChange={handleChange}
              className="profile-input"
              disabled={isLoading}
            />
          </div>
          <div className="input-group">
            <label htmlFor="new-password">Nova Senha</label>
            <input
              id="new-password"
              name="newPassword"
              type="password"
              value={formData.newPassword}
              onChange={handleChange}
              className="profile-input"
              disabled={isLoading}
            />
          </div>
          <div className="input-group">
            <label htmlFor="confirm-new-password">Confirmar Nova Senha</label>
            <input
              id="confirm-new-password"
              name="confirmNewPassword"
              type="password"
              value={formData.confirmNewPassword}
              onChange={handleChange}
              className="profile-input"
              disabled={isLoading}
            />
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