const { generateStructured } = require('../llm')
const { getAllContext, formatContext } = require('./retrieval')

/**
 * Generate 20 high-quality MCQs from the document(s).
 *
 * @param {string[]} documentIds
 * @returns {Promise<{questions: Array}>}
 */
const generateQuiz = async (documentIds) => {
  const allChunks = await getAllContext(documentIds)

  // Sample chunks to fit context window while covering the document
  const maxChunks = 12
  const chunks = allChunks.length > maxChunks
    ? sampleChunks(allChunks, maxChunks)
    : allChunks

  const context = formatContext(chunks)

  const prompt =
`Context:
${context}

Instruction:
You are NeuraRead, an expert quiz generator for exam preparation.
Generate exactly 20 high-quality multiple-choice questions (MCQs) STRICTLY based on the context above.
Do NOT hallucinate or make up information not present in the context.

RULES:
- Questions should test DEEP UNDERSTANDING, not trivial recall.
- Include a mix of conceptual, application-based, and analytical questions.
- AVOID simple factoid questions like "What year was...?" or direct definition recall.
- Each question must have exactly 4 options (A, B, C, D). Only ONE option should be correct.
- Distractors (wrong options) must be plausible but clearly wrong.
- Explanations should state WHY the correct answer is right and why key distractors are wrong.
- Distribute difficulty: roughly 5 Easy, 10 Medium, 5 Hard.

Respond with this exact JSON structure (raw JSON only, no code fences):
{
  "questions": [
    {
      "id": 1,
      "difficulty": "Easy",
      "question": "Question text here?",
      "options": {
        "A": "Option A text",
        "B": "Option B text",
        "C": "Option C text",
        "D": "Option D text"
      },
      "correct_answer": "B",
      "explanation": "B is correct because... A is wrong because... C is wrong because..."
    }
  ]
}

Generate exactly 20 questions with IDs 1 through 20.`

  const result = await generateStructured(prompt)

  // Validate and fix the questions array
  if (result.questions && Array.isArray(result.questions)) {
    result.questions = result.questions.map((q, i) => ({
      id: q.id || i + 1,
      difficulty: ['Easy', 'Medium', 'Hard'].includes(q.difficulty) ? q.difficulty : 'Medium',
      question: q.question || '',
      options: q.options || {},
      correct_answer: q.correct_answer || 'A',
      explanation: q.explanation || '',
    }))
  }

  return result
}

const sampleChunks = (chunks, maxCount) => {
  if (chunks.length <= maxCount) return chunks
  const step = chunks.length / maxCount
  const sampled = []
  for (let i = 0; i < maxCount; i++) {
    sampled.push(chunks[Math.floor(i * step)])
  }
  return sampled
}

module.exports = { generateQuiz }
