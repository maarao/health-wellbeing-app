from fastapi import FastAPI
import google.generativeai as genai
import os
from dotenv import load_dotenv
from google.generativeai import types


load_dotenv()

app = FastAPI()

API_KEY = os.environ.get("GOOGLE_API_KEY")
genai.configure(api_key=API_KEY)
model = genai.GenerativeModel('gemini-2.0-flash-thinking-exp-01-21')
    uvicorn.run(app, host="localhost", port=8000)