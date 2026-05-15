const fs = require('fs')

const { extractText }      = require('../services/pdfParser')
const { chunkText }        = require('../services/chunker')
const { embedTexts }       = require('../services/embedder')
const { saveChunks }       = require('../services/vectorStore')
const { classifyText }     = require('../services/classifier')
const Document             = require('../models/Document')

/**
 * POST /api/upload
 * Accepts up to 5 PDFs, runs each through the full page-aware pipeline:
 * Parse (with pages) → Chunk (page-aware) → Embed → Store
 *
 * Returns a sessionId that groups all uploaded documents together.
 */
const uploadPDFs = async (req, res) => {
  const files = req.files || []

  try {
    if (files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded.' })
    }

    if (files.length > 5) {
      return res.status(400).json({ message: 'Maximum 5 PDFs allowed.' })
    }

    const sessionId = require('crypto').randomUUID()
    const documents = []

    console.log(`\n📄 Processing ${files.length} PDF(s) — Session: ${sessionId}`)

    for (let idx = 0; idx < files.length; idx++) {
      const file = files[idx]
      const filePath = file.path

      try {
        console.log(`\n  📑 [${idx + 1}/${files.length}] ${file.originalname}`)

        // 1. Extract text (page-aware)
        console.log('    Step 1/4: Extracting text from PDF...')
        const { fullText, pages, totalPages } = await extractText(filePath)
        console.log(`    → Extracted ${fullText.length} characters across ${totalPages} pages`)

        // 2. Split into page-aware chunks
        console.log('    Step 2/4: Chunking text (page-aware)...')
        const chunks = chunkText(pages)
        console.log(`    → Created ${chunks.length} chunks`)

        // 2b. Classify each chunk with Naive Bayes (adds .label to each chunk)
        for (const chunk of chunks) {
          chunk.label = classifyText(chunk.text)
        }
        const labelCounts = chunks.reduce((acc, c) => { acc[c.label] = (acc[c.label] || 0) + 1; return acc }, {})
        console.log('    → Chunk labels:', JSON.stringify(labelCounts))

        // 3. Embed each chunk with Voyage AI
        console.log('    Step 3/4: Generating embeddings...')
        const texts = chunks.map((c) => c.text)
        const embeddings = await embedTexts(texts)

        // 4. Save to MongoDB
        console.log('    Step 4/4: Saving to database...')
        const documentId = require('crypto').randomUUID()
        await saveChunks(documentId, file.originalname, chunks, embeddings)

        // Save document metadata
        await Document.create({
          documentId,
          filename: file.originalname,
          totalPages,
          totalChunks: chunks.length,
          sessionId,
        })

        documents.push({
          documentId,
          filename: file.originalname,
          chunks: chunks.length,
          totalPages,
        })

        console.log(`    ✅ Done. Document ID: ${documentId}`)
      } finally {
        // Clean up temp file
        if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath)
      }
    }

    console.log(`\n✅ All ${files.length} PDF(s) processed. Session: ${sessionId}\n`)

    res.status(200).json({
      message: `${files.length} document(s) processed successfully.`,
      sessionId,
      documents,
      // Backward compatibility: if single file, also return flat fields
      documentId: documents[0]?.documentId,
      filename: documents[0]?.filename,
      chunks: documents.reduce((sum, d) => sum + d.chunks, 0),
      totalPages: documents.reduce((sum, d) => sum + d.totalPages, 0),
    })
  } catch (error) {
    // Clean up all temp files on error
    for (const file of files) {
      if (file.path && fs.existsSync(file.path)) fs.unlinkSync(file.path)
    }
    console.error('❌ Upload error:', error.message)
    res.status(500).json({ message: error.message || 'Failed to process PDFs.' })
  }
}

module.exports = { uploadPDFs }
