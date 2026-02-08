from pathlib import Path
from typing import List, Dict
from pypdf import PdfReader

def load_pdfs(file_paths: List[str]) -> List[Dict]:
    documents = []

    for file_path in file_paths:
        pdf_path = Path(file_path)
        reader = PdfReader(pdf_path)

        for page_number, page in enumerate(reader.pages):
            text = page.extract_text()

            if text and text.strip():
                documents.append({
                    "text": text.strip(),
                    "source": pdf_path.name,
                    "page": page_number + 1
                })

    return documents
