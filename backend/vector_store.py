import numpy as np
from numpy.linalg import norm

class VectorStore:
    def __init__(self):

        self.vectors = []
        self.metadata = []

    def add_vectors(self, embeddings: list, metadatas: list):

        self.vectors.extend([np.array(vec) for vec in embeddings])
        self.metadata.extend(metadatas)

    def _cosine_similarity(self, a, b):

        return np.dot(a, b) / (norm(a) * norm(b) + 1e-10)

    def search(self, query_vector, top_k=5):

        query_vector = np.array(query_vector)
        similarities = [self._cosine_similarity(query_vector, vec) for vec in self.vectors]

        top_indices = np.argsort(similarities)[-top_k:][::-1]

        results = [(self.metadata[i], float(similarities[i])) for i in top_indices]
        return results
