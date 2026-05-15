const { generateStructured } = require('../llm')
const { retrieveContext, formatContext } = require('./retrieval')

/**
 * Generate a structured Q&A answer with source grounding.
 * Returns a JSON object with markdown-formatted answer and sources.
 *
 * @param {string[]} documentIds
 * @param {string} question
 * @returns {Promise<{answer: string, sources: Array}>}
 */
const generateQA = async (documentIds, question) => {
  const chunks = await retrieveContext(documentIds, question, 3)
  const context = formatContext(chunks)

  const prompt =
`Context:
${context}

Question: ${question}

Instruction:
You are NeuraRead, an AI study assistant.
Answer ONLY using the provided context above.
If the answer is not found in the context, state: "I couldn't find this information in the uploaded documents."
Do NOT hallucinate or fabricate information.

Format your answer using Markdown:
- Use **bold** for important terms and concepts
- Use ### headings to organise different aspects
- Use bullet points ( - ) for lists
- Use numbered lists (1. 2. 3.) for steps or ranked items
- Use > blockquotes for direct quotes from the document
- End with a brief "**Key Takeaway:**" line if the answer is long

Respond with this exact JSON structure (raw JSON only, no code fences):
{
  "answer": "Your detailed markdown-formatted answer here.",
  "sources": [
    {
      "page_number": 1,
      "confidence_score": 0.95,
      "extracted_text": "The exact relevant snippet from the source chunk (max 150 words)"
    }
  ]
}

Include 2-4 sources. Set confidence_score between 0.0 and 1.0 based on how directly the source supports the answer.`

  return generateStructured(prompt)
}

module.exports = { generateQA }
