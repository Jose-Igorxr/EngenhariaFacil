import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios'; // Ou sua instância configurada de api.js
import { API_URL } from '../config';
import '../styles/EditarPostagem.css';
import { FiUploadCloud, FiXCircle, FiSave, FiLoader, FiAlertCircle } from 'react-icons/fi'; // Ícones

const EditarPostagem = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [titulo, setTitulo] = useState('');
  const [conteudo, setConteudo] = useState('');
  const [imagem, setImagem] = useState(null); // Nova imagem para upload
  const [imagemPreview, setImagemPreview] = useState(null); // URL da imagem existente ou preview da nova
  const [imagemOriginalUrl, setImagemOriginalUrl] = useState(null); // Para saber se havia uma imagem antes
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(''); // Para feedback de sucesso

  const token = localStorage.getItem('access_token');
  const fileInputRef = useRef(null); // Para limpar o input de arquivo

  useEffect(() => {
    const buscarPostagem = async () => {
      setLoading(true);
      setErro('');
      try {
        const response = await axios.get(`${API_URL}/api/postagens/${id}/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setTitulo(response.data.titulo);
        setConteudo(response.data.conteudo);
        if (response.data.imagem) {
          setImagemPreview(response.data.imagem);
          setImagemOriginalUrl(response.data.imagem); // Guarda a URL original
        }
      } catch (err) {
        setErro('Erro ao carregar a postagem. Verifique se você tem permissão para editá-la ou se a postagem existe.');
      } finally {
        setLoading(false);
      }
    };

    if (id && token) {
      buscarPostagem();
    } else if (!token) {
      setErro("Autenticação necessária. Faça login para editar postagens.");
      setLoading(false);
      // Considere redirecionar para login após um pequeno delay ou com um botão
      // setTimeout(() => navigate('/login'), 3000);
    }
  }, [id, token]); // Removido navigate da dependência para evitar loops se usado no erro

  const handleImagemChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // Limite de 5MB
        setErro('A imagem é muito grande (máx 5MB).');
        setImagem(null);
        // Mantém o preview da imagem original se houver, ou limpa se não
        setImagemPreview(imagemOriginalUrl || null); 
        if(fileInputRef.current) fileInputRef.current.value = ""; // Limpa o input
        return;
      }
      setImagem(file); // Guarda o arquivo para upload
      setImagemPreview(URL.createObjectURL(file)); // Gera preview local
      setErro('');
    }
  };

  const removerImagemSelecionada = () => {
    setImagem(null); // Limpa o arquivo selecionado para upload
    setImagemPreview(imagemOriginalUrl || null); // Volta para a imagem original (se houver) ou nenhum preview
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Limpa o input de arquivo
    }
  };

  const handleEditar = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErro('');
    setSucesso('');

    if (!titulo.trim() || !conteudo.trim()) {
        setErro('Título e conteúdo são obrigatórios.');
        setSaving(false);
        return;
    }

    const formData = new FormData();
    formData.append('titulo', titulo);
    formData.append('conteudo', conteudo);
    
    if (imagem) { // Se uma NOVA imagem foi selecionada
      formData.append('imagem', imagem);
    } else if (imagemOriginalUrl && !imagemPreview) {
      // Se havia uma imagem original E o preview foi limpo (indicando remoção)
      // Seu backend precisa de uma forma de saber para remover a imagem.
      // Ex: formData.append('remover_imagem', 'true');
      // Por ora, se imagemPreview é null e imagemOriginalUrl existia, o backend
      // pode interpretar isso como "manter se nenhuma nova imagem for enviada" ou
      // "remover se um campo específico for enviado".
      // Se apenas não enviar o campo 'imagem', muitos backends mantêm a imagem existente.
      // Se você quer explicitamente remover, adicione um campo como 'imagem': null ou um booleano.
      // Para este exemplo, não enviar 'imagem' quando 'imagemPreview' é null e 'imagem' (File object) é null
      // geralmente resulta em manter a imagem no backend se ele não espera um campo para remover.
      // Se o seu backend remove a imagem se o campo 'imagem' não estiver presente no PATCH,
      // então esta lógica está ok para remover. Caso contrário, você precisará de um campo específico.
    }


    try {
      await axios.patch(`${API_URL}/api/postagens/${id}/`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          // 'Content-Type': 'multipart/form-data' é definido automaticamente
        },
      });
      setSucesso('Postagem atualizada com sucesso! Redirecionando...');
      setTimeout(() => {
        navigate(`/minhas-postagens`); // Ou para /postagens/${id}
      }, 1500);
    } catch (err) {
      let errorMessage = 'Erro ao atualizar a postagem.';
      if (err.response && err.response.data) {
        const backendErrors = err.response.data;
        if (backendErrors.titulo) errorMessage = `Título: ${backendErrors.titulo.join(', ')}`;
        else if (backendErrors.conteudo) errorMessage = `Conteúdo: ${backendErrors.conteudo.join(', ')}`;
        else if (backendErrors.imagem) errorMessage = `Imagem: ${backendErrors.imagem.join(', ')}`;
        else if (backendErrors.detail) errorMessage = backendErrors.detail;
        else if (typeof backendErrors === 'string') errorMessage = backendErrors;
      } else if (err.request) {
        errorMessage = 'Não foi possível conectar ao servidor.';
      } else {
        errorMessage = err.message;
      }
      setErro(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container-full-page">
        <FiLoader className="loading-spinner" size={40} />
        <p>Carregando dados da postagem...</p>
      </div>
    );
  }

  if (erro && !titulo) { // Erro ao carregar a postagem inicial e não há dados
    return (
      <div className="error-container-full-page">
        <FiAlertCircle size={40} />
        <p>{erro}</p>
        <button onClick={() => navigate('/minhas-postagens')} className="cta-button secondary">
          Voltar para Minhas Postagens
        </button>
      </div>
    );
  }


  return (
    <div className="editar-postagem-page-container">
      <div className="form-card-editar">
        <h1 className="form-title">Editar Postagem</h1>
        <p className="form-subtitle">Ajuste os detalhes da sua postagem conforme necessário.</p>
        
        <form onSubmit={handleEditar} className="editar-postagem-form">
          <div className="form-group">
            <label htmlFor="titulo-post">Título da Postagem</label>
            <input
              id="titulo-post"
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              required
              disabled={saving}
              placeholder="Título da sua postagem"
            />
          </div>

          <div className="form-group">
            <label htmlFor="conteudo-post">Conteúdo</label>
            <textarea
              id="conteudo-post"
              value={conteudo}
              onChange={(e) => setConteudo(e.target.value)}
              rows="12"
              required
              disabled={saving}
              placeholder="Detalhes da sua postagem..."
            ></textarea>
          </div>

          <div className="form-group">
            <label htmlFor="imagem-post" className="file-input-label">
              <FiUploadCloud /> {imagemPreview ? 'Alterar Imagem' : 'Adicionar Imagem'} (Opcional, máx 5MB)
            </label>
            <input
              ref={fileInputRef}
              id="imagem-post"
              type="file"
              accept="image/jpeg,image/png,image/gif"
              onChange={handleImagemChange}
              disabled={saving}
              className="file-input-field"
            />
            {imagemPreview && (
              <div className="image-preview-container">
                <img src={imagemPreview} alt="Prévia da postagem" className="image-preview" />
                <button 
                  type="button" 
                  onClick={removerImagemSelecionada} 
                  className="remove-image-button" 
                  title="Remover imagem selecionada/atual"
                  disabled={saving}
                >
                  <FiXCircle size={18}/>
                </button>
              </div>
            )}
          </div>

          {erro && <p className="error-message-form">{erro}</p>}
          {sucesso && <p className="success-message-form">{sucesso}</p>}
          
          <div className="form-actions">
            <button 
              type="button" 
              className="cta-button secondary" 
              onClick={() => navigate(imagemOriginalUrl ? `/postagens/${id}` : '/minhas-postagens')} 
              disabled={saving}
            >
              Cancelar
            </button>
            <button type="submit" className="cta-button primary" disabled={saving || loading}>
              {saving ? <><FiLoader className="button-spinner"/> Salvando...</> : <><FiSave /> Salvar Alterações</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditarPostagem;
