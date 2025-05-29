from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

def test_login_navega_e_verifica_postagem(driver):
    driver.get("http://localhost:5173/login")
    wait = WebDriverWait(driver, 10)

    # Login
    email_input = wait.until(EC.presence_of_element_located((By.XPATH, "//input[@placeholder='Digite seu email']")))
    password_input = wait.until(EC.presence_of_element_located((By.XPATH, "//input[@placeholder='Digite sua senha']")))

    email_input.send_keys("igor@admin.com")
    password_input.send_keys("Admin123@")
    password_input.send_keys(Keys.RETURN)

    # Aguarda o elemento "POSTAGENS" como confirmação de login bem-sucedido
    try:
        postagens_link = wait.until(
            EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'POSTAGENS')]"))
        )
        print("✅ Login realizado com sucesso!")
    except:
        raise AssertionError("❌ Login falhou: texto 'POSTAGENS' não encontrado.")

    # Clica no link de POSTAGENS
    wait.until(EC.element_to_be_clickable((By.XPATH, "//*[contains(text(), 'POSTAGENS')]"))).click()
    print("➡️ Navegou para a página de POSTAGENS.")

    # Aguarda a presença de qualquer elemento que contenha o texto 'Teste'
    try:
        wait.until(EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'Teste')]")))
        print("👍 Elemento com o texto 'Teste' encontrado na página de POSTAGENS!")
        print("✅ Teste de navegação e verificação de postagem concluído com sucesso!")
    except:
        raise AssertionError("❌ Texto 'Teste' **não** foi encontrado na página de POSTAGENS.")
