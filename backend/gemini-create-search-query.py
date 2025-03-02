from fastapi import FastAPI
import google.generativeai as genai
import os
from dotenv import load_dotenv


load_dotenv()

app = FastAPI()

API_KEY = os.environ.get("GOOGLE_API_KEY")
genai.configure(api_key=API_KEY)
model = genai.GenerativeModel('gemini-2.0-flash-thinking-exp-01-21')

@app.get("/")
async def root():
    description = "The image shows a contusion (bruise) on the upper arm. The bruise is dark purple in the center, with a yellowish hue around the edges, indicating that it is in the healing process."
    if description == "NO INJURIES":
        return "NO INJURIES"
    prompt = f"Create ONE good search query that would return helpful results for diagnosis and treatment from this description of an injury, wound, or other treatable condition. Don't response with anything else but the search query. Description: {description}"
    try:
        response = model.generate_content(prompt)
        print(response.text)
        return response.text
    except genai.APIError as e:
        return f"API Error: {e}"
    except Exception as e:
        return f"An unexpected error occurred: {e}"

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="localhost", port=8000)