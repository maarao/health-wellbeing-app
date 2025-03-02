from fastapi import FastAPI
from fastapi.responses import JSONResponse
import google.generativeai as genai
import google.generativeai.types as types
import os
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

generate_content_config = types.GenerationConfig(
        temperature=1,
        top_p=0.95,
        top_k=40,
        max_output_tokens=1048576,
        response_mime_type="text/plain",
    )

# Instantiate models
image_model = genai.GenerativeModel('gemini-2.0-flash', generation_config=generate_content_config)
which_pages_model = genai.GenerativeModel('gemini-2.0-flash-thinking-exp-01-21', generation_config=generate_content_config)

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
    
    prompt = (
        "Describe the injury, wound, or other *treatable* conditions shown in the image. "
        "Focus on conditions that could benefit from treatment or intervention. Please be as specific "
        "and detailed as possible with what you're able to see. If you do not see any injuries, wounds, "
        "or treatable conditions, just respond with EXACTLY: 'NO INJURIES'."
    )
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
    extracted_contents_list = await page_content_extractor.scrape_multiple_urls(links)
    extracted_contents = dict(zip(links, extracted_contents_list))
    
    # Step 5: Generate diagnosis response based on results
    prompt_diagnosis = (
        "Given the following data:\n"
        f"Description: {description}\n"
        f"Search Query: {search_query}\n"
        f"Relevant Links: {links}\n"
        f"Page Contents: {extracted_contents}\n\n"
        "Determine if this injury, wound, or condition is treatable and provide one of the following responses as appropriate:\n"
        "1. Provide the diagnosis as well as next steps (such as treatment).\n"
        "2. Provide your best guess with a recommendation to get it checked by a specific specialist.\n"
        "3. Advise that the condition seems severe and recommend contacting emergency services immediately.\n"
        "Respond with ONLY one of the above responses."
    )
    try:
        diagnosis_response = which_pages_model.generate_content(prompt_diagnosis)
        diagnosis = diagnosis_response.text.strip()
    except Exception as e:
        diagnosis = f"Error generating diagnosis response: {e}"
    
    final_result = {
        "description": description,
        "search_query": search_query,
        "relevant_links": links,
        "page_contents": extracted_contents,
        "diagnosis": diagnosis
    }
    
    return JSONResponse(content=final_result)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
