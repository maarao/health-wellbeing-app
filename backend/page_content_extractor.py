import asyncio
from bs4 import BeautifulSoup
import nodriver

async def get_page_text_content(url):
    """
    Fetches the page source of a given URL using nodriver and extracts the text content.

    Args:
        url (str): The URL of the page to fetch.

    Returns:
        str: The text content of the page, or an empty string if there was an error.
    """
    try:
        browser = await nodriver.start()
        tab = await browser.get(url)
        await asyncio.sleep(4)  # Wait for the page to load
        page_source = await tab.get_content()

        soup = BeautifulSoup(page_source, 'html.parser')
        text_content = soup.get_text()
        return text_content

    except Exception as e:
        print(f"Error: {e}")
        return ""

if __name__ == "__main__":
    async def main():
        url = "https://www.example.com"
        text = await get_page_text_content(url)
        if text:
            print(f"Text content of {url}:\n{text[:500]}...")  # Print first 500 characters
        else:
            print(f"Could not retrieve text content from {url}")

    asyncio.run(main())
