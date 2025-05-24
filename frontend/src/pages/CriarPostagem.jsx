import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CriarPostagem = () => {
  const [titulo, setTitulo] = useState('');
  const [conteudo, setConteudo] = useState('');
  const [imagem, setImagem] = useState(null); 
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const navigate = useNavigate(); 

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('access_token');
    const autor = localStorage.getItem('userId');

    if (!token) {
      setErro('Token de autenticação não encontrado.');
      return;
    }

    if (!autor) {
      setErro('ID do usuário não encontrado no localStorage.');
      return;
    }

    // Criando FormData para incluir a imagem
    const formData = new FormData();
    formData.append('titulo', titulo);
    formData.append('conteudo', conteudo);
    formData.append('autor', autor);

   
    if (imagem) {
      formData.append('imagem', imagem); 
    }

    try {
      const response = await axios.post(
        'http://localhost:8000/api/postagens/',
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
      setErro('');
      setImagem(null);  

      
      setTimeout(() => {
        navigate('/minhas-postagens');
      }, 1000);

    } catch (error) {
      const errorMessage = error.response?.data?.detail || error.message;
      setErro(`Erro ao criar postagem: ${errorMessage}`);
      console.error('Erro ao criar postagem:', errorMessage);
    }
  };

  return (
    <div>
      <h2>Criar Postagem</h2>
      <form onSubmit={handleSubmit}>
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
          />
        </div>
        <div>
          <label>Imagem:</label>
          <input
            type="file"
            onChange={(e) => setImagem(e.target.files[0])} 
          />
        </div>
        <button type="submit">Criar</button>
      </form>
      {erro && <p style={{ color: 'red' }}>{erro}</p>}
      {sucesso && <p style={{ color: 'green' }}>{sucesso}</p>}
    </div>
  );
};

export default CriarPostagem;
