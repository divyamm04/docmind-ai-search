import json
import os

import faiss
import numpy as np

INDEX_PATH = "storage/index/faiss_index.bin"
METADATA_PATH = "storage/index/metadata.json"
DOCUMENT_PATH = "storage/index/document.json"


class VectorStore:
    def __init__(self, dimension=384):
        self.dimension = dimension
        self.index = faiss.IndexFlatL2(dimension)
        self.metadata = []
        self.page_count = None

    def reset(self):
        self.index = faiss.IndexFlatL2(self.dimension)
        self.metadata = []
        self.page_count = None

    def add(self, embeddings, metadata_list, page_count=None):
        # One document at a time: a new upload replaces the previous index.
        self.reset()

        embeddings = np.array(embeddings).astype("float32")
        self.index.add(embeddings)
        self.metadata.extend(metadata_list)
        self.page_count = page_count

    def is_empty(self):
        return self.index.ntotal == 0

    def document_info(self):
        if self.is_empty():
            return {"filename": None, "pages": 0, "chunks": 0}

        pages = self.page_count
        if pages is None:
            pages = max((m.get("page") or 0) for m in self.metadata)

        return {
            "filename": self.metadata[0].get("filename"),
            "pages": pages,
            "chunks": len(self.metadata),
        }

    def search(self, query_embedding, top_k=5):
        query_embedding = np.array(query_embedding).astype("float32")

        if query_embedding.ndim == 1:
            query_embedding = np.expand_dims(query_embedding, axis=0)

        distances, indices = self.index.search(query_embedding, top_k)

        results = []
        for distance, idx in zip(distances[0], indices[0]):
            if idx == -1 or idx >= len(self.metadata):
                continue

            result = dict(self.metadata[idx])
            # IndexFlatL2 returns squared L2 distance (lower is closer). MiniLM
            # embeddings are unit-normalised, so cosine similarity = 1 - d / 2.
            result["score"] = float(distance)
            result["similarity"] = max(0.0, min(1.0, 1 - float(distance) / 2))
            results.append(result)

        return results

    def save(self):
        os.makedirs(os.path.dirname(INDEX_PATH), exist_ok=True)

        faiss.write_index(self.index, INDEX_PATH)

        with open(METADATA_PATH, "w") as f:
            json.dump(self.metadata, f)

        with open(DOCUMENT_PATH, "w") as f:
            json.dump({"pages": self.page_count}, f)

    def load(self):
        if os.path.exists(INDEX_PATH) and os.path.exists(METADATA_PATH):
            self.index = faiss.read_index(INDEX_PATH)

            with open(METADATA_PATH, "r") as f:
                self.metadata = json.load(f)

            if os.path.exists(DOCUMENT_PATH):
                with open(DOCUMENT_PATH, "r") as f:
                    self.page_count = json.load(f).get("pages")


# Shared singleton instance so routers reuse the same in-memory index
vector_store = VectorStore()
vector_store.load()
