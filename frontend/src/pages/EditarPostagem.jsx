import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/EditarPostagem.css';

const EditarPostagem = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [titulo, setTitulo] = useState('');
  const [conteudo, setConteudo] = useState('');
  const [imagem, setImagem] = useState(null);
  const [imagemPreview, setImagemPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false); 
  const [erro, setErro] = useState('');

  const token = localStorage.getItem('access_token');

  useEffect(() => {
    const buscarPostagem = async () => {
      setLoading(true);
      setErro('');
      try {
        const response = await axios.get(`http://localhost:8000/api/postagens/${id}/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setTitulo(response.data.titulo);
        setConteudo(response.data.conteudo);
        if (response.data.imagem) {
          setImagemPreview(response.data.imagem);
        }
        setLoading(false);
      } catch (err) {
        console.error('Erro ao carregar a postagem:', err);
        setErro('Erro ao carregar a postagem. Verifique se você tem permissão para editá-la.');
        setLoading(false);
      }
    };

    if (id && token) {
      buscarPostagem();
    } else if (!token) {
      setErro("Autenticação necessária para editar postagens.");
      setLoading(false);
      // Opcional: redirecionar para login
      // navigate('/login');
    }
  }, [id, token, navigate]);

  const handleImagemChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagem(file);
      setImagemPreview(URL.createObjectURL(file));
    } else {
      // Se o usuário cancelar a seleção, podemos manter a imagem original ou limpar
      // Para este exemplo, vamos limpar o preview se nenhuma nova imagem for selecionada
      // e não havia imagem antes, ou manter a imagem original se ela existia.
      // Se você quiser que o usuário possa remover a imagem, precisará de lógica adicional.
      // setImagem(null);
      // setImagemPreview(null); // Ou reverter para a imagem original do backend se necessário
    }
  };

  const handleEditar = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErro('');

    const formData = new FormData();
    formData.append('titulo', titulo);
    formData.append('conteudo', conteudo);
    if (imagem) { // Só envia a imagem se uma nova foi selecionada
      formData.append('imagem', imagem);
    }
    // Se você quiser permitir a remoção da imagem, precisaria enviar um sinalizador
    // para o backend, ex: formData.append('remover_imagem', true);

    try {
      await axios.patch(`http://localhost:8000/api/postagens/${id}/`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      navigate(`/minhas-postagens`); // Ou para a página da postagem editada: /postagens/${id}
    } catch (err) {
      console.error('Erro ao atualizar a postagem:', err.response?.data || err.message);
      let errorMessage = 'Erro ao atualizar a postagem.';
      if (err.response && err.response.data) {
        // Tenta pegar mensagens de erro mais específicas do backend
        const backendErrors = err.response.data;
        if (backendErrors.titulo) errorMessage = `Título: ${backendErrors.titulo.join(', ')}`;
        else if (backendErrors.conteudo) errorMessage = `Conteúdo: ${backendErrors.conteudo.join(', ')}`;
        else if (backendErrors.imagem) errorMessage = `Imagem: ${backendErrors.imagem.join(', ')}`;
        else if (typeof backendErrors === 'string') errorMessage = backendErrors;
        else if (backendErrors.detail) errorMessage = backendErrors.detail;
      }
      setErro(errorMessage);
      setSaving(false);
    }
  };

  if (loading) return <div className="loading-container"><p>Carregando dados da postagem...</p></div>;
  // Se não houver token e o carregamento terminou, o erro de autenticação já deve estar setado
  if (!token && !loading) return <div className="error-container"><p>{erro || "Autenticação necessária."}</p></div>;
  if (erro && !titulo) return <div className="error-container"><p>{erro}</p></div>; // Se erro ao carregar e não tem título

  return (
    <div className="editar-postagem-container">
      <div className="form-card">
        <h2>Editar Postagem</h2>
        <form onSubmit={handleEditar} className="profile-form-similar">
          <div className="form-group">
            <label htmlFor="titulo-post">Título:</label>
            <input
              id="titulo-post"
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              required
              disabled={saving}
            />
          </div>

          <div className="form-group">
            <label htmlFor="conteudo-post">Conteúdo:</label>
            <textarea
              id="conteudo-post"
              value={conteudo}
              onChange={(e) => setConteudo(e.target.value)}
              rows="10"
              required
              disabled={saving}
            ></textarea>
          </div>

          <div className="form-group">
            <label htmlFor="imagem-post">Imagem (opcional):</label>
            <input
              id="imagem-post"
              type="file"
              accept="image/jpeg,image/png,image/gif"
              onChange={handleImagemChange}
              disabled={saving}
            />
            {imagemPreview && (
              <div className="image-preview-container">
                <p>Prévia da Imagem Atual:</p>
                <img src={imagemPreview} alt="Prévia da postagem" className="image-preview" />
              </div>
            )}
          </div>

          {erro && !loading && <p className="error-message">{erro}</p>}
          
          <div className="form-actions">
            <button type="submit" className="cta-button" disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar Alterações'}
            </button>
            <button type="button" className="cta-button secondary" onClick={() => navigate(-1)} disabled={saving}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditarPostagem;