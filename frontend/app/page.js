'use client'

import { useState, useEffect } from 'react'
import Answer from './answer'

export default function Home() {
  const [question, setQuestion] = useState('')
  const [answerData, setAnswerData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [files, setFiles] = useState([])
  const [error, setError] = useState(null)
  const [uploadedDocs, setUploadedDocs] = useState([])

  // Fetch uploaded documents on component mount
  useEffect(() => {
    fetchDocuments()
  }, [])

  const fetchDocuments = async () => {
    try {
      const res = await fetch('http://localhost:8000/documents')
      const data = await res.json()
      setUploadedDocs(data.documents || [])
    } catch (err) {
      console.error('Error fetching documents:', err)
    }
  }

  const handleFiles = (e) => {
    const selectedFiles = Array.from(e.target.files)
    setFiles(selectedFiles)
    setError(null)
  }

  const uploadFiles = async () => {
    if (!files.length) {
      setError('Please select at least one PDF file')
      return
    }

    setUploading(true)
    setError(null)

    const formData = new FormData()
    files.forEach(file => {
      formData.append('files', file)
    })

    try {
      const res = await fetch('http://localhost:8000/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'File upload failed')
      }

      setFiles([])
      document.getElementById('file-input').value = ''
    
      // Refresh document list
      fetchDocuments()

    } catch (err) {
      console.error(err)
      setError(err.message || 'Error uploading files')
    } finally {
      setUploading(false)
    } 
  }

  const askQuestion = async () => {
    if (!question.trim()) {
      setError('Please enter a question')
      return
    }

    setLoading(true)
    setError(null)
    setAnswerData(null)

    try {
      const res = await fetch('http://localhost:8000/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: question.trim() }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to get answer')
      }

      setAnswerData(data)

    } catch (err) {
      console.error(err)
      setError(err.message || 'Error fetching answer')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      askQuestion()
    }
  }

  const resetSystem = async () => {
    if (!confirm('Are you sure you want to delete all uploaded documents?')) {
      return
    }

    try {
      const res = await fetch('http://localhost:8000/reset', {
        method: 'POST',
      })

      if (res.ok) {
        alert('All documents cleared!')
        setUploadedDocs([])
        setAnswerData(null)
        setQuestion('')
      }
    } catch (err) {
      console.error(err)
      alert('Error resetting system')
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="glass card-hover w-full max-w-4xl p-8 sm:p-10 rounded-3xl animate-fade-in">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold mb-3 gradient-text">
            Multi-Document Research Assistant
          </h1>
          <p className="text-gray-600 text-lg">
            Upload multiple PDFs and ask questions across all of them
          </p>
        </div>

        {/* Uploaded Documents Display */}
        {uploadedDocs.length > 0 && (
          <div className="mb-6 p-5 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border-2 border-green-200 animate-slide-in">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-800 text-lg flex items-center">
                <svg className="w-6 h-6 mr-2 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V6.414A2 2 0 0016.414 5L14 2.586A2 2 0 0012.586 2H9z" />
                  <path d="M3 8a2 2 0 012-2v10h8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                </svg>
                Uploaded Documents ({uploadedDocs.length})
              </h3>
              <button
                onClick={resetSystem}
                className="text-sm text-red-600 hover:text-red-800 font-semibold hover:underline"
              >
                🗑️ Clear All
              </button>
            </div>
            <ul className="space-y-2">
              {uploadedDocs.map((doc, i) => (
                <li key={i} className="flex items-center p-3 bg-white rounded-lg shadow-sm">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-green-600 font-bold text-sm">{i + 1}</span>
                  </div>
                  <span className="text-gray-700 font-medium truncate">{doc}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* File Upload Section */}
        <div className="mb-8 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border-2 border-dashed border-blue-300 hover:border-blue-400 transition-colors">
          <div className="flex items-center mb-3">
            <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <label className="font-bold text-gray-800 text-lg">
              Upload PDF Documents
            </label>
          </div>
          
          <input
            id="file-input"
            type="file"
            multiple
            accept=".pdf"
            onChange={handleFiles}
            className="block w-full text-sm text-gray-600 mb-4
                     file:mr-4 file:py-3 file:px-6 file:rounded-full file:border-0
                     file:text-sm file:font-bold file:bg-blue-600 file:text-white
                     hover:file:bg-blue-700 file:cursor-pointer file:transition-all
                     file:shadow-md hover:file:shadow-lg cursor-pointer"
          />
          
          {files.length > 0 && (
            <div className="mb-4 p-3 bg-white rounded-lg animate-slide-in">
              <p className="text-sm font-semibold text-gray-700 mb-2">
                📄 {files.length} file{files.length > 1 ? 's' : ''} selected:
              </p>
              <ul className="space-y-1">
                {files.map((file, i) => (
                  <li key={i} className="text-xs text-gray-600 truncate">
                    • {file.name}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <button
            onClick={uploadFiles}
            disabled={uploading || files.length === 0}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold px-6 py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 w-full sm:w-auto"
          >
            {uploading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Uploading...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Upload PDFs
              </span>
            )}
          </button>
        </div>

        {/* Question Section */}
        <div className="mb-6">
          <label className="flex items-center mb-3 font-bold text-gray-800 text-lg">
            <svg className="w-6 h-6 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Ask Your Question
          </label>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="e.g., What are the main findings across all documents?"
            className="w-full border-2 border-gray-300 rounded-xl p-4 mb-4 
                     focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200
                     transition-all shadow-sm hover:shadow-md resize-none"
            rows={4}
          />
          <button
            onClick={askQuestion}
            disabled={loading || uploadedDocs.length === 0}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold px-6 py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 w-full sm:w-auto"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Thinking...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Ask Question
              </span>
            )}
          </button>
          {uploadedDocs.length === 0 && (
            <p className="text-sm text-gray-500 mt-2">
              💡 Please upload documents first before asking questions
            </p>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg animate-slide-in">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="font-semibold">Error</p>
            </div>
            <p className="text-sm mt-1">{error}</p>
          </div>
        )}

        {/* Answer Display */}
        {answerData && <Answer data={answerData} />}
      </div>
    </main>
  )
}