import os

from fastapi import APIRouter, File, HTTPException, UploadFile

from services.pdf_service import extract_text_from_pdf
from services.chunk_service import chunk_text
from services.embedding_service import generate_embeddings
from services.vector_store import vector_store

router = APIRouter()

UPLOAD_DIR = "storage/uploads"


# Plain `def` so the blocking PDF parsing and embedding run in a worker thread.
@router.post("/upload")
def upload_pdf(file: UploadFile = File(...)):
    filename = os.path.basename(file.filename or "")
    if not filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    os.makedirs(UPLOAD_DIR, exist_ok=True)

    file_path = os.path.join(UPLOAD_DIR, filename)

    with open(file_path, "wb") as f:
        f.write(file.file.read())

    pages = extract_text_from_pdf(file_path)
    if not pages:
        raise HTTPException(status_code=422, detail="Could not read this PDF.")

    chunks = chunk_text(pages)
    if not chunks:
        raise HTTPException(
            status_code=422,
            detail="No selectable text found. Scanned PDFs need OCR before indexing.",
        )

    texts = [chunk["text"] for chunk in chunks]
    embeddings = generate_embeddings(texts)

    metadata_list = [
        {
            "filename": filename,
            "page": chunk["page"],
            "text": chunk["text"]
        }
        for chunk in chunks
    ]

    vector_store.add(embeddings, metadata_list, page_count=len(pages))
    vector_store.save()

    return {
        "filename": filename,
        "pages": len(pages),
        "chunks": len(chunks),
        "message": "Document indexed successfully"
    }
