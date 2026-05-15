const { generateStructured } = require('../llm')
const { getAllContext, formatContext } = require('./retrieval')

/**
 * Generate a comprehensive structured summary for exam preparation.
 * Returns a JSON object with sections, key terms, and revision notes.
 *
 * @param {string[]} documentIds
 * @returns {Promise<object>}
 */
const generateSummary = async (documentIds) => {
  const allChunks = await getAllContext(documentIds)

  const maxChunks = 12
  const chunks = allChunks.length > maxChunks
    ? sampleChunks(allChunks, maxChunks)
    : allChunks

  const context = formatContext(chunks)

  const prompt =
`Context:
${context}

Instruction:
You are NeuraRead, an expert AI study assistant.
Generate a DETAILED, WELL-STRUCTURED summary of the document STRICTLY based on the context above.
Do NOT hallucinate or make up information not present in the context.
Cover ALL major topics thoroughly using clear, student-friendly language.
Use **bold** for key terms within text fields.

Respond with this exact JSON structure (raw JSON only, no code fences):
{
  "title": "Document Title or Main Subject",
  "overview": "A comprehensive 3-5 sentence overview. Use **bold** for key terms.",
  "reading_time_minutes": 8,
  "total_topics": 5,
  "sections": [
    {
      "heading": "Section/Topic Title",
      "icon": "📘",
      "content": "Detailed explanation in 3-6 sentences. Use **bold** for important terms.",
      "key_points": [
        "**Key Term** — Clear explanation of why this matters",
        "**Another Concept** — Description with context from the document",
        "**Important Detail** — How it relates to the broader topic"
      ],
      "importance": "high"
    }
  ],
  "key_terms": [
    {
      "term": "Important Term",
      "definition": "Clear, concise definition based on the document"
    }
  ],
  "quick_revision": [
    "**Concept Name**: Brief one-liner summary for quick review",
    "**Another Concept**: Key fact to remember for exams"
  ],
  "connections": [
    "How Topic A relates to Topic B — brief explanation"
  ]
}

IMPORTANT:
- Create 4-8 sections covering ALL major topics
- Include 3-6 key_points per section
- Include 6-12 key_terms (glossary)
- Include 8-15 quick_revision notes
- Include 3-5 connections between topics
- Set importance to "high", "medium", or "low" for each section
- Choose appropriate emoji icons for each section (📘, 🔬, 📊, 💡, ⚙️, 🧪, 📐, 🌐, etc.)`

  return generateStructured(prompt)
}

/**
 * Evenly sample chunks from the document to stay within context limits.
 */
const sampleChunks = (chunks, maxCount) => {
  if (chunks.length <= maxCount) return chunks
  const step = chunks.length / maxCount
  const sampled = []
  for (let i = 0; i < maxCount; i++) {
    sampled.push(chunks[Math.floor(i * step)])
  }
  return sampled
}

module.exports = { generateSummary }
