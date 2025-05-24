import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/MinhasPostagens.css';

const MinhaPostagens = () => {
  const [postagens, setPostagens] = useState([]);
  const [erro, setErro] = useState('');
  const navigate = useNavigate();
  const token = localStorage.getItem('access_token');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchPostagens = async () => {
      try {
        const res = await axios.get('http://localhost:8000/api/postagens/minhas/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPostagens(res.data.results || res.data); 
      } catch (err) {
        console.error('Erro ao buscar postagens:', err);
        setErro('Erro ao carregar postagens. Tente novamente.');
      }
    };

    fetchPostagens();
  }, [token, navigate]);

  const handleDelete = (id) => {
    if (window.confirm('Deseja realmente excluir esta postagem?')) {
      axios.delete(`http://localhost:8000/api/postagens/${id}/`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(() => {
        setPostagens(postagens.filter(post => post.id !== id));
      })
      .catch(err => {
        console.error('Erro ao excluir postagem:', err);
        setErro('Erro ao excluir a postagem. Tente novamente.');
      });
    }
  };

  return (
    <div className="minhas-postagens">
      <div className="topo-postagens">
        <h2 className="titulo-pagina">Minhas Postagens</h2>
        <Link to="/criar-postagem" className="btn-criar">Criar nova postagem</Link>
      </div>
      {erro && <p className="erro-mensagem">{erro}</p>}
      {Array.isArray(postagens) && postagens.length > 0 ? (
        <ul className="lista-postagens">
          {postagens.map(post => (
            <li key={post.id} className="postagem-item">
              <h3>{post.titulo}</h3>
              <small className="data-postagem">
                {new Date(post.data_criacao).toLocaleString()}
              </small>
              <div className="acoes-postagem">
                <Link to={`/postagens/${post.id}`} className="link-detalhes">Detalhes</Link> |{' '}
                <button onClick={() => navigate(`/editar-postagem/${post.id}`)} className="btn-editar">Editar</button>
                <button onClick={() => handleDelete(post.id)} className="btn-excluir">Excluir</button>
              </div>
              <hr />
            </li>
          ))}
        </ul>
      ) : (
        <p className="sem-postagens">Você ainda não criou nenhuma postagem.</p>
      )}
    </div>
  );
};

export default MinhaPostagens;
