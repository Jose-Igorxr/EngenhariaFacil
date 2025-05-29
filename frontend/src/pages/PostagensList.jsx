import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../styles/PostagensList.css'; // Mantenha seu CSS

const API_BASE_URL = 'http://localhost:8000/api/postagens/'; // URL base da API

function PostagensList() {
  const [postagens, setPostagens] = useState([]);
  const [next, setNext] = useState(null);
  const [previous, setPrevious] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(''); // Estado para o termo de pesquisa
  const [currentSearch, setCurrentSearch] = useState(''); // Para saber qual pesquisa gerou os resultados atuais

  const fetchPostagens = (url = API_BASE_URL) => {
    setLoading(true);
    axios
      .get(url, {
        headers: {
          // Remova o Authorization header se sua API de listagem de posts não requer autenticação
          // Se requer, certifique-se que 'access_token' está disponível e é válido
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      })
      .then((res) => {
        setPostagens(res.data.results);
        setNext(res.data.next);
        setPrevious(res.data.previous);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erro ao buscar postagens:", err);
        setLoading(false);
        // Adicione um feedback para o usuário aqui, se desejar
      });
  };

  useEffect(() => {
    fetchPostagens(); // Busca inicial de todas as postagens
  }, []);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const executeSearch = () => {
    setCurrentSearch(searchTerm); // Guarda o termo que foi pesquisado
    // Quando uma nova pesquisa é feita, começamos da primeira página dos resultados da pesquisa
    const searchUrl = `${API_BASE_URL}?search=${encodeURIComponent(searchTerm)}`;
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
    fetchPostagens(API_BASE_URL); // Volta para a listagem inicial
  };

  return (
    <div className="postagens-container">
      <h2 className="secao-titulo">Para você</h2>

      {/* Barra de Pesquisa */}
      <div className="search-bar-container">
        <input
          type="text"
          placeholder="Pesquisar postagens..."
          value={searchTerm}
          onChange={handleSearchChange}
          onKeyPress={handleKeyPress}
          className="search-input"
        />
        <button onClick={executeSearch} className="search-button">
          Pesquisar
        </button>
        {currentSearch && ( // Mostra o botão de limpar apenas se uma pesquisa foi feita
          <button onClick={clearSearch} className="clear-search-button">
            Limpar Pesquisa
          </button>
        )}
      </div>

      {loading ? (
        <p>Carregando postagens...</p>
      ) : Array.isArray(postagens) && postagens.length > 0 ? (
        <>
          {currentSearch && (
            <p className="search-results-info">
              Resultados da pesquisa para: <strong>"{currentSearch}"</strong>
            </p>
          )}
          {postagens.map((post) => (
            <div key={post.id} className="post-card">
              <div className="post-texto">
                <Link to={`/postagens/${post.id}`} className="post-titulo">
                  {post.titulo}
                </Link>
                <p className="post-resumo">
                  {/* Verifica se post.conteudo existe antes de tentar fatiar */}
                  {post.conteudo ? `${post.conteudo.slice(0, 100)}...` : 'Sem conteúdo para exibir.'}
                </p>
                <p className="post-autor">
                  <strong>Autor:</strong>{' '}
                  {/* Se post.autor for um objeto, você pode precisar de post.autor.username ou similar */}
                  {typeof post.autor === 'object' && post.autor !== null ? post.autor.username || 'Desconhecido' : post.autor || 'Desconhecido'}
                </p>
              </div>
              {post.imagem && (
                <img
                  src={post.imagem}
                  alt={`Imagem da postagem ${post.titulo}`}
                  className="post-imagem"
                />
              )}
            </div>
          ))}

          <div className="paginacao">
            {previous && (
              <button onClick={() => fetchPostagens(previous)}>
                Página Anterior
              </button>
            )}
            {next && (
              <button onClick={() => fetchPostagens(next)}>
                Próxima Página
              </button>
            )}
          </div>
        </>
      ) : (
        <p>
          {currentSearch 
            ? `Nenhuma postagem encontrada para "${currentSearch}".` 
            : 'Não há postagens disponíveis.'}
        </p>
      )}
    </div>
  );
}

export default PostagensList;