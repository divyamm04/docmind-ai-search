import json
import os

import faiss
import numpy as np

INDEX_PATH = "storage/index/faiss_index.bin"
METADATA_PATH = "storage/index/metadata.json"


class VectorStore:
    def __init__(self, dimension=384):
        self.dimension = dimension
        self.index = faiss.IndexFlatL2(dimension)
        self.metadata = []

    def reset(self):
        self.index = faiss.IndexFlatL2(self.dimension)
        self.metadata = []

    def add(self, embeddings, metadata_list):
        self.reset()

        embeddings = np.array(embeddings).astype("float32")
        self.index.add(embeddings)
        self.metadata.extend(metadata_list)

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
            result["score"] = float(distance)
            results.append(result)

        return results

    def save(self):
        os.makedirs(os.path.dirname(INDEX_PATH), exist_ok=True)

        faiss.write_index(self.index, INDEX_PATH)

        with open(METADATA_PATH, "w") as f:
            json.dump(self.metadata, f)

    def load(self):
        if os.path.exists(INDEX_PATH) and os.path.exists(METADATA_PATH):
            self.index = faiss.read_index(INDEX_PATH)

            with open(METADATA_PATH, "r") as f:
                self.metadata = json.load(f)


# Shared singleton instance so routers reuse the same in-memory index
vector_store = VectorStore()
vector_store.load()