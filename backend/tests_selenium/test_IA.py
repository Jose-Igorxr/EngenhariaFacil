from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time

def test_login_navega_e_verifica_calcular_materiais(driver):
    driver.get("http://localhost:5173/login")
    wait = WebDriverWait(driver, 10)

    # Login
    email_input = wait.until(EC.presence_of_element_located((By.XPATH, "//input[@placeholder='Digite seu email']")))
    password_input = wait.until(EC.presence_of_element_located((By.XPATH, "//input[@placeholder='Digite sua senha']")))

    email_input.send_keys("igor@admin.com")
    password_input.send_keys("Admin123@")
    password_input.send_keys(Keys.RETURN)

    wait.until(EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'CALCULAR MATERIAIS')]")))
    print("✅ Login realizado com sucesso!")

    # Localiza o link 'CALCULAR MATERIAIS'
    calc_link = wait.until(EC.element_to_be_clickable((By.XPATH, "//*[contains(text(), 'CALCULAR MATERIAIS')]")))
    print("Texto do elemento encontrado:", calc_link.text)
    print("Tag do elemento:", calc_link.tag_name)

    # Clica via JS (para garantir que o clique funcione)
    driver.execute_script("arguments[0].click();", calc_link)
    print("➡️ Clique em CALCULAR MATERIAIS executado via JavaScript.")

    # Espera um elemento único da página CALCULAR MATERIAIS (ajuste conforme seu app)
    try:
        elemento_unico = wait.until(EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'Área (m²)')]")))
        print("👍 Página CALCULAR MATERIAIS carregada com sucesso!")
        time.sleep(3)
    except Exception:
        raise AssertionError("❌ Falha ao carregar a página CALCULAR MATERIAIS.")


