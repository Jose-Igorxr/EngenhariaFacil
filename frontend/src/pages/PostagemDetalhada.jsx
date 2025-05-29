import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom'; // Adicionado Link
import axios from 'axios'; // Ou sua instância configurada
import { API_URL } from '../config';
import '../styles/PostagemDetalhada.css';
import { FiLoader, FiAlertCircle, FiArrowLeft, FiUser, FiCalendar } from 'react-icons/fi'; // Ícones
import { motion } from 'framer-motion';

const PostagemDetalhada = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [postagem, setPostagem] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Renomeado para isLoading
  const [erro, setErro] = useState('');

  const token = localStorage.getItem('access_token');

  useEffect(() => {
    // Se não houver token e a rota for protegida, redireciona para login.
    // Se a rota for pública, esta verificação pode ser removida ou ajustada.
    if (!token) {
      // navigate('/login'); // Comentado para permitir visualização se a API não exigir token para GET
      // return;
    }

    const fetchPostagem = async () => {
      setIsLoading(true);
      setErro('');
      try {
        const headers = {};
        if (token) { // Adiciona token apenas se existir
          headers.Authorization = `Bearer ${token}`;
        }
        const res = await axios.get(`${API_URL}/api/postagens/${id}/`, { headers });
        setPostagem(res.data);
      } catch (err) {
        // console.error('Erro ao buscar postagem:', err);
        if (err.response && err.response.status === 404) {
          setErro('Postagem não encontrada.');
        } else {
          setErro('Erro ao carregar a postagem. Tente novamente mais tarde.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchPostagem();
  }, [id, token]); // Removido navigate da lista de dependências se não for usado no efeito

  const formatDate = (dateString) => {
    if (!dateString) return 'Data indisponível';
    try {
      const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
      return new Date(dateString).toLocaleDateString('pt-BR', options);
    } catch (e) {
      return 'Data inválida';
    }
  };

  if (isLoading) {
    return (
      <div className="loading-container-full-page">
        <FiLoader className="loading-spinner" size={40} />
        <p>Carregando postagem...</p>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="error-container-full-page">
        <FiAlertCircle size={40} />
        <p>{erro}</p>
        <button onClick={() => navigate('/postagens')} className="cta-button secondary">
          <FiArrowLeft /> Voltar para Postagens
        </button>
      </div>
    );
  }
  
  if (!postagem) { // Fallback caso postagem seja null após carregamento sem erro explícito
    return (
      <div className="error-container-full-page">
        <FiAlertCircle size={40} />
        <p>Postagem não encontrada ou não pôde ser carregada.</p>
         <button onClick={() => navigate('/postagens')} className="cta-button secondary">
          <FiArrowLeft /> Voltar para Postagens
        </button>
      </div>
    );
  }

  const autorNome = typeof postagem.autor === 'object' && postagem.autor !== null 
                    ? postagem.autor.username || 'Autor Desconhecido' 
                    : postagem.autor || 'Autor Desconhecido';

  return (
    <div className="postagem-detalhada-page-container">
      <motion.div 
        className="postagem-detalhada-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="postagem-detalhada-header">
          <button onClick={() => navigate(-1)} className="btn-voltar" title="Voltar">
            <FiArrowLeft size={20} /> Voltar
          </button>
        </div>

        <h1 className="titulo-postagem-detalhada">{postagem.titulo}</h1>
        
        <div className="informacoes-postagem-meta">
          <span className="meta-item">
            <FiUser size={14} /> Por: <strong>{autorNome}</strong>
          </span>
          <span className="meta-item">
            <FiCalendar size={14} /> Publicado em: {formatDate(postagem.data_criacao)}
          </span>
          {postagem.data_atualizacao && postagem.data_atualizacao !== postagem.data_criacao && (
            <span className="meta-item">
              <FiCalendar size={14} /> Atualizado em: {formatDate(postagem.data_atualizacao)}
            </span>
          )}
        </div>

        {postagem.imagem && (
          <div className="imagem-container-detalhada">
            <img
              className="imagem-postagem-detalhada"
              src={postagem.imagem}
              alt={`Imagem da postagem: ${postagem.titulo}`}
              onError={(e) => { e.target.style.display = 'none'; /* Oculta se a imagem quebrar */ }}
            />
          </div>
        )}

        {/* Usar dangerouslySetInnerHTML se o conteúdo for HTML, caso contrário, renderizar como texto */}
        {/* Se for texto simples com quebras de linha, pode usar white-space: pre-wrap no CSS */}
        <div className="conteudo-postagem-detalhada" dangerouslySetInnerHTML={{ __html: postagem.conteudo }}></div>
        {/* Alternativa para texto simples com quebras de linha:
        <p className="conteudo-postagem-detalhada">{postagem.conteudo}</p>
        E no CSS: .conteudo-postagem-detalhada { white-space: pre-wrap; }
        */}

      </motion.div>
    </div>
  );
};

export default PostagemDetalhada;
