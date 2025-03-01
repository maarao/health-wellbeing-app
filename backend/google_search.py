from bs4 import BeautifulSoup
import nodriver
import asyncio

async def google_search(query):
    print("Entering google_search function")
    """
    Performs a Google search using nodriver and BeautifulSoup4 to extract the page title, link, and blurb for each result.

    Args:
        query (str): The search query.

    Returns:
        list: A list of dictionaries, where each dictionary contains the title, link, and blurb of a search result.
    """
    try:
        # Initialize nodriver
        browser = await nodriver.start()

        # Construct the Google search URL
        url = f"https://www.google.com/search?q={query}"

        # Fetch the Google search page using nodriver
        tab = await browser.get(url)
        await asyncio.sleep(4)  # Wait for the page to load
        # Get the page source
        page_source = await tab.get_content()
        # print(page_source)

        if page_source is None:
            print("Error: Could not retrieve page source using nodriver.")
            if 'browser' in locals():
                await browser.stop()
            return []

        # print(f"Page source: {page_source[:500]}...")  # Print first 500 characters

        # Parse the HTML content with BeautifulSoup4
        soup = BeautifulSoup(page_source, "html.parser")
        # print(f"Soup: {soup.prettify()[:500]}...") # Print first 500 characters of prettified soup

        # Locate result elements using the correct CSS selector
        result_elements = soup.select(".g") # broader selector
        # print(f"Result elements: {result_elements}")

        results = []
        for result_element in result_elements:
            try:
                title_element = result_element.select_one("h3") # broader selector
                link_element = result_element.select_one("a") # broader selector
                blurb_element = result_element.select_one("div.VwiC3b.yXK7lf.p4wth.r025kc.hJNv6b.Hdw6tb") # broader selector

                title = title_element.text if title_element else ""
                link = link_element["href"] if link_element and "href" in link_element.attrs else ""
                blurb = blurb_element.text if blurb_element else ""

                results.append({"title": title, "link": link, "blurb": blurb})
            except Exception as e:
                print(f"Error extracting data from result element: {e}")

        return results

    except Exception as e:
        print(f"Request failed: {e}")
        return []
    finally:
        if 'browser' in locals():
            try:
                await browser.stop()
            except Exception as e:
                print(f"Error stopping browser: {e}")

# Example usage
if __name__ == "__main__":
    async def main():
        query = "Python programming"
        results = await google_search(query)
        for result in results:
            print(result)

    asyncio.run(main())
