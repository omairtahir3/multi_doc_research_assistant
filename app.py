from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pathlib import Path
from typing import List
import uvicorn

from backend.loaders import load_pdfs
from backend.chunking import chunk_documents
from backend.vector_store import VectorStore
from backend.retriever import Retriever
from backend.qa import QuestionAnswering

app = FastAPI(title="Multi-Document Research Assistant")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_FOLDER = Path("data/uploads")
UPLOAD_FOLDER.mkdir(parents=True, exist_ok=True)

# Core pipeline
vector_store = VectorStore()
retriever = Retriever(vector_store)
qa_system = None


class Question(BaseModel):
    question: str


class AnswerResponse(BaseModel):
    answer: str
    sources: List[str]


class DocumentsResponse(BaseModel):
    count: int
    documents: List[str]


def get_qa_system():
    """Load QA system only when needed"""
    global qa_system
    if qa_system is None:
        print("Loading QA model...")
        qa_system = QuestionAnswering(retriever)
        print("QA model ready!")
    return qa_system


@app.post("/upload")
async def upload_files(files: List[UploadFile] = File(...)):
    """Upload and index PDF files"""
    if not files:
        raise HTTPException(status_code=400, detail="No files provided")

    uploaded_files = []
    errors = []

    for file in files:
        try:
            # Check file extension
            if not file.filename.lower().endswith('.pdf'):
                errors.append(f"{file.filename}: Not a PDF file")
                continue

            # Save file
            file_path = UPLOAD_FOLDER / file.filename
            with open(file_path, "wb") as f:
                content = await file.read()
                f.write(content)

            # Process file
            docs = load_pdfs([str(file_path)])
            chunks = chunk_documents(docs)
            retriever.index_documents(chunks)
            
            uploaded_files.append(file.filename)
            print(f"✓ Uploaded and indexed: {file.filename}")

        except Exception as e:
            errors.append(f"{file.filename}: {str(e)}")
            print(f"✗ Error with {file.filename}: {e}")

    response = {
        "status": "success" if uploaded_files else "failed",
        "files_uploaded": len(uploaded_files),
        "uploaded": uploaded_files
    }
    
    if errors:
        response["errors"] = errors

    return response


@app.post("/ask", response_model=AnswerResponse)
async def ask_question(question_data: Question):
    """Ask a question about uploaded documents"""
    question = question_data.question.strip()
    
    if not question:
        raise HTTPException(status_code=400, detail="Question cannot be empty")
    
    try:
        qa = get_qa_system()
        answer, sources = qa.answer_question(question)

        return AnswerResponse(answer=answer, sources=sources)
        
    except Exception as e:
        print(f"Error processing question: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Failed to process question")


@app.get("/documents", response_model=DocumentsResponse)
async def list_documents():
    """List all uploaded documents"""
    if not vector_store.metadata:
        return DocumentsResponse(count=0, documents=[])
    
    # Get unique document sources
    uploaded_docs = list(set([meta['source'] for meta in vector_store.metadata]))
    
    return DocumentsResponse(
        count=len(uploaded_docs),
        documents=sorted(uploaded_docs)
    )


@app.post("/reset")
async def reset():
    """Clear all indexed documents"""
    global vector_store, retriever, qa_system
    
    vector_store = VectorStore()
    retriever = Retriever(vector_store)
    qa_system = None
    
    print("✓ Vector store reset")
    return {"status": "Vector store reset successfully"}


@app.get("/health")
async def health():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "documents_indexed": len(vector_store),
        "model_loaded": qa_system is not None
    }


@app.get("/")
async def root():
    """API info"""
    return {
        "name": "Multi-Document Research Assistant API",
        "version": "1.0.0",
        "docs": "/docs"
    }


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)