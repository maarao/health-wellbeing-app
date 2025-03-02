from fastapi import FastAPI
import google.generativeai as genai
import os
import asyncio
from dotenv import load_dotenv
from PIL import Image

# Import asynchronous functions
import google_search
import page_content_extractor

load_dotenv(override=True)

app = FastAPI()

# Configure the Gemini API
API_KEY = os.environ.get("GOOGLE_API_KEY")
genai.configure(api_key=API_KEY)

# Instantiate models
image_model = genai.GenerativeModel('gemini-2.0-flash')
which_pages_model = genai.GenerativeModel('gemini-2.0-flash-thinking-exp-01-21')

@app.get("/analyze")
async def analyze():
    # Step 1: Load image and get description
    image_path = 'bruise.jpg'
    try:
        img = Image.open(image_path)
    except FileNotFoundError:
        return {"error": f"Image file not found at {image_path}"}
    except Exception as e:
        return {"error": f"Error opening image: {e}"}
    
    prompt = ("Describe the injury, wound, or other *treatable* conditions shown in the image. "
              "Focus on conditions that could benefit from treatment or intervention. Please be as specific "
              "and detailed as possible with what you're able to see. If you do not see any injuries, wounds, "
              "or treatable conditions, just respond with EXACTLY: 'NO INJURIES'.")
    try:
        response = image_model.generate_content([prompt, img])
        description = response.text.strip()
    except Exception as e:
        return {"error": f"Error generating image description: {e}"}
    
    if description == "NO INJURIES":
        return {"result": "NO INJURIES"}
    
    # Step 2: Create search query and perform Google search
    prompt_query = f"Create ONE good search query that would return helpful results for diagnosis and treatment from this description of an injury, wound, or other treatable condition. Don't response with anything else but the search query. Description: {description}"
    try:
        response = which_pages_model.generate_content(prompt_query)
        search_query = response.text.strip()
    except Exception as e:
        return {"error": f"Error generating search query: {e}"}
    search_results = await google_search.google_search(search_query)
    
    # Step 3: Read search results and decide relevant pages
    prompt_pages = (
        "From the search results provided, decide which pages would be relevant enough to help diagnose and treat "
        "this injury, wound, or other treatable condition described in the description. Don't respond with anything "
        "except the links to the relevant pages. "
        f"Description: {description}\nSearch Results: {search_results}"
    )
    try:
        pages_response = which_pages_model.generate_content(prompt_pages)
        pages_links_text = pages_response.text.strip()
    except Exception as e:
        return {"error": f"Error generating relevant pages: {e}"}
    
    links = [line.strip() for line in pages_links_text.splitlines() if line.strip().startswith("http")]
    
    # Step 4: Extract page contents
    extracted_contents = {}
    for link in links:
        content = await page_content_extractor.get_page_text_content(link)
        extracted_contents[link] = content
    
    final_result = {
        "description": description,
        "search_query": search_query,
        "relevant_links": links,
        "page_contents": extracted_contents
    }
    
    return final_result

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
