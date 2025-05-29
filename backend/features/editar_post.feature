Feature: Edição de Posts

  Scenario: Usuário autenticado edita um post existente com sucesso
    Given que um usuário autenticado para edição existe
    And que um post existente foi criado pelo usuário autenticado
    When o usuário envia um novo título e conteúdo para editar o post existente
    Then o post deve ser atualizado com sucesso