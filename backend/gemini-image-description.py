from fastapi import FastAPI
import google.generativeai as genai
import os
from dotenv import load_dotenv
from PIL import Image
from google.generativeai import types


load_dotenv()

app = FastAPI()

API_KEY = os.environ.get("GOOGLE_API_KEY")
genai.configure(api_key=API_KEY)
model = genai.GenerativeModel('gemini-2.0-flash')
image_path = 'bruise.jpg'
try:
    img = Image.open(image_path)
except FileNotFoundError:
    print(f"Error: Image file not found at {image_path}")
    exit()
except Exception as e:
    print(f"Error opening image: {e}")
    exit()

@app.get("/")
async def root():
    prompt = "Describe the injury, wound, or other *treatable* conditions shown in the image. Focus on conditions that could benefit from treatment or intervention. Please be as specific and detailed as possible with what you're able to see. If you do not see any injuries, wounds, or treatable conditions, just respond with EXACTLY: 'NO INJURIES'."
    try:
        response = model.generate_content([prompt, img])
        print(response.text)
        return response.text
    except genai.APIError as e:
        return f"API Error: {e}"
    except Exception as e:
        return f"An unexpected error occurred: {e}"

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="localhost", port=8000)