from typing import List, Dict
from backend.embeddings import get_embeddings
from backend.vector_store import VectorStore


class Retriever:
    def __init__(self, vector_store: VectorStore):
        self.vector_store = vector_store

    def index_documents(self, chunks: List[Dict]):
        """Index document chunks with embeddings"""
        texts = [" ".join(chunk["text"].split()) for chunk in chunks]
        embeddings = get_embeddings(texts)

        metadatas = [
            {
                "text": chunk["text"],
                "source": chunk["source"],
                "page": chunk["page"],
                "chunk_id": chunk["chunk_id"]
            }
            for chunk in chunks
        ]

        self.vector_store.add_vectors(embeddings, metadatas)
        print(f"Indexed {len(chunks)} chunks")

    def retrieve(self, query: str, top_k: int = 5) -> List[Dict]:
        """Retrieve most relevant chunks for a query"""
        print(f"Query: {query}")
        
        # Get query embedding
        query_embedding = get_embeddings([query])[0]
        
        # Search vector store
        results = self.vector_store.search(query_embedding, top_k=top_k)
        
        # Format results
        retrieved_chunks = []
        for metadata, score in results:
            chunk_with_score = metadata.copy()
            chunk_with_score["score"] = score
            retrieved_chunks.append(chunk_with_score)
        
        if retrieved_chunks:
            print(f"Retrieved {len(retrieved_chunks)} chunks (top score: {retrieved_chunks[0]['score']:.4f})\n")
        
        return retrieved_chunks