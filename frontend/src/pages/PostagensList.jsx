import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../styles/PostagensList.css';

function PostagensList() {
  const [postagens, setPostagens] = useState([]);
  const [next, setNext] = useState(null);
  const [previous, setPrevious] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchPostagens = (url = 'http://localhost:8000/api/postagens/') => {
    setLoading(true);
    axios
      .get(url, {
        headers: {
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
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPostagens();
  }, []);

  return (
    <div className="postagens-container">
      <h2 className="secao-titulo">Para você</h2>
      {loading ? (
        <p>Carregando postagens...</p>
      ) : Array.isArray(postagens) && postagens.length > 0 ? (
        <>
          {postagens.map((post) => (
            <div key={post.id} className="post-card">
              <div className="post-texto">
                <Link to={`/postagens/${post.id}`} className="post-titulo">
                  {post.titulo}
                </Link>
                <p className="post-resumo">{post.conteudo.slice(0, 100)}...</p>
                <p className="post-autor">
                  <strong>Autor:</strong> {post.autor}
                </p>
              </div>
              {post.imagem && (
                <img
                  src={post.imagem}
                  alt="Imagem da postagem"
                  className="post-imagem"
                />
              )}
            </div>
          ))}

          <div className="paginacao">
            {previous && (
              <button onClick={() => fetchPostagens(previous)}>Página Anterior</button>
            )}
            {next && (
              <button onClick={() => fetchPostagens(next)}>Próxima Página</button>
            )}
          </div>
        </>
      ) : (
        <p>Não há postagens disponíveis.</p>
      )}
    </div>
  );
}

export default PostagensList;
