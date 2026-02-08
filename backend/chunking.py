from typing import List, Dict

def chunk_documents(
    documents: List[Dict],
    chunk_size: int = 1500,      # Larger chunks
    chunk_overlap: int = 300     # More overlap to preserve context
) -> List[Dict]:
    chunks = []

    for doc in documents:
        text = doc["text"]
        start = 0
        chunk_id = 0

        while start < len(text):
            end = start + chunk_size
            chunk_text = text[start:end]

            chunks.append({
                "text": chunk_text,
                "source": doc["source"],
                "page": doc["page"],
                "chunk_id": chunk_id
            })

            chunk_id += 1
            start += chunk_size - chunk_overlap

    return chunks