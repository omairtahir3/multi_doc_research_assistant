from backend.vector_store import VectorStore
import numpy as np

vs = VectorStore()

# Fake embeddings
embeddings = [np.random.rand(768).tolist() for _ in range(10)]
metadata = [{"id": i} for i in range(10)]

vs.add_vectors(embeddings, metadata)

query_vec = np.random.rand(768).tolist()
results = vs.search(query_vec, top_k=3)
print(results)
