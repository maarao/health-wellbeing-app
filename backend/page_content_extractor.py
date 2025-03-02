import time
import asyncio
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from bs4 import BeautifulSoup

def synchronous_fetch(url):
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

async def get_page_text_content(url):
    return await asyncio.to_thread(synchronous_fetch, url)

async def scrape_multiple_urls(urls):
   """Scrape multiple URLs concurrently using asynchronous multithreading."""
   tasks = [get_page_text_content(url) for url in urls]
   results = await asyncio.gather(*tasks)
   return results

if __name__ == "__main__":
    async def main():
        url = "https://www.example.com"
        text = await get_page_text_content(url)
        if text:
            print(f"Text content of {url}:\n{text[:500]}...")  # Print first 500 characters
        else:
            print(f"Could not retrieve text content from {url}")
    asyncio.run(main())
