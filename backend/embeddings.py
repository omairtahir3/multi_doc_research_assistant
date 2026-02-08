
from typing import List
from sentence_transformers import SentenceTransformer


model = SentenceTransformer("all-mpnet-base-v2") 

def get_embeddings(texts: List[str]) -> List[List[float]]:

    embeddings = model.encode(texts, show_progress_bar=True, convert_to_numpy=True)
    return embeddings.tolist()
