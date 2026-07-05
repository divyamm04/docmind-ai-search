import os

from fastapi import APIRouter, File, UploadFile

from services.pdf_service import extract_text_from_pdf
from services.chunk_service import chunk_text
from services.embedding_service import generate_embeddings
from services.vector_store import vector_store

router = APIRouter()

UPLOAD_DIR = "storage/uploads"


@router.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    os.makedirs(UPLOAD_DIR, exist_ok=True)

    file_path = os.path.join(UPLOAD_DIR, file.filename)

    with open(file_path, "wb") as f:
        contents = await file.read()
        f.write(contents)

    pages = extract_text_from_pdf(file_path)
    chunks = chunk_text(pages)

    if chunks:
        texts = [chunk["text"] for chunk in chunks]
        embeddings = generate_embeddings(texts)

        metadata_list = [
            {
                "filename": file.filename,
                "page": chunk["page"],
                "text": chunk["text"]
            }
            for chunk in chunks
        ]

        vector_store.add(embeddings, metadata_list)
        vector_store.save()

    return {
        "filename": file.filename,
        "pages": len(pages),
        "chunks": len(chunks),
        "message": "Document indexed successfully"
    }