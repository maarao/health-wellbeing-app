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
image_path = 'backend/bruise.jpg'
try:
    img = Image.open(image_path)
except FileNotFoundError:
    print(f"Error: Image file not found at {image_path}")
    exit()
except Exception as e:
    print(f"Error opening image: {e}")
    exit()
