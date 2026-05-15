const { embedQuery }         = require('../services/embedder')
const { findSimilarChunks }  = require('../services/vectorStore')
const { generateAnswer }     = require('../services/llm')
const { classifyText }       = require('../services/classifier')

/**
 * POST /api/query
 * Body: { question: string, documentId: string }
 *
 * Flow:
 * 1. Classify the question → topic label (e.g. "ML", "OS")
 * 2. Embed the question
 * 3. Find top-5 most similar chunks (pre-filtered by label if not GENERAL)
 * 4. Send chunks + question to LLM
 * 5. Return the answer + sources
 */
const queryDocument = async (req, res) => {
  try {
    const { question, documentId } = req.body

    if (!question || !question.trim()) {
      return res.status(400).json({ message: 'Question is required.' })
    }

    if (!documentId) {
      return res.status(400).json({ message: 'documentId is required.' })
    }

    console.log(`\n❓ Question: "${question}"`)

    // 1. Classify the query to narrow search scope
    const queryLabel = classifyText(question)
    console.log(`  Step 1/4: Query classified as → "${queryLabel}"`)

    // 2. Embed the question
    console.log('  Step 2/4: Embedding question...')
    const queryVector = await embedQuery(question)

    // 3. Semantic search — pre-filtered by label (falls back to full search if 0 results)
    console.log(`  Step 3/4: Searching for relevant chunks (label filter: "${queryLabel}")...`)
    const topChunks = await findSimilarChunks(documentId, queryVector, 5, queryLabel)
    console.log(`  → Found ${topChunks.length} relevant chunks`)

    // 4. Generate answer with LLM
    console.log('  Step 4/4: Generating answer...')
    const answer = await generateAnswer(question, topChunks)

    console.log('✅ Answer generated\n')

    res.status(200).json({
      answer,
      queryLabel,
      sources: topChunks.map((c) => ({ text: c.text.slice(0, 200) + '…', label: c.label })),
    })
  } catch (error) {
    console.error('❌ Query error:', error.message)
    res.status(500).json({ message: error.message || 'Failed to answer question.' })
  }
}

module.exports = { queryDocument }
