import time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from bs4 import BeautifulSoup

def get_page_text_content(url):
    """
    Fetches the page source of a given URL using Selenium and extracts the text content.
    
    Args:
        url (str): The URL of the page to fetch.
        
    Returns:
        str: The text content of the page, or an empty string if there was an error.
    """
    driver = None
    try:
        options = Options()
        options.add_argument('--headless')
        options.add_argument('--disable-gpu')
        driver = webdriver.Chrome(options=options)
        driver.get(url)
        time.sleep(4)  # Wait for the page to load
        page_source = driver.page_source
        soup = BeautifulSoup(page_source, 'html.parser')
        text_content = soup.find('body').get_text(separator=' ', strip=True)
        return text_content
    except Exception as e:
        print(f"Error: {e}")
        return ""
    finally:
        if driver:
            driver.quit()

if __name__ == "__main__":
    url = "https://www.example.com"
    text = get_page_text_content(url)
    if text:
        print(f"Text content of {url}:\n{text[:500]}...")  # Print first 500 characters
    else:
        print(f"Could not retrieve text content from {url}")
