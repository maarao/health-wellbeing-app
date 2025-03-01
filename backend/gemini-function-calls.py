from fastapi import FastAPI
import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# Define the function to be called by the model
def multiply(a: float, b: float):
    """Returns a * b."""
    return a * b

# Configure the Gemini API
API_KEY = os.environ.get("GOOGLE_API_KEY")
genai.configure(api_key=API_KEY)
model = genai.GenerativeModel('gemini-2.0-flash')

# Define the tool configuration
tool_config = {
    'tools': [{
        'function_declarations': [{
            'name': 'multiply',
            'description': 'Returns a * b.',
            'parameters': {
                'type': 'OBJECT',
                'properties': {
                    'a': {'type': 'NUMBER'},
                    'b': {'type': 'NUMBER'},
                },
                'required': ['a', 'b'],
            },
        }],
    }],
}

# Add the tool configuration to the model's generation config
generation_config = genai.types.GenerationConfig()
tools = tool_config['tools']

@app.get("/")
async def root():
    # Send a prompt to the model that should trigger the function call
    prompt = "What is 40 times 21?"
    response = model.generate_content(prompt, generation_config=generation_config, tools=tools)

    # Extract the function call details from the response
    if response.candidates and response.candidates[0].content.parts[0].function_call:
        function_call = response.candidates[0].content.parts[0].function_call
        function_name = function_call.name
        arguments = function_call.args

        # Call the function and return the result
        if function_name == "multiply":
            result = multiply(arguments['a'], arguments['b'])
            return {"function_called": function_name, "arguments": arguments, "result": result}
        else:
            return {"error": "Unknown function called"}
    else:
        return {"response": response.text}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)