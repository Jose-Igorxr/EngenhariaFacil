# features/profile.feature
Feature: Atualizar foto de perfil
  Como um usuário autenticado
  Quero atualizar minha foto de perfil
  Para personalizar minha conta

  Scenario: Usuário atualiza a foto de perfil com sucesso
    Given que eu estou logado como "testuser" com senha "testpass"
    When eu envio uma nova foto de perfil "minha_foto.jpg"
    Then eu vejo que minha foto de perfil foi atualizada