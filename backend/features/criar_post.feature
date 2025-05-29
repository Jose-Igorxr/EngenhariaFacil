Feature: Criação de posts

  Scenario: Usuário autenticado cria um post com sucesso
    Given que um usuário autenticado existe
    When o usuário envia um título e conteúdo para criar um post
    Then o post deve ser criado com sucesso