from fastapi import APIRouter
from pydantic import BaseModel

from services.embedding_service import generate_embeddings
from services.vector_store import vector_store
from services.llm_service import generate_answer

router = APIRouter()


class QueryRequest(BaseModel):
    question: str
    top_k: int = 5


@router.post("/query")
async def query_documents(request: QueryRequest):
    query_embedding = generate_embeddings([request.question])[0]

    results = vector_store.search(query_embedding, top_k=request.top_k)

    matches = [
        {
            "text": result["text"],
            "page": result["page"],
            "score": result["score"]
        }
        for result in results
    ]

    answer = generate_answer(request.question, matches)

    return {
        "question": request.question,
        "answer": answer,
        "results": matches
    }