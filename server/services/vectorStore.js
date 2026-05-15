const Chunk = require('../models/Chunk')

/**
 * Saves all chunks (with embeddings, page numbers, and topic labels) for a document.
 *
 * @param {string}   documentId
 * @param {string}   filename
 * @param {Array<{text: string, pageNumber: number, label: string}>} chunks
 * @param {number[][]} embeddings
 */
const saveChunks = async (documentId, filename, chunks, embeddings) => {
  const docs = chunks.map((chunk, i) => ({
    documentId,
    filename,
    text: chunk.text,
    chunkIndex: i,
    pageNumber: chunk.pageNumber,
    label: chunk.label || 'GENERAL',
    embedding: embeddings[i],
  }))

  await Chunk.insertMany(docs)
  console.log(`✅ Saved ${docs.length} chunks for document: ${documentId}`)
}

/**
 * Finds the most semantically similar chunks to a query vector.
 * If `label` is provided, only chunks with that label are searched (pre-filter).
 * Returns text, score, pageNumber, and label for source grounding.
 *
 * @param {string}   documentId
 * @param {number[]} queryVector
 * @param {number}   topK
 * @param {string|null} label  - Optional topic label to pre-filter chunks
 * @returns {Promise<{text: string, score: number, pageNumber: number, label: string}[]>}
 */
const findSimilarChunks = async (documentId, queryVector, topK = 5, label = null) => {
  const query = { documentId }
  if (label && label !== 'GENERAL') query.label = label

  const allChunks = await Chunk.find(query).lean()

  // If label filter gave 0 results, fall back to full document search
  const chunks = allChunks.length > 0
    ? allChunks
    : await Chunk.find({ documentId }).lean()

  if (chunks.length === 0) {
    throw new Error('No chunks found for this document. Please re-upload.')
  }

  const scored = chunks.map((chunk) => ({
    text: chunk.text,
    pageNumber: chunk.pageNumber || 1,
    label: chunk.label || 'GENERAL',
    score: cosineSimilarity(queryVector, chunk.embedding),
  }))

  scored.sort((a, b) => b.score - a.score)
  return scored.slice(0, topK)
}

/**
 * Returns ALL chunks for a document (for full-document modes: summary, quiz, mindmap).
 * Sorted by chunkIndex to preserve document order.
 *
 * @param {string} documentId
 * @returns {Promise<{text: string, pageNumber: number, chunkIndex: number}[]>}
 */
const getAllChunks = async (documentId) => {
  const chunks = await Chunk.find({ documentId })
    .sort({ chunkIndex: 1 })
    .select('text pageNumber chunkIndex')
    .lean()

  if (chunks.length === 0) {
    throw new Error('No chunks found for this document. Please re-upload.')
  }

  return chunks.map((c) => ({
    text: c.text,
    pageNumber: c.pageNumber || 1,
    chunkIndex: c.chunkIndex,
  }))
}

/**
 * Multi-document search — finds similar chunks across multiple documents.
 * If `label` is provided, only chunks with that label are searched (pre-filter).
 *
 * @param {string[]} documentIds
 * @param {number[]} queryVector
 * @param {number}   topK
 * @param {string|null} label  - Optional topic label to pre-filter chunks
 */
const findSimilarChunksMultiDoc = async (documentIds, queryVector, topK = 8, label = null) => {
  const query = { documentId: { $in: documentIds } }
  if (label && label !== 'GENERAL') query.label = label

  let allChunks = await Chunk.find(query).lean()

  // If label filter gave 0 results, fall back to full multi-doc search
  if (allChunks.length === 0) {
    allChunks = await Chunk.find({ documentId: { $in: documentIds } }).lean()
  }

  if (allChunks.length === 0) {
    throw new Error('No chunks found for these documents.')
  }

  const scored = allChunks.map((chunk) => ({
    text: chunk.text,
    pageNumber: chunk.pageNumber || 1,
    documentId: chunk.documentId,
    filename: chunk.filename,
    label: chunk.label || 'GENERAL',
    score: cosineSimilarity(queryVector, chunk.embedding),
  }))

  scored.sort((a, b) => b.score - a.score)
  return scored.slice(0, topK)
}

/**
 * Deletes all chunks for a document.
 */
const deleteChunks = async (documentId) => {
  await Chunk.deleteMany({ documentId })
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const cosineSimilarity = (vecA, vecB) => {
  let dot = 0, normA = 0, normB = 0
  for (let i = 0; i < vecA.length; i++) {
    dot   += vecA[i] * vecB[i]
    normA += vecA[i] * vecA[i]
    normB += vecB[i] * vecB[i]
  }
  if (normA === 0 || normB === 0) return 0
  return dot / (Math.sqrt(normA) * Math.sqrt(normB))
}

module.exports = { saveChunks, findSimilarChunks, getAllChunks, findSimilarChunksMultiDoc, deleteChunks }
