from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import upload
from routers import query

app = FastAPI(title="DocMind API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload.router, tags=["Upload"])
app.include_router(query.router, tags=["Query"])


@app.get("/")
def read_root():
    return {"message": "DocMind API Running"}
