import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios'; // Certifique-se que 'axios' está configurado em api.js ou use a instância de lá
import { API_URL } from '../config'; // Usado para construir a URL completa
import '../styles/MinhasPostagens.css';
import { FiPlusCircle, FiEdit, FiTrash2, FiInfo } from 'react-icons/fi'; // Ícones

const MinhaPostagens = () => {
  const [postagens, setPostagens] = useState([]);
  const [erro, setErro] = useState('');
  const [isLoading, setIsLoading] = useState(true); // Adicionado estado de carregamento
  const navigate = useNavigate();
  const token = localStorage.getItem('access_token');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    setIsLoading(true);
    setErro(''); // Limpa erros anteriores ao buscar

    const fetchPostagens = async () => {
      try {
        // Use a variável API_URL para construir a URL completa
        const res = await axios.get(`${API_URL}/api/postagens/minhas/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        // Garante que 'postagens' seja sempre um array
        setPostagens(Array.isArray(res.data.results) ? res.data.results : Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        // console.error('Erro ao buscar postagens:', err);
        setErro('Erro ao carregar suas postagens. Tente atualizar a página.');
        setPostagens([]); // Define como array vazio em caso de erro
      } finally {
        setIsLoading(false);
      }
    };

    fetchPostagens();
  }, [token, navigate]);

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta postagem? Esta ação não pode ser desfeita.')) {
      try {
        await axios.delete(`${API_URL}/api/postagens/${id}/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPostagens(prevPostagens => prevPostagens.filter(post => post.id !== id));
      } catch (err) {
        // console.error('Erro ao excluir postagem:', err);
        setErro('Erro ao excluir a postagem. Tente novamente.');
      }
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
  };


  return (
    <div className="minhas-postagens-container">
      <div className="topo-postagens">
        <h1 className="titulo-pagina">Minhas Postagens</h1>
        <Link to="/criar-postagem" className="btn-criar-postagem">
          <FiPlusCircle size={18} /> Criar Nova Postagem
        </Link>
      </div>

      {erro && <p className="erro-mensagem-geral">{erro}</p>}

      {isLoading ? (
        <div className="loading-mensagem">Carregando suas postagens...</div>
      ) : Array.isArray(postagens) && postagens.length > 0 ? (
        <ul className="lista-postagens">
          {postagens.map(post => (
            <li key={post.id} className="postagem-item-card">
              <div className="postagem-conteudo">
                <h3 className="postagem-titulo">{post.titulo}</h3>
                <p className="postagem-resumo">
                  {post.conteudo ? post.conteudo.substring(0, 100) + (post.conteudo.length > 100 ? '...' : '') : 'Sem conteúdo prévio.'}
                </p>
                <small className="data-postagem">
                  Criado em: {formatDate(post.data_criacao)}
                </small>
                {post.data_atualizacao && post.data_atualizacao !== post.data_criacao && (
                   <small className="data-postagem data-atualizacao">
                     Atualizado em: {formatDate(post.data_atualizacao)}
                   </small>
                )}
              </div>
              <div className="acoes-postagem">
                <Link to={`/postagens/${post.id}`} className="btn-acao btn-detalhes" title="Ver Detalhes">
                  <FiInfo size={16} /> Detalhes
                </Link>
                <button 
                  onClick={() => navigate(`/editar-postagem/${post.id}`)} 
                  className="btn-acao btn-editar"
                  title="Editar Postagem"
                >
                  <FiEdit size={16} /> Editar
                </button>
                <button 
                  onClick={() => handleDelete(post.id)} 
                  className="btn-acao btn-excluir"
                  title="Excluir Postagem"
                >
                  <FiTrash2 size={16} /> Excluir
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="sem-postagens-container">
          <p className="sem-postagens-texto">Você ainda não tem nenhuma postagem. <FiPlusCircle size={20} /></p>
          <p className="sem-postagens-sugestao">Que tal <Link to="/criar-postagem" className="link-criar-sem-postagens">criar sua primeira agora</Link>?</p>
        </div>
      )}
    </div>
  );
};

export default MinhaPostagens;
