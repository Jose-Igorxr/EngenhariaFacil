import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const EditarPostagem = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [titulo, setTitulo] = useState('');
  const [conteudo, setConteudo] = useState('');
  const [imagem, setImagem] = useState(null); // Para armazenar a imagem selecionada
  const [imagemPreview, setImagemPreview] = useState(null); // Para exibir uma prévia da imagem
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  const token = localStorage.getItem('access_token');

  useEffect(() => {
    const buscarPostagem = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/postagens/${id}/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setTitulo(response.data.titulo);
        setConteudo(response.data.conteudo);
        setImagemPreview(response.data.imagem); // Supondo que o backend retorne a URL da imagem
        setLoading(false);
      } catch (err) {
        console.error('Erro ao carregar a postagem:', err);
        setErro('Erro ao carregar a postagem.');
        setLoading(false);
      }
    };

    buscarPostagem();
  }, [id, token]);

  const handleImagemChange = (e) => {
    const file = e.target.files[0];
    setImagem(file);
    setImagemPreview(URL.createObjectURL(file)); // Para exibir a prévia da imagem
  };

  const handleEditar = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('titulo', titulo);
    formData.append('conteudo', conteudo);
    if (imagem) {
      formData.append('imagem', imagem); // Adiciona a imagem se houver
    }

    try {
      await axios.patch(`http://localhost:8000/api/postagens/${id}/`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data', // Importante para enviar o FormData corretamente
        },
      });

      navigate(`/minhas-postagens`);
    } catch (err) {
      console.error('Erro ao atualizar a postagem:', err);
      setErro('Erro ao atualizar a postagem.');
    }
  };

  if (loading) return <p>Carregando...</p>;
  if (erro) return <p>{erro}</p>;

  return (
    <div>
      <h2>Editar Postagem</h2>
      <form onSubmit={handleEditar}>
        <div>
          <label>Título:</label>
          <input
            type="text"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Conteúdo:</label>
          <textarea
            value={conteudo}
            onChange={(e) => setConteudo(e.target.value)}
            required
          ></textarea>
        </div>
        <div>
          <label>Imagem:</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImagemChange}
          />
          {imagemPreview && (
            <div>
              <p>Prévia da Imagem:</p>
              <img src={imagemPreview} alt="Prévia" width="100" />
            </div>
          )}
        </div>
        <button type="submit">Salvar Alterações</button>
      </form>
    </div>
  );
};

export default EditarPostagem;
