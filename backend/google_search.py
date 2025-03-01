from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager


def google_search(query):
    """
    Performs a Google search using Selenium ChromeDriver and BeautifulSoup4 to extracts the page title, link, and blurb for each result.

    Args:
        query (str): The search query.

    Returns:
        list: A list of dictionaries, where each dictionary contains the title, link, and blurb of a search result.
    """
    # Set up Chrome options for headless browsing
    chrome_options = webdriver.ChromeOptions()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--disable-gpu")

    # Set up ChromeDriver with webdriver_manager
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=chrome_options)

    # Construct the Google search URL
    url = f"https://www.google.com/search?q={query}"

    try:
        # Fetch the Google search page using Selenium
        driver.get(url)
        page_source = driver.page_source

        print(page_source)

        # Parse the HTML content with BeautifulSoup4
        soup = BeautifulSoup(page_source, "html.parser")

        # Locate result elements using the correct CSS selector
        result_elements = soup.select(".result.css-z73qjy")

        results = []
        for result_element in result_elements:
            try:
                title_element = result_element.select_one(".wgl-title")
                link_element = result_element.select_one(".wgl-display-url .default-link-text")
                blurb_element = result_element.select_one(".description")

                title = title_element.text if title_element else ""
                link = link_element.text if link_element else ""
                blurb = blurb_element.text if blurb_element else ""

                results.append({"title": title, "link": link, "blurb": blurb})
            except Exception as e:
                print(f"Error extracting data from result element: {e}")

        return results

    except Exception as e:
        print(f"Request failed: {e}")
        return []
    finally:
        driver.quit()
        print("-" * 20)

# Example usage
if __name__ == "__main__":
    query = "example search"
    results = google_search(query)
    for result in results:
        print(result)
