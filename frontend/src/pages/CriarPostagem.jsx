import React, { useState } from 'react'; // Removido useEffect se não for usado aqui
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/CriarPostagem.css';

const CriarPostagem = () => {
  const [titulo, setTitulo] = useState('');
  const [conteudo, setConteudo] = useState('');
  const [imagem, setImagem] = useState(null);
  const [imagemPreview, setImagemPreview] = useState(null); // Para prévia da imagem
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false); // Para feedback no botão
  const navigate = useNavigate();

  const handleImagemChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagem(file);
      setImagemPreview(URL.createObjectURL(file));
    } else {
      setImagem(null);
      setImagemPreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErro('');
    setSucesso('');

    const token = localStorage.getItem('access_token');
    // O autor será definido no backend com base no token, então não precisamos enviar 'autor' do localStorage.
    // Se o seu backend EXIGE 'autor' no payload, você precisará ajustar, mas o ideal é o backend inferir do token.

    if (!token) {
      setErro('Token de autenticação não encontrado. Faça login novamente.');
      setIsSubmitting(false);
      return;
    }

    const formData = new FormData();
    formData.append('titulo', titulo);
    formData.append('conteudo', conteudo);
    // formData.append('autor', autor); // Removido - o backend deve usar request.user

    if (imagem) {
      formData.append('imagem', imagem);
    }

    try {
      const response = await axios.post(
        'http://localhost:8000/api/postagens/', // Certifique-se que esta é a URL correta da sua view PostListCreateView
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      console.log('Postagem criada:', response.data);
      setSucesso('Postagem criada com sucesso!');
      setTitulo('');
      setConteudo('');
      setImagem(null);
      setImagemPreview(null);
      
      setTimeout(() => {
        navigate('/minhas-postagens'); // Ou para a página da nova postagem: `/postagens/${response.data.id}`
      }, 1500); // Aumentei um pouco o tempo para o usuário ver a mensagem de sucesso

    } catch (error) {
      let errorMessage = 'Erro ao criar postagem.';
      if (error.response && error.response.data) {
        const backendErrors = error.response.data;
        // Tenta pegar mensagens de erro mais específicas do backend
        if (backendErrors.titulo) errorMessage = `Título: ${backendErrors.titulo.join(', ')}`;
        else if (backendErrors.conteudo) errorMessage = `Conteúdo: ${backendErrors.conteudo.join(', ')}`;
        else if (backendErrors.imagem) errorMessage = `Imagem: ${backendErrors.imagem.join(', ')}`;
        else if (backendErrors.detail) errorMessage = backendErrors.detail;
        else if (typeof backendErrors === 'string') errorMessage = backendErrors;
        // Se for um objeto com múltiplos erros, você pode querer formatá-los
      } else if (error.message) {
        errorMessage = error.message;
      }
      setErro(`Erro ao criar postagem: ${errorMessage}`);
      console.error('Erro ao criar postagem:', error.response || error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="criar-postagem-container"> {/* Similar ao editar-postagem-container */}
      <div className="form-card"> {/* Similar ao editar-postagem */}
        <h2>Criar Nova Postagem</h2>
        <form onSubmit={handleSubmit} className="profile-form-similar"> {/* Reutilizando classe base */}
          <div className="form-group">
            <label htmlFor="titulo-criar">Título:</label>
            <input
              id="titulo-criar"
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>
          <div className="form-group">
            <label htmlFor="conteudo-criar">Conteúdo:</label>
            <textarea
              id="conteudo-criar"
              value={conteudo}
              onChange={(e) => setConteudo(e.target.value)}
              rows="10"
              required
              disabled={isSubmitting}
            />
          </div>
          <div className="form-group">
            <label htmlFor="imagem-criar">Imagem (opcional):</label>
            <input
              id="imagem-criar"
              type="file"
              accept="image/jpeg,image/png,image/gif"
              onChange={handleImagemChange}
              disabled={isSubmitting}
            />
            {imagemPreview && (
              <div className="image-preview-container">
                <p>Prévia da Imagem:</p>
                <img src={imagemPreview} alt="Prévia da nova postagem" className="image-preview" />
              </div>
            )}
          </div>

          {erro && <p className="error-message">{erro}</p>}
          {sucesso && <p className="success-message">{sucesso}</p>}

          <div className="form-actions">
            <button type="submit" className="cta-button" disabled={isSubmitting}>
              {isSubmitting ? 'Criando...' : 'Criar Postagem'}
            </button>
            <button type="button" className="cta-button secondary" onClick={() => navigate(-1)} disabled={isSubmitting}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CriarPostagem;