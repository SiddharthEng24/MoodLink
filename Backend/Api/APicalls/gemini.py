import google.generativeai as genai
from dotenv import load_dotenv
import os

load_dotenv()

genai.configure(api_key = os.getenv("API_KEY"))

def gemini(prompt):
    try:
        model = genai.GenerativeModel("gemini-2.5-flash")
        response = model.generate_content(f" {prompt}")

        # Remove any "Assistant:" prefix from the response
        answer = response.text.strip()
        return answer

    except Exception as e:
        print(f"Error using Gemini API: {e}")
        return None


