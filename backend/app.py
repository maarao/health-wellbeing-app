from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from base64 import b64decode
import google.generativeai as genai
import google.generativeai.types as types
import os
from dotenv import load_dotenv
from PIL import Image
import io

from fastapi import HTTPException, status

# Pydantic models for requests
class ImageRequest(BaseModel):
    image: str  # base64 encoded image data
    
    @property
    def get_image_bytes(self) -> bytes:
        """Convert base64 string to bytes, handling potential data URL prefix"""
        try:
            # Check if the string contains the data URL prefix
            if ',' in self.image:
                base64_str = self.image.split(',')[1]
            else:
                base64_str = self.image
                
            return b64decode(base64_str)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Invalid base64 image data: {str(e)}"
            )

class ChatRequest(BaseModel):
    message: str
    context: dict = {
        "description": "",
        "diagnosis": "",
        "search_query": "",
        "relevant_links": [],
        "page_contents": {}
    }

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
image_model = genai.GenerativeModel('gemini-2.0-pro-exp-02-05', generation_config=generate_content_config)
which_pages_model = genai.GenerativeModel('gemini-2.0-flash-thinking-exp-01-21', generation_config=generate_content_config)

@app.post("/analyze")
async def analyze(request: ImageRequest):
    # Step 1: Load image and get description from base64 data
    try:
        print(f"Received request with image data length: {len(request.image)}")
        image_data = request.get_image_bytes
        print("Successfully decoded base64 data")
        img = Image.open(io.BytesIO(image_data))
        print(f"Successfully opened image: {img.format} {img.size}")
    except HTTPException as e:
        # Re-raise validation errors
        raise e
    except Exception as e:
        print(f"Error processing image: {str(e)}")
        return {"error": f"Error processing uploaded image: {str(e)}"}
    
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
    
    if "NO INJURIES" in description:
        return {"diagnosis": "NO INJURIES"}
    
    # Step 2 & 3: Create search query, perform search, and evaluate results with retry logic
    max_retries = 3
    previous_queries = set()
    attempt = 0
    links = []
    search_query = ""
    search_results = []

    while attempt < max_retries and not links:
        attempt += 1
        print(f"Search attempt {attempt} of {max_retries}")

        # Generate search query with context from previous attempts
        retry_context = f"\nPrevious unsuccessful queries: {', '.join(previous_queries)}" if previous_queries else ""
        variation_guidance = " Generate a different approach from previous queries." if attempt > 1 else ""
        
        prompt_query = (
            f"Create ONE good search query that would return helpful results for diagnosis and treatment "
            f"from this description of an injury, wound, or other treatable condition. Focus on medical "
            f"and healthcare resources.{variation_guidance} Don't respond with anything else but the "
            f"search query. Description: {description}{retry_context}"
        )
        
        try:
            response = which_pages_model.generate_content(prompt_query)
            search_query = response.text.strip()
            
            # Skip if we've tried this query before
            if search_query in previous_queries:
                print(f"Skipping duplicate query: {search_query}")
                continue
                
            previous_queries.add(search_query)
            print(f"Generated search query: {search_query}")
            
            search_results = await google_search.google_search(search_query)
            
            # Enhanced prompt for page relevance evaluation
            prompt_pages = (
                "From the search results provided, carefully evaluate and select pages that would be "
                "relevant enough to help diagnose and treat this injury, wound, or other treatable "
                "condition. Consider medical authority, relevance to the specific condition, and "
                "treatment information. Only return links that you are confident will be helpful. "
                "Don't respond with anything except the links to the relevant pages.\n\n"
                f"Description: {description}\nSearch Results: {search_results}"
            )
            
            pages_response = which_pages_model.generate_content(prompt_pages)
            pages_links_text = pages_response.text.strip()
            
            links = [line.strip() for line in pages_links_text.splitlines() if line.strip().startswith("http")]
            if links:
                print(f"Found {len(links)} relevant links")
            else:
                print("No relevant links found, will retry with different query")
                
        except Exception as e:
            print(f"Error during attempt {attempt}: {str(e)}")
            if attempt == max_retries:
                return {"error": f"Failed to find relevant results after {max_retries} attempts: {str(e)}"}
            continue
    
    # If we still don't have any links after all retries
    if not links:
        return {
            "error": (
                f"Unable to find relevant medical resources after {max_retries} attempts. "
                "Please try rephrasing the description or consult a healthcare professional directly."
            )
        }
    
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
        "You are a caring healthcare professional providing a thoughtful analysis. "
        "Maintain a warm, friendly, and empathetic tone throughout your response. "
        "Based on the given data, provide a clear and reassuring diagnosis evaluation. "
        "Remember that the person may be worried or in pain, so be supportive while remaining honest and direct.\n\n"
        "In your response:\n"
        "1. Acknowledge their situation with empathy\n"
        "2. Provide a clear analysis of their condition\n"
        "3. Outline specific next steps or recommendations\n"
        "4. Be explicit about the urgency level:\n"
        "   - If immediate medical attention is needed, explain why clearly but calmly\n"
        "   - If medical attention is needed but not urgent, provide a timeframe\n"
        "   - If self-care is appropriate, give clear guidelines\n"
        "   - If monitoring is needed, explain what to watch for\n\n"
        "Keep your response no more than 5 sentences and easily digestible for a mobile app interface. "
        "Avoid medical jargon where possible, or explain it when necessary. "
        "Don't use markdown or any other formatting."
    )
    try:
        diagnosis_response = which_pages_model.generate_content(prompt_diagnosis).text.strip()
    except Exception as e:
        diagnosis_response = f"Error generating diagnosis response: {e}"
    
    final_result = {
        "description": description,
        "search_query": search_query,
        "relevant_links": links,
        "page_contents": extracted_contents,
        "diagnosis": diagnosis_response
    }
    
    return JSONResponse(content=final_result)

@app.post("/chat")
async def chat(request: ChatRequest):
    try:
        # Create a prompt that includes the context and current message
        prompt = (
            "You are a knowledgeable healthcare professional assistant. "
            "Maintain a warm, professional, and empathetic tone while providing accurate medical guidance. "
            "Use the following context about the patient's condition to inform your response.\n\n"
            f"Context:\n"
            f"Description of condition: {request.context['description']}\n"
            f"Initial diagnosis: {request.context['diagnosis']}\n"
            f"Relevant medical information from trusted sources: {request.context['page_contents']}\n\n"
            f"Patient's message: {request.message}\n\n"
            "In your response:\n"
            "1. Acknowledge their concerns or questions with empathy\n"
            "2. Provide clear, accurate information based on the context\n"
            "3. Be honest about any limitations in your knowledge\n"
            "4. If they need medical attention, remind them professionally but firmly\n"
            "5. Use simple, understandable language while maintaining professionalism\n"
            "6. Focus on being supportive and reassuring while staying factual\n\n"
            "Keep your response concise and easily readable on a mobile app interface. "
            "Avoid technical jargon unless necessary, and explain medical terms when used. "
            "Don't use any markdown formatting."
        )
        
        response = which_pages_model.generate_content(prompt)
        return JSONResponse(content={"response": response.text.strip()})
        
    except Exception as e:
        return JSONResponse(
            content={"error": f"Error generating response: {str(e)}"},
            status_code=500
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
