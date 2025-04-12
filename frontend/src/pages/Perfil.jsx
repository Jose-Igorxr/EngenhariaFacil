import React, { useState, useEffect } from 'react';
import { FaUser, FaEnvelope, FaLock, FaCamera } from 'react-icons/fa';
import '../styles/Perfil.css';
import { getProfile, updateProfile } from '../services/api';

const Perfil = () => {
  const [user, setUser] = useState({ username: '', email: '', profile: { profile_picture: null } });
  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Carrega dados do usuário
  useEffect(() => {
    const fetchUser = async () => {
      console.log("🔄 Iniciando requisição para carregar dados do usuário...");
      try {
        const data = await getProfile();
        console.log("🔍 Dados recebidos:", data);
        setUser(data);
        if (data.profile?.profile_picture) {
          setProfileImagePreview(`${API_URL}/media/${data.profile.profile_picture}`);
        }
      } catch (err) {
        console.error("❌ Erro ao carregar dados do perfil:", err);
        setError('Erro ao carregar perfil. Tente novamente.');
      }
    };
    fetchUser();
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log("📸 Imagem escolhida:", file);
      setProfileImageFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setProfileImagePreview(reader.result);
        setSuccess('Imagem carregada com sucesso!');
        setError('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    console.log("📝 Salvando perfil...");
    console.log("📧 Novo e-mail:", newEmail);
    console.log("🔒 Senha atual:", currentPassword);
    console.log("🔑 Nova senha:", newPassword);
    console.log("🔄 Confirmação nova senha:", confirmNewPassword);
    console.log("📸 Imagem de perfil:", profileImageFile ? "Selecionada" : "Nenhuma");

    // Validações
    if (newPassword && !currentPassword) {
      setError('A senha atual é obrigatória para alterar a senha.');
      console.error("❌ Erro: senha atual não fornecida.");
      setIsLoading(false);
      return;
    }

    if (newPassword && newPassword !== confirmNewPassword) {
      setError('As novas senhas não coincidem.');
      console.error("❌ Erro: novas senhas não coincidem.");
      setIsLoading(false);
      return;
    }

    if (newPassword && newPassword.length < 8) {
      setError('A nova senha deve ter pelo menos 8 caracteres.');
      console.error("❌ Erro: nova senha muito curta.");
      setIsLoading(false);
      return;
    }

    if (newEmail && !/\S+@\S+\.\S+/.test(newEmail)) {
      setError('Por favor, insira um e-mail válido.');
      console.error("❌ Erro: e-mail inválido.");
      setIsLoading(false);
      return;
    }

    const token = localStorage.getItem('access_token');
    if (!token) {
      setError('Usuário não autenticado. Faça login novamente.');
      console.error("❌ Erro: token não encontrado.");
      setIsLoading(false);
      return;
    }

    const updateData = {};
    if (newEmail) updateData.email = newEmail;
    if (newPassword) {
      updateData.current_password = currentPassword;
      updateData.new_password = newPassword;
    }
    if (profileImageFile) updateData.profile_picture = profileImageFile;
    console.log("🔄 Enviando dados para a API:", updateData);

    try {
      if (Object.keys(updateData).length > 0) {
        const updatedUser = await updateProfile(updateData);
        console.log("✅ Perfil atualizado com sucesso:", updatedUser);
        setUser(updatedUser);
        if (updatedUser.profile?.profile_picture) {
          setProfileImagePreview(`${API_URL}/media/${updatedUser.profile.profile_picture}`);
        }
      } else {
        console.log("⚠️ Nenhum dado para atualizar.");
      }

      setSuccess('Perfil atualizado com sucesso!');
      setNewEmail('');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setProfileImageFile(null);
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Erro ao atualizar perfil. Verifique os dados.';
      setError(errorMessage);
      console.error("❌ Erro ao salvar perfil:", err);
    } finally {
      setIsLoading(false);
    }
  };

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
              <div className="profile-image-placeholder">
                <FaCamera />
              </div>
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
        </form>

        <form className="profile-section" onSubmit={handleSaveProfile}>
          <h2><FaEnvelope /> E-mail</h2>
          <div className="input-group">
            <label>E-mail atual: {user.email || 'Não definido'}</label>
            <input
              type="email"
              placeholder="Novo e-mail"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="profile-input"
              disabled={isLoading}
            />
          </div>
        </form>

        <form className="profile-section" onSubmit={handleSaveProfile}>
          <h2><FaLock /> Alterar Senha</h2>
          <div className="input-group">
            <label htmlFor="current-password">Senha Atual</label>
            <input
              id="current-password"
              type="password"
              placeholder="Digite sua senha atual"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="profile-input"
              disabled={isLoading}
            />
          </div>
          <div className="input-group">
            <label htmlFor="new-password">Nova Senha</label>
            <input
              id="new-password"
              type="password"
              placeholder="Digite a nova senha"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="profile-input"
              disabled={isLoading}
            />
          </div>
          <div className="input-group">
            <label htmlFor="confirm-new-password">Confirmar Nova Senha</label>
            <input
              id="confirm-new-password"
              type="password"
              placeholder="Confirme a nova senha"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              className="profile-input"
              disabled={isLoading}
            />
          </div>

          <div className="profile-actions">
            <button
              type="submit"
              className="cta-button"
              disabled={isLoading}
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