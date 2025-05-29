import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config';
import '../styles/PostagensList.css';
import { FiSearch, FiXCircle, FiAlertCircle, FiInbox, FiInfo } from 'react-icons/fi'; // FiInfo adicionado aqui
import { motion, AnimatePresence } from 'framer-motion';

const PostagensList = () => {
  const [postagens, setPostagens] = useState([]);
  const [next, setNext] = useState(null);
  const [previous, setPrevious] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentSearch, setCurrentSearch] = useState('');

  const fetchPostagens = useCallback((url = `${API_URL}/api/postagens/`) => {
    setLoading(true);
    setError('');
    axios
      .get(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      })
      .then((res) => {
        setPostagens(Array.isArray(res.data.results) ? res.data.results : Array.isArray(res.data) ? res.data : []);
        setNext(res.data.next);
        setPrevious(res.data.previous);
      })
      .catch((err) => {
        setError('Não foi possível carregar as postagens. Tente atualizar a página ou verifique sua conexão.');
        setPostagens([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchPostagens();
  }, [fetchPostagens]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const executeSearch = () => {
    if (searchTerm.trim() === currentSearch.trim()) return;
    setCurrentSearch(searchTerm.trim());
    const searchUrl = `${API_URL}/api/postagens/?search=${encodeURIComponent(searchTerm.trim())}`;
    fetchPostagens(searchUrl);
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      executeSearch();
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    setCurrentSearch('');
    fetchPostagens();
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return 'Data indisponível';
    try {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString('pt-BR', options);
    } catch (e) {
      return 'Data inválida';
    }
  };

  return (
    <div className="postagens-list-page-container">
      <header className="postagens-list-header">
        <h1 className="secao-titulo-principal">Explore Nossas Postagens</h1>
        <p className="secao-subtitulo">
          Descubra dicas, novidades e compartilhe suas experiências sobre construção e reforma.
        </p>
      </header>

      <div className="search-bar-container">
        <div className="search-input-wrapper">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Pesquisar por título ou conteúdo..."
            value={searchTerm}
            onChange={handleSearchChange}
            onKeyPress={handleKeyPress}
            className="search-input"
          />
        </div>
        <motion.button 
          onClick={executeSearch} 
          className="search-button"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          disabled={loading}
        >
          Pesquisar
        </motion.button>
        {currentSearch && (
          <motion.button 
            onClick={clearSearch} 
            className="clear-search-button"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            disabled={loading}
          >
            <FiXCircle size={16} /> Limpar
          </motion.button>
        )}
      </div>

      {error && (
        <div className="error-message-container">
          <FiAlertCircle size={24} />
          <p>{error}</p>
        </div>
      )}

      {loading ? (
        <div className="loading-indicator">
          <div className="spinner"></div>
          <p>Carregando postagens...</p>
        </div>
      ) : (
        <AnimatePresence>
          {Array.isArray(postagens) && postagens.length > 0 ? (
            <>
              {currentSearch && (
                <p className="search-results-info">
                  Exibindo resultados para: <strong>"{currentSearch}"</strong>
                </p>
              )}
              <motion.div 
                className="postagens-grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                {postagens.map((post, index) => (
                  <motion.div
                    key={post.id}
                    className="post-card-item"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    whileHover={{ y: -5, boxShadow: "0 10px 20px rgba(0,0,0,0.1)"}}
                  >
                    {post.imagem && (
                      <Link to={`/postagens/${post.id}`} className="post-imagem-link">
                        <img
                          src={post.imagem}
                          alt={`Imagem da postagem ${post.titulo}`}
                          className="post-imagem"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      </Link>
                    )}
                    <div className="post-card-content">
                      <Link to={`/postagens/${post.id}`} className="post-titulo-link">
                        <h3 className="post-titulo">{post.titulo}</h3>
                      </Link>
                      <p className="post-resumo">
                        {post.conteudo ? `${post.conteudo.substring(0, 120)}...` : 'Sem resumo disponível.'}
                      </p>
                      <div className="post-meta">
                        <span className="post-autor">
                          Por: {typeof post.autor === 'object' && post.autor !== null ? post.autor.username || 'Autor Desconhecido' : post.autor || 'Autor Desconhecido'}
                        </span>
                        <span className="post-data">
                          {formatDate(post.data_criacao)}
                        </span>
                      </div>
                       <Link to={`/postagens/${post.id}`} className="btn-ver-mais">
                        Ler Mais <FiInfo size={14} style={{ marginLeft: '5px' }}/>
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              <div className="paginacao">
                {previous && (
                  <motion.button 
                    onClick={() => fetchPostagens(previous)} 
                    disabled={loading}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Página Anterior
                  </motion.button>
                )}
                {next && (
                  <motion.button 
                    onClick={() => fetchPostagens(next)} 
                    disabled={loading}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Próxima Página
                  </motion.button>
                )}
              </div>
            </>
          ) : (
            <div className="nenhuma-postagem-container">
              <FiInbox size={48} className="nenhuma-postagem-icon" />
              <p className="nenhuma-postagem-texto">
                {currentSearch 
                  ? `Nenhuma postagem encontrada para "${currentSearch}".` 
                  : 'Ainda não há postagens por aqui.'}
              </p>
              {currentSearch && (
                <button onClick={clearSearch} className="btn-limpar-pesquisa-alternativo">
                  Ver todas as postagens
                </button>
              )}
            </div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
};

export default PostagensList;
