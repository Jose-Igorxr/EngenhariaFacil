import React, { useEffect, useState } from 'react';
import { getProfile, updateProfile } from '../services/api';

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
  if (error) return <p>{error}</p>;
  if (!profile) return <p>Perfil não encontrado</p>;

  return (
    <div style={{ padding: '20px' }}>
      <h1>Perfil</h1>
      <div>
        <p><strong>Nome:</strong> {profile.user.username}</p>
        <p><strong>Email:</strong> {profile.user.email}</p>
        <p><strong>Data de criação:</strong> {new Date(profile.created_at).toLocaleDateString()}</p>
        {profile.profile_picture ? (
          <img
            src={profile.profile_picture}
            alt="Foto de perfil"
            style={{ width: '100px', height: '100px', borderRadius: '50%' }}
          />
        ) : (
          <p>Sem foto de perfil</p>
        )}
      </div>
      <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
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
    </div>
  );
};

export default Profile;