import os

import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

genai.configure(api_key=GEMINI_API_KEY)

model = genai.GenerativeModel("gemini-2.5-flash")


def expand_query(question: str) -> str:
    prompt = f"""You are a query rewriting assistant for a document search system.

Rules:
- If the query contains abbreviations, acronyms, or is very short/ambiguous, expand it into a clearer, more descriptive version.
- Expand acronyms by spelling them out and keeping the acronym in parentheses, e.g. "NLP" -> "Natural Language Processing (NLP)".
- Do NOT answer the question.
- Do NOT add information that changes the meaning or intent of the question.
- If the query is already clear and well-formed, return it EXACTLY as given, unchanged.
- Return ONLY the rewritten (or original) question. No explanations, no preamble, no quotes.

Query:
{question}

Rewritten Query:"""

    try:
        response = model.generate_content(prompt)
        expanded = response.text.strip()
        return expanded if expanded else question
    except Exception:
        return question
