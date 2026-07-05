import os

import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

genai.configure(api_key=GEMINI_API_KEY)

model = genai.GenerativeModel("gemini-2.5-flash")


def generate_answer(question: str, retrieved_chunks: list) -> str:
    context = "\n\n".join(
        f"[Page {chunk.get('page')}] {chunk.get('text')}"
        for chunk in retrieved_chunks
    )

    prompt = f"""You are a helpful assistant that answers questions using ONLY the context provided below.

Rules:
- Answer strictly using the given context.
- If the answer is not present in the context, clearly state that the answer could not be found in the provided documents.
- Keep the answer concise and to the point.
- Do not make up information or hallucinate facts not present in the context.

Context:
{context}

Question:
{question}

Answer:"""

    try:
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        return f"Error generating answer: {e}"
