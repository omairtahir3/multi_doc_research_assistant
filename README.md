# Multi-Document Research Assistant

An intelligent, self-hosted Retrieval-Augmented Generation (RAG) system that allows you to upload multiple PDF documents and perform semantic search and question answering across them simultaneously.

This application is built with a high-performance **FastAPI** backend and a modern **Next.js** glassmorphic frontend interface.

---

## System Architecture

```mermaid
graph TD
    %% Upload Pipeline
    subgraph Upload & Indexing Pipeline
        A[User Uploads PDFs] --> B[Text Extraction <br/><i>PyPDF</i>]
        B --> C[Overlap Chunking <br/><i>1500 chars / 300 overlap</i>]
        C --> D[Vector Embedding <br/><i>all-mpnet-base-v2</i>]
        D --> E[(In-Memory Vector Store <br/><i>NumPy Cosine Similarity</i>)]
    end

    %% QA Pipeline
    subgraph Ask & Retrieval Pipeline
        F[User Question] --> G[Query Embedding]
        G --> H[Vector Search]
        E --> H
        H --> I[Context Retrieval <br/><i>Top 10 chunks</i>]
        I --> J[Hugging Face QA Pipeline <br/><i>RoBERTa-base-SQUAD2</i>]
        F --> J
        J --> K[Best Answer + Citations]
    end

    style Upload & Indexing Pipeline fill:#f5f7ff,stroke:#5c7cfa,stroke-width:2px
    style Ask & Retrieval Pipeline fill:#f3fffd,stroke:#12b886,stroke-width:2px
```

---

## Features

- **Multi-PDF Upload & Indexing**: Process multiple large files concurrently.
- **Context-Preserving Overlap Chunking**: Text is split into overlapping passages to prevent loss of context at boundaries.
- **Local Embeddings**: Generates sentence embeddings locally on CPU or GPU using the state-of-the-art `all-mpnet-base-v2` model from `sentence-transformers`.
- **Custom Vector Store**: High-speed, lightweight in-memory vector indexing and search using `NumPy` cosine similarity.
- **Extractive Question Answering**: Leverages `deepset/roberta-base-squad2` via Hugging Face pipelines to find exact answers and sources within documents.
- **Clean Responsive Dashboard**: Sleek, glassmorphic UI utilizing Next.js, React, and TailwindCSS.

---

## Tech Stack

### Backend
- **Framework**: FastAPI
- **Parsing**: PyPDF
- **Embeddings**: SentenceTransformers (`all-mpnet-base-v2`)
- **QA Model**: Hugging Face Transformers (`deepset/roberta-base-squad2`)
- **Vector Operations**: NumPy
- **Server**: Uvicorn
- **Deep Learning Framework**: PyTorch

### Frontend
- **Framework**: Next.js 16 (App Router)
- **UI & Styling**: React 19, TailwindCSS v4

---

## Getting Started

### Prerequisites
- Python 3.9 or higher
- Node.js 18 or higher
- npm (or yarn / pnpm)

### 1. Backend Setup

1. **Navigate to the root directory** where `app.py` resides.
2. **Create a virtual environment**:
   ```bash
   python -m venv .venv
   ```
3. **Activate the virtual environment**:
   - **Windows (PowerShell)**:
     ```powershell
     .venv\Scripts\Activate.ps1
     ```
   - **Windows (CMD)**:
     ```cmd
     .venv\Scripts\activate.bat
     ```
   - **macOS / Linux**:
     ```bash
     source .venv/bin/activate
     ```
4. **Install backend dependencies**:
   ```bash
   pip install -r requirements.txt
   ```
5. **Start the FastAPI server**:
   ```bash
   python app.py
   ```
   *The backend API will start running at `http://localhost:8000`.*

---

### 2. Frontend Setup

1. **Navigate to the frontend directory**:
   ```bash
   cd frontend
   ```
2. **Install frontend dependencies**:
   ```bash
   npm install
   ```
3. **Run the Next.js development server**:
   ```bash
   npm run dev
   ```
   *Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.*

---

## 🔌 API Endpoints Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/upload` | Upload list of PDF files and index them into the vector store. |
| `POST` | `/ask` | Ask a question about the currently uploaded documents. |
| `GET` | `/documents` | Retrieve list of all currently indexed document filenames. |
| `POST` | `/reset` | Clear all data, reset the vector store, and free up memory. |
| `GET` | `/health` | Verify if the server is healthy and view indexing statistics. |
| `GET` | `/` | Retrieve API metadata. |

Interactive API documentation (Swagger UI) is available at `http://localhost:8000/docs`.

---
