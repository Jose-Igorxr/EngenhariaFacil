import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // Ou sua instância configurada de api.js
import { API_URL } from '../config';
import '../styles/CriarPostagem.css';
import { FiUploadCloud, FiXCircle } from 'react-icons/fi'; // Ícones

const CriarPostagem = () => {
  const [titulo, setTitulo] = useState('');
  const [conteudo, setConteudo] = useState('');
  const [imagem, setImagem] = useState(null);
  const [imagemPreview, setImagemPreview] = useState(null);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleImagemChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // Limite de 5MB para imagem
        setErro('A imagem é muito grande. O tamanho máximo permitido é 5MB.');
        setImagem(null);
        setImagemPreview(null);
        e.target.value = null; // Limpa o input de arquivo
        return;
      }
      setImagem(file);
      setImagemPreview(URL.createObjectURL(file));
      setErro(''); // Limpa erro de tamanho se houver
    } else {
      setImagem(null);
      setImagemPreview(null);
    }
  };

  const removeImage = () => {
    setImagem(null);
    setImagemPreview(null);
    // Limpa o valor do input de arquivo para permitir selecionar o mesmo arquivo novamente se desejado
    const fileInput = document.getElementById('imagem-criar');
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErro('');
    setSucesso('');

    const token = localStorage.getItem('access_token');

    if (!token) {
      setErro('Sua sessão expirou ou você não está logado. Faça login novamente.');
      setIsSubmitting(false);
      // Opcionalmente, redirecionar para login: navigate('/login');
      return;
    }

    if (!titulo.trim() || !conteudo.trim()) {
        setErro('Título e conteúdo são obrigatórios.');
        setIsSubmitting(false);
        return;
    }

    const formData = new FormData();
    formData.append('titulo', titulo);
    formData.append('conteudo', conteudo);

    if (imagem) {
      formData.append('imagem', imagem);
    }

    try {
      // Certifique-se que a URL está correta e corresponde à sua API Django
      const response = await axios.post(
        `${API_URL}/api/postagens/`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            // 'Content-Type': 'multipart/form-data' é definido automaticamente pelo Axios ao usar FormData
          },
        }
      );

      setSucesso('Postagem criada com sucesso! Redirecionando...');
      setTitulo('');
      setConteudo('');
      setImagem(null);
      setImagemPreview(null);
      
      setTimeout(() => {
        // Redireciona para a página da nova postagem ou para a lista de "Minhas Postagens"
        navigate(response.data.id ? `/postagens/${response.data.id}` : '/minhas-postagens');
      }, 2000); // Tempo para o usuário ver a mensagem

    } catch (error) {
      let errorMessage = 'Ocorreu um erro ao criar a postagem.';
      if (error.response && error.response.data) {
        const backendErrors = error.response.data;
        if (backendErrors.titulo) errorMessage = `Título: ${backendErrors.titulo.join(', ')}`;
        else if (backendErrors.conteudo) errorMessage = `Conteúdo: ${backendErrors.conteudo.join(', ')}`;
        else if (backendErrors.imagem) errorMessage = `Imagem: ${backendErrors.imagem.join(', ')}`;
        else if (backendErrors.detail) errorMessage = backendErrors.detail;
        else if (typeof backendErrors === 'string') errorMessage = backendErrors;
      } else if (error.request) {
        errorMessage = 'Não foi possível conectar ao servidor. Verifique sua internet.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      setErro(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="criar-postagem-page-container"> {/* Container da página inteira */}
      <div className="form-card-criar"> {/* Card do formulário */}
        <h1 className="form-title">Criar Nova Postagem</h1>
        <p className="form-subtitle">Compartilhe suas ideias e projetos com a comunidade.</p>
        
        <form onSubmit={handleSubmit} className="criar-postagem-form">
          <div className="form-group">
            <label htmlFor="titulo-criar">Título da Postagem</label>
            <input
              id="titulo-criar"
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              required
              disabled={isSubmitting}
              placeholder="Um título impactante para sua postagem"
            />
          </div>
          <div className="form-group">
            <label htmlFor="conteudo-criar">Conteúdo</label>
            <textarea
              id="conteudo-criar"
              value={conteudo}
              onChange={(e) => setConteudo(e.target.value)}
              rows="12" // Aumentado para mais espaço
              required
              disabled={isSubmitting}
              placeholder="Escreva aqui o conteúdo detalhado da sua postagem..."
            />
          </div>
          <div className="form-group">
            <label htmlFor="imagem-criar" className="file-input-label">
              <FiUploadCloud /> Imagem da Postagem (Opcional, máx 5MB)
            </label>
            <input
              id="imagem-criar"
              type="file"
              accept="image/jpeg,image/png,image/gif"
              onChange={handleImagemChange}
              disabled={isSubmitting}
              className="file-input-field" // Para esconder o input padrão se desejado
            />
            {imagemPreview && (
              <div className="image-preview-container">
                <img src={imagemPreview} alt="Prévia da nova postagem" className="image-preview" />
                <button type="button" onClick={removeImage} className="remove-image-button" title="Remover imagem">
                  <FiXCircle size={18}/>
                </button>
              </div>
            )}
          </div>

          {erro && <p className="error-message-form">{erro}</p>}
          {sucesso && <p className="success-message-form">{sucesso}</p>}

          <div className="form-actions">
            <button type="button" className="cta-button secondary" onClick={() => navigate(-1)} disabled={isSubmitting}>
              Cancelar
            </button>
            <button type="submit" className="cta-button primary" disabled={isSubmitting}>
              {isSubmitting ? 'Publicando...' : 'Publicar Postagem'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CriarPostagem;
