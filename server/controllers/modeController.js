const { generateQA }       = require('../services/generation/qaGenerator')
const { generateSummary }  = require('../services/generation/summaryGenerator')
const { generateQuiz }     = require('../services/generation/quizGenerator')
const { generateMindMap }  = require('../services/generation/mindmapGenerator')
const { validateOutput }   = require('../services/generation/formatting')
const Document             = require('../models/Document')

const VALID_MODES = ['qa', 'summary', 'quiz', 'mindmap']

/**
 * POST /api/mode
 * Body: { mode, documentId, question?, documentIds?, sessionId? }
 *
 * Dispatches to the correct generator based on mode.
 * Supports both single-doc (documentId) and multi-doc (documentIds/sessionId).
 */
const executeMode = async (req, res) => {
  try {
    const { mode, documentId, question, documentIds, sessionId } = req.body

    // Validate mode
    if (!mode || !VALID_MODES.includes(mode)) {
      return res.status(400).json({
        message: `Invalid mode. Must be one of: ${VALID_MODES.join(', ')}`,
      })
    }

    // Resolve document IDs — support sessionId, documentIds array, or single documentId
    let resolvedDocIds = []
    if (sessionId) {
      const docs = await Document.find({ sessionId }).select('documentId').lean()
      resolvedDocIds = docs.map(d => d.documentId)
    } else if (documentIds && Array.isArray(documentIds) && documentIds.length > 0) {
      resolvedDocIds = documentIds
    } else if (documentId) {
      resolvedDocIds = [documentId]
    }

    if (resolvedDocIds.length === 0) {
      return res.status(400).json({ message: 'documentId, documentIds, or sessionId is required.' })
    }

    console.log(`\n🔮 Mode: ${mode.toUpperCase()} | Documents: ${resolvedDocIds.length}`)

    let result

    switch (mode) {
      case 'qa': {
        if (!question || !question.trim()) {
          return res.status(400).json({ message: 'question is required for QA mode.' })
        }
        console.log(`  Question: "${question}"`)
        console.log('  Generating structured answer with source grounding...')
        result = await generateQA(resolvedDocIds, question)
        break
      }

      case 'summary': {
        console.log('  Generating structured summary...')
        result = await generateSummary(resolvedDocIds)
        break
      }

      case 'quiz': {
        console.log('  Generating 20 MCQs...')
        result = await generateQuiz(resolvedDocIds)
        break
      }

      case 'mindmap': {
        console.log('  Generating mind map...')
        result = await generateMindMap(resolvedDocIds)
        break
      }
    }

    // Validate output structure
    const validated = validateOutput(result, mode)

    console.log(`✅ ${mode.toUpperCase()} generation complete\n`)

    res.status(200).json({
      mode,
      documentIds: resolvedDocIds,
      data: validated,
    })
  } catch (error) {
    console.error(`❌ Mode error:`, error.message)
    res.status(500).json({
      message: error.message || 'Failed to execute mode.',
    })
  }
}

module.exports = { executeMode }
