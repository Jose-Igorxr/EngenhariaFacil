import React, { useEffect, useState } from 'react';
import { getProfile, updateProfile } from '../services/api';
import '../styles/Perfil.css';
import defaultProfileImage from '../assets/images/default-profile.png';  // Importe a imagem padrão

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);

  // Carregar os dados do perfil ao montar a página
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfile();
        setProfile(data);
      } catch (error) {
        setError('Erro ao carregar o perfil');
        console.error('Erro ao chamar getProfile:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []); // Array de dependências vazio, garantindo que só rode uma vez

  // Lidar com o upload da foto
  const handlePictureChange = (e) => {
    setProfilePicture(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!profilePicture) return;

    try {
      const updatedProfile = await updateProfile({ profile_picture: profilePicture });
      setProfile(updatedProfile);
      setProfilePicture(null); // Limpar o input após sucesso
      alert('Foto de perfil atualizada com sucesso!');
    } catch (error) {
      console.error("Error updating profile:", error.response?.data || error.message);
      setError('Erro ao atualizar perfil');
    }
  };

  if (loading) return <p>Carregando...</p>;
  if (error) return <p className="profile-feedback">{error}</p>;
  if (!profile) return <p className="profile-feedback">Perfil não encontrado</p>;

  return (
    <div className="profile-container">
      <h1>Perfil</h1>
      <div className="profile-info">
        <p><strong>Nome:</strong> {profile.user.username}</p>
        <p><strong>Email:</strong> {profile.user.email}</p>
        <p><strong>Data de criação:</strong> {new Date(profile.created_at).toLocaleDateString()}</p>

        {/* Verifica se o usuário tem foto de perfil, caso contrário, usa a imagem padrão */}
        <img
          className="profile-image"
          src={profile.profile_picture ? profile.profile_picture : defaultProfileImage}
          alt="Foto de perfil"
        />
      </div>

      <form onSubmit={handleSubmit} className="profile-form">
        <label>
          Alterar foto de perfil:
          <input
            type="file"
            accept="image/*"
            onChange={handlePictureChange}
          />
        </label>
        <button type="submit" disabled={!profilePicture}>
          Atualizar Foto
        </button>
      </form>

      {error && <p className="profile-feedback">{error}</p>}
    </div>
  );
};

export default Profile;
