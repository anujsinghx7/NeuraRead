const { embedQuery }                = require('../embedder')
const { findSimilarChunks, getAllChunks, findSimilarChunksMultiDoc } = require('../vectorStore')

/**
 * Retrieve context chunks for a question (semantic search).
 * Supports single or multiple documents.
 *
 * @param {string[]} documentIds
 * @param {string} question
 * @param {number} topK
 * @returns {Promise<{text: string, pageNumber: number, score: number, documentId?: string, filename?: string}[]>}
 */
const retrieveContext = async (documentIds, question, topK = 5) => {
  const queryVector = await embedQuery(question)

  if (documentIds.length === 1) {
    const chunks = await findSimilarChunks(documentIds[0], queryVector, topK)
    return chunks
  }

  // Multi-doc search
  return findSimilarChunksMultiDoc(documentIds, queryVector, topK)
}

/**
 * Get all document chunks in order (for full-doc modes).
 * Supports single or multiple documents.
 *
 * @param {string[]} documentIds
 * @returns {Promise<{text: string, pageNumber: number, chunkIndex: number}[]>}
 */
const getAllContext = async (documentIds) => {
  if (documentIds.length === 1) {
    return getAllChunks(documentIds[0])
  }

  // Merge chunks from all documents in order
  const allChunks = []
  for (const docId of documentIds) {
    const chunks = await getAllChunks(docId)
    allChunks.push(...chunks.map(c => ({ ...c, documentId: docId })))
  }
  return allChunks
}

/**
 * Cross-document semantic search.
 *
 * @param {string[]} documentIds
 * @param {string} question
 * @param {number} topK
 */
const retrieveMultiDocContext = async (documentIds, question, topK = 8) => {
  const queryVector = await embedQuery(question)
  return findSimilarChunksMultiDoc(documentIds, queryVector, topK)
}

/**
 * Format chunks into a numbered context string for LLM prompts.
 * Each chunk is capped at 600 chars to keep prompts within local model limits.
 */
const formatContext = (chunks) => {
  const PER_CHUNK_LIMIT = 600
  return chunks
    .map((c, i) => {
      const text = (c.text || '').trim()
      const safe = text.length > PER_CHUNK_LIMIT ? text.slice(0, PER_CHUNK_LIMIT) + '…' : text
      return `[Source ${i + 1} | Page ${c.pageNumber || '?'}]\n${safe}`
    })
    .join('\n\n---\n\n')
}

module.exports = { retrieveContext, getAllContext, retrieveMultiDocContext, formatContext }
