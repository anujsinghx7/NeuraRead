const { generateStructured } = require('../llm')
const { getAllContext, formatContext } = require('./retrieval')

/**
 * Generate a hierarchical mind map from the document(s).
 * Returns a tree with topic, description, and children arrays.
 *
 * @param {string[]} documentIds
 * @returns {Promise<{topic: string, description: string, children: Array}>}
 */
const generateMindMap = async (documentIds) => {
  const allChunks = await getAllContext(documentIds)

  const maxChunks = 10
  const chunks = allChunks.length > maxChunks
    ? sampleChunks(allChunks, maxChunks)
    : allChunks

  const context = formatContext(chunks)

  const prompt =
`Context:
${context}

Instruction:
You are NeuraRead, an expert at creating rich, detailed mind maps for study.
Generate a comprehensive hierarchical mind map STRICTLY based on the context above.
Do NOT hallucinate or add information not present in the context.

RULES:
- Create a logical hierarchy: Main Topic → Subtopics → Key Points → Details.
- The root node should be the document's main topic or title.
- Include 5-8 main subtopics (children of root).
- Each subtopic should have 3-5 key points (children).
- Key points can have 1-3 detail items (children) if needed.
- Keep "topic" labels concise (3-10 words max per node).
- Add a "description" to each node (1 sentence explaining it).
- Cover ALL major areas of the document thoroughly.

Respond with this exact JSON structure (raw JSON only, no code fences):
{
  "topic": "Main Document Topic",
  "description": "One-sentence overview of the entire document",
  "children": [
    {
      "topic": "Subtopic 1",
      "description": "Brief explanation of this subtopic",
      "children": [
        {
          "topic": "Key Point 1.1",
          "description": "What this point covers",
          "children": [
            { "topic": "Detail 1.1.1", "description": "Specific detail", "children": [] }
          ]
        },
        {
          "topic": "Key Point 1.2",
          "description": "Explanation of this point",
          "children": []
        }
      ]
    },
    {
      "topic": "Subtopic 2",
      "description": "Brief explanation",
      "children": [
        { "topic": "Key Point 2.1", "description": "Detail here", "children": [] }
      ]
    }
  ]
}

IMPORTANT: Every node MUST have "topic" (string), "description" (string), and "children" (array, can be empty).`

  const result = await generateStructured(prompt)

  // Ensure proper structure recursively
  return sanitizeMindMap(result)
}

/**
 * Recursively ensure all nodes have topic + description + children.
 */
const sanitizeMindMap = (node) => {
  if (!node || typeof node !== 'object') {
    return { topic: 'Unknown', description: '', children: [] }
  }
  return {
    topic: node.topic || 'Untitled',
    description: node.description || '',
    children: Array.isArray(node.children)
      ? node.children.map(sanitizeMindMap)
      : [],
  }
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

module.exports = { generateMindMap }
