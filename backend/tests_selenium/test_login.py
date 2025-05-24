import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

def test_login_sucesso(driver):

    driver.get("http://localhost:5173/login")

    wait = WebDriverWait(driver, 10)


    email_input = wait.until(EC.presence_of_element_located((By.XPATH, "//input[@placeholder='Digite seu email']")))
    password_input = wait.until(EC.presence_of_element_located((By.XPATH, "//input[@placeholder='Digite sua senha']")))


    email_input.send_keys("teste11@gmail.com")
    password_input.send_keys("Teste123@")
    password_input.send_keys(Keys.RETURN)

    success_text_found = wait.until(
        EC.any_of(
            EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'Bem-vindo ao Home!')]")),
            EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'Sair')]"))
        )
    )

    assert success_text_found is not None
    print("✅ Login testado com sucesso!")
