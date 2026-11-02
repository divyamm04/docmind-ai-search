from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from services.embedding_service import generate_embeddings
from services.vector_store import vector_store
from services.llm_service import generate_answer
from services.query_expansion import expand_query

router = APIRouter()


class QueryRequest(BaseModel):
    question: str
    top_k: int = 8


# Plain `def` so FastAPI runs it in a worker thread; the embedding and Gemini
# calls are blocking and would otherwise freeze the event loop.
@router.post("/query")
def query_documents(request: QueryRequest):
    question = request.question.strip()
    if not question:
        raise HTTPException(status_code=400, detail="Question is empty.")

    if vector_store.is_empty():
        raise HTTPException(
            status_code=409,
            detail="No document is indexed yet. Upload a PDF first.",
        )

    # Step 1: Expand the user's query
    expanded_query = expand_query(question)

    # Step 2: Generate embedding for the expanded query
    query_embedding = generate_embeddings([expanded_query])[0]

    # Step 3: Search the vector database
    results = vector_store.search(query_embedding, top_k=request.top_k)

    # Step 4: Format retrieved chunks
    matches = [
        {
            "text": result["text"],
            "page": result["page"],
            "score": result["score"],
            "similarity": result["similarity"],
        }
        for result in results
    ]

    # Step 5: Generate the final answer
    answer = generate_answer(question, matches)

    # Step 6: Return everything
    return {
        "question": question,
        "expanded_query": expanded_query,
        "answer": answer,
        "results": matches
    }


@router.get("/document")
def current_document():
    return vector_store.document_info()
