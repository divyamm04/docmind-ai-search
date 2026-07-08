from fastapi import APIRouter
from pydantic import BaseModel

from services.embedding_service import generate_embeddings
from services.vector_store import vector_store
from services.llm_service import generate_answer
from services.query_expansion import expand_query

router = APIRouter()


class QueryRequest(BaseModel):
    question: str
    top_k: int = 8


@router.post("/query")
async def query_documents(request: QueryRequest):
    # Step 1: Expand the user's query
    expanded_query = expand_query(request.question)

    # Step 2: Generate embedding for the expanded query
    query_embedding = generate_embeddings([expanded_query])[0]

    # Step 3: Search the vector database
    results = vector_store.search(query_embedding, top_k=request.top_k)

    # Step 4: Format retrieved chunks
    matches = [
        {
            "text": result["text"],
            "page": result["page"],
            "score": result["score"]
        }
        for result in results
    ]

    # Step 5: Generate the final answer
    answer = generate_answer(request.question, matches)

    # Step 6: Return everything
    return {
        "question": request.question,
        "expanded_query": expanded_query,
        "answer": answer,
        "results": matches
    }