import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 180000, // 3 min for heavy modes (multiple PDFs + quiz/summary)
})

/**
 * Upload multiple PDF files.
 * Returns { sessionId, documents: [...], documentId, filename, chunks, totalPages }
 */
export const uploadPDFs = async (files) => {
  const formData = new FormData()
  for (const file of files) {
    formData.append('pdfs', file)
  }
  const res = await api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data
}

// Legacy single-file upload (backward compat)
export const uploadPDF = async (file) => {
  return uploadPDFs([file])
}

// Ask a question about the uploaded document (legacy)
export const askQuestion = async (question, documentId) => {
  const res = await api.post('/query', { question, documentId })
  return res.data  // { answer, sources }
}

/**
 * Execute a mode on document(s).
 *
 * @param {string} mode - 'qa' | 'summary' | 'quiz' | 'mindmap'
 * @param {string} sessionId
 * @param {object} options - { question?, documentId? }
 * @returns {Promise<{mode, documentIds, data}>}
 */
export const executeMode = async (mode, sessionId, options = {}) => {
  const res = await api.post('/mode', {
    mode,
    sessionId,
    ...options,
  })
  return res.data  // { mode, documentIds, data }
}
