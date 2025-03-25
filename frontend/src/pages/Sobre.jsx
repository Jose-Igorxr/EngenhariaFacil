// src/pages/Sobre.jsx
import React from 'react';
import '../styles/Sobre.css';

const Sobre = () => {
  return (
    <div className="sobre-container">
      <div className="sobre-box">
        <h2 className="title">Engenharia Fácil</h2>
        <h3 className="subtitle">Visão Geral do Projeto</h3>
        <p className="text">
          Plataforma de suporte para pessoas que desejam iniciar uma obra, oferecendo auxílio tanto para cidadãos comuns quanto para profissionais da construção civil. Nosso objetivo é simplificar o processo por meio de uma IA capaz de estimar a quantidade média de materiais necessários para a obra. Além disso, a plataforma conta com funcionalidades como perfis de usuários, feedbacks sobre projetos concluídos, validação das estimativas de materiais geradas pela IA e um espaço para compartilhamento de projetos e experiências.
        </p>

        <h3 className="subtitle">Declaração de Problema</h3>
        <p className="text">
          <strong>Qual é o problema?</strong> Na construção civil, ainda não há uma tecnologia que facilite todo o processo de estimativa para a conclusão de uma obra, incluindo a quantidade de materiais necessários. Normalmente, as estimativas são feitas de forma específica para cada projeto, o que torna o processo mais complexo para aqueles que desejam construir.
        </p>
        <p className="text">
          <strong>Como sabemos que é um problema?</strong> Embora existam métodos para calcular a quantidade de materiais, eles costumam ser complexos e pouco acessíveis para a maioria das pessoas, especialmente para aquelas que não estão familiarizadas com tecnologia. Isso dificulta o acesso a informações essenciais e transforma um processo que poderia ser mais simples em algo, no mínimo, desafiador.
        </p>

        <h3 className="subtitle">Resolução do Problema</h3>
        <p className="text">
          Nossa IA busca simplificar esse processo ao utilizar dados de diversas obras já concluídas, criando uma base de conhecimento para estimar a quantidade necessária de materiais. Com isso, gera uma média que pode servir de referência para qualquer pessoa que queira utilizá-la e aproveitar suas funcionalidades.
        </p>

        <h3 className="subtitle">Como Vamos Saber Quando o Problema Estiver Resolvido?</h3>
        <p className="text">
          Nossa plataforma permitirá que usuários cadastrados insiram a média de materiais utilizados em suas obras ou simplesmente confirmem a estimativa gerada pela nossa IA. Isso ajudará a validar a precisão dos dados fornecidos. Mesmo quando a estimativa não corresponder exatamente ao valor real, as informações inseridas pelos usuários serão utilizadas para aprimorar a precisão da IA, tornando suas futuras previsões ainda mais confiáveis.
        </p>
      </div>
    </div>
  );
};

export default Sobre;