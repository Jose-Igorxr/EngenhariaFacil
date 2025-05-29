import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


def test_login_sucesso(driver):
    driver.get("http://localhost:5173/login")
    wait = WebDriverWait(driver, 20)  # Aumentei um pouco o tempo de espera para robustez

    print("DEBUG: Localizando campo de email...")
    email_input = wait.until(EC.presence_of_element_located((By.XPATH, "//input[@placeholder='Digite seu email']")))
    print("DEBUG: Localizando campo de senha...")
    password_input = wait.until(EC.presence_of_element_located((By.XPATH, "//input[@placeholder='Digite sua senha']")))

    print("DEBUG: Preenchendo credenciais...")
    email_input.clear()
    email_input.send_keys("igor@admin.com")
    password_input.clear()
    password_input.send_keys("Admin123@")

    # CORREÇÃO: Verifique os valores ANTES de submeter
    email_value_no_script = email_input.get_attribute("value")
    senha_value_no_script = password_input.get_attribute("value")
    print(f"DEBUG - VALOR NO CAMPO EMAIL ANTES DA SUBMISSÃO: '{email_value_no_script}'")
    print(f"DEBUG - VALOR NO CAMPO SENHA ANTES DA SUBMISSÃO: '{senha_value_no_script}'")

    # input("DEBUG: Script pausado ANTES da submissão. Verifique os campos. Pressione Enter para continuar...") # Descomente para depuração interativa

    # RECOMENDAÇÃO CRÍTICA: Tente clicar no botão de login
    try:
        # AJUSTE ESTE XPATH para o seu botão de login real!
        xpath_botao_login = "//button[contains(., 'Entrar') or contains(., 'Login') or @type='submit']"
        print(f"DEBUG: Tentando localizar o botão de login com XPath: {xpath_botao_login}")
        login_button = wait.until(EC.element_to_be_clickable((By.XPATH, xpath_botao_login)))

        print("DEBUG: Botão de login encontrado. Clicando...")
        # driver.save_screenshot("antes_clique_login_final.png") # Screenshot opcional
        login_button.click()
        print("DEBUG: Botão de login clicado.")

    except Exception as e_button_click:
        print(f"!!! ERRO ao tentar encontrar ou clicar no botão de login: {e_button_click}")
        print("!!! Tentando submeter com Keys.RETURN como fallback (MENOS RECOMENDADO)...")
        password_input.send_keys(Keys.RETURN)  # Fallback se o botão não for encontrado/clicável

    print("DEBUG: Aguardando resultado do login...")
    try:
        success_text_found = wait.until(
            EC.any_of(
                EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'Bem-vindo ao futuro da tecnologia e construção')]")),
                EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'Sair')]"))
            )
        )
        assert success_text_found is not None
        print("✅ Login testado com sucesso!")

    except Exception as e_login_check:
        print(f"DEBUG: Login FALHOU ou texto de sucesso não encontrado. Erro na verificação: {e_login_check}")
        screenshot_path = "screenshot_falha_login_detalhada.png"
        driver.save_screenshot(screenshot_path)
        print(f"DEBUG: Screenshot da falha salvo em: {screenshot_path}")

        # Tenta capturar mensagens de erro visíveis na página
        try:
            # Ajuste os seletores se necessário para capturar a mensagem "Credenciais incorretas"
            error_message_elements = driver.find_elements(By.XPATH,
                                                          "//*[contains(@class, 'error') or contains(@class, 'alert') or contains(@role, 'alert') or contains(text(), 'incorreta') or contains(text(), 'inválida')]")
            if error_message_elements:
                for err_el in error_message_elements:
                    if err_el.is_displayed() and err_el.text.strip():
                        print(f"DEBUG: MENSAGEM DE ERRO VISÍVEL NA PÁGINA: '{err_el.text.strip()}'")
            else:
                print("DEBUG: Nenhuma mensagem de erro explícita (com os seletores testados) foi encontrada na página.")
        except Exception as e_find_error:
            print(f"DEBUG: Exceção ao tentar encontrar mensagens de erro na página: {e_find_error}")
        raise e_login_check