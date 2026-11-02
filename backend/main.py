from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import upload
from routers import query

app = FastAPI(title="DocMind API")

# Vite may serve on localhost or 127.0.0.1 and on any free port (5173, 5174, ...).
# Allowing only one exact origin made the browser silently drop responses.
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload.router, tags=["Upload"])
app.include_router(query.router, tags=["Query"])


@app.get("/")
def read_root():
    return {"message": "DocMind API Running"}
