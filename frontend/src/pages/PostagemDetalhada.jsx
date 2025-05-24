import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/PostagemDetalhada.css';

const PostagemDetalhada = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [postagem, setPostagem] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  const token = localStorage.getItem('access_token');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchPostagem = async () => {
      try {
        const res = await axios.get(`http://localhost:8000/api/postagens/${id}/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPostagem(res.data);
      } catch (err) {
        console.error('Erro ao buscar postagem:', err);
        setErro('Erro ao carregar a postagem.');
      } finally {
        setCarregando(false);
      }
    };

    fetchPostagem();
  }, [id, navigate, token]);

  if (carregando) return <p>Carregando postagem...</p>;
  if (erro) return <p style={{ color: 'red' }}>{erro}</p>;
  if (!postagem) return <p>Postagem não encontrada.</p>;

  return (
    <div className="postagem-detalhada">
      <h2 className="titulo-postagem">{postagem.titulo}</h2>
      <div className="informacoes-postagem">
        <small>Por: {postagem.autor} | Publicado: {new Date(postagem.data_criacao).toLocaleString()}</small>
      </div>
      <p className="conteudo-postagem">{postagem.conteudo}</p>
      {postagem.imagem && (
        <img
          className="imagem-postagem"
          src={postagem.imagem}
          alt="Imagem da postagem"
        />
      )}
    </div>
  );
};

export default PostagemDetalhada;
