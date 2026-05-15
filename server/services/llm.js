/**
 * llm.js — Google Gemini LLM client for NeuraRead.
 *
 * Uses raw fetch API for Gemini Flash Lite.
 * Requires GEMINI_API_KEY in .env.
 *
 * Exports (same interface — no changes needed in callers):
 *   generateResponse(prompt)                → string  (generic helper)
 *   generateAnswer(question, contextChunks) → string  (RAG Q&A)
 *   generateStructured(prompt)              → object  (parsed JSON)
 *   generateHTML(prompt)                    → string  (raw HTML)
 */

// ─── Config ───────────────────────────────────────────────────────────────────

const GEMINI_API_KEY = process.env.GEMINI_API_KEY
if (!GEMINI_API_KEY) {
  console.error('❌ GEMINI_API_KEY is missing in .env — LLM calls will fail.')
}

const MODEL_NAME = process.env.GEMINI_MODEL || 'gemini-flash-lite-latest'
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${GEMINI_API_KEY}`

// Max chars of context fed to the model.
const MAX_CONTEXT_CHARS = 8000

// Sentinel prefix — if callGemini returns this, the call failed
const ERROR_PREFIX = '__GEMINI_ERROR__:'

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// ─── Core generation helpers ──────────────────────────────────────────────────

/**
 * Send a prompt to Google Gemini via raw fetch and return the response text.
 * On failure returns an ERROR_PREFIX string (never throws).
 *
 * @param {string} prompt
 * @param {object} [generationConfig]  - optional extra config (like JSON mode)
 * @returns {Promise<string>}
 */
const callGemini = async (prompt, generationConfig = null) => {
  const startTime = Date.now()
  console.log(`📤 Gemini | model: ${MODEL_NAME} | prompt: ${prompt.length} chars`)

  const bodyPayload = {
    contents: [
      {
        parts: [{ text: prompt }]
      }
    ]
  }

  if (generationConfig) {
    bodyPayload.generationConfig = generationConfig
  }

  // Max 2 attempts total (1 initial + 1 retry on 503)
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bodyPayload)
      })

      if (!response.ok) {
        const errorText = await response.text()
        
        // If status is 503, retry once
        if (response.status === 503 && attempt === 1) {
          console.warn(`⚠️ Gemini busy — switching to fallback model...`)

          // fallback model
          const fallbackUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${GEMINI_API_KEY}`

          await sleep(1000)

          return await fetch(fallbackUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bodyPayload)
          }).then(res => res.json())
            .then(data => data?.candidates?.[0]?.content?.parts?.[0]?.text || `${ERROR_PREFIX} fallback failed`)
        }

        console.error(`❌ Gemini error HTTP ${response.status}:`, errorText)
        return `${ERROR_PREFIX} HTTP ${response.status} - API Error`
      }

      const data = await response.json()

      if (!data.candidates || data.candidates.length === 0) {
        return `${ERROR_PREFIX} No response from AI`
      }

      const text = data.candidates[0].content.parts[0].text
      console.log(`📥 Gemini done in ${Date.now() - startTime}ms | response: ${text.length} chars`)
      
      return text

    } catch (err) {
      console.error(`❌ Gemini network error (attempt ${attempt}):`, err.message)
      
      if (attempt === 1) {
         // Treat network errors like 503s for retry purposes
         await sleep(2000)
         continue
      }
      return `${ERROR_PREFIX} Network error: ${err.message}`
    }
  }

  return `${ERROR_PREFIX} Max retries exceeded`
}

// ─── Context trimmer ─────────────────────────────────────────────────────────

const buildContext = (chunks) => {
  const PER_CHUNK_LIMIT = 2000
  let budget = MAX_CONTEXT_CHARS
  const parts = []

  for (let i = 0; i < chunks.length; i++) {
    if (budget <= 0) break
    const raw  = (chunks[i].text || '').trim()
    const text = raw.length > PER_CHUNK_LIMIT ? raw.slice(0, PER_CHUNK_LIMIT) + '…' : raw
    const part = `[Source ${i + 1} | Page ${chunks[i].pageNumber || '?'}]\n${text}`
    parts.push(part)
    budget -= part.length
  }

  return parts.join('\n\n---\n\n')
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Generic single-prompt response.
 */
const generateResponse = async (prompt) => {
  const raw = await callGemini(prompt)
  if (raw.startsWith(ERROR_PREFIX)) throw new Error(raw.replace(ERROR_PREFIX, '').trim())
  return raw
}

/**
 * RAG text answer — used by queryController.
 */
const generateAnswer = async (question, contextChunks) => {
  const contextText = buildContext(contextChunks)

  const prompt =
`You are a helpful document assistant. Answer ONLY using the context below.
If the answer is not in the context, say: "Not available in document."

Context:
${contextText}

Question: ${question}

Answer:`

  const raw = await callGemini(prompt)
  if (raw.startsWith(ERROR_PREFIX)) return 'AI service temporarily unavailable. Please try again.'
  return raw
}

/**
 * Structured JSON generation — uses Gemini's native JSON mode.
 *
 * @param {string} prompt
 * @returns {Promise<object>}
 */
const generateStructured = async (prompt) => {
  // Use responseMimeType to force Gemini to return pure JSON
  const raw = await callGemini(prompt, { responseMimeType: 'application/json' })

  if (raw.startsWith(ERROR_PREFIX)) {
    throw new Error(`AI service temporarily unavailable. Please try again. (${raw.replace(ERROR_PREFIX, '').trim()})`)
  }

  return parseJSONSafe(raw)
}

/**
 * HTML generation — used by mindmap / formatting services.
 */
const generateHTML = async (prompt) => {
  const wrappedPrompt =
    `Respond with raw HTML only. No markdown fences. No explanation. Just HTML.

${prompt}`

  const raw = await callGemini(wrappedPrompt)
  if (raw.startsWith(ERROR_PREFIX)) throw new Error(raw.replace(ERROR_PREFIX, '').trim())
  return raw
}

// ─── JSON parse helper ────────────────────────────────────────────────────────

/**
 * Safely parse JSON from LLM output.
 * Tries: direct parse → strip code fences → regex extract first { } / [ ].
 */
const parseJSONSafe = (raw) => {
  // 1. Direct parse (happy path)
  try { return JSON.parse(raw) } catch (_) {}

  // 2. Strip markdown code fences (```json … ``` or ``` … ```)
  const fenceMatch = raw.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/)
  if (fenceMatch) {
    try { return JSON.parse(fenceMatch[1].trim()) } catch (_) {}
  }

  // 3. Extract first { … } or [ … ] block
  const jsonMatch = raw.match(/(\{[\s\S]*\}|\[[\s\S]*\])/)
  if (jsonMatch) {
    try { return JSON.parse(jsonMatch[1]) } catch (_) {}
  }

  console.error('❌ JSON parse failed. Raw snippet:', raw.slice(0, 500))
  throw new Error('Failed to parse JSON from Gemini response.')
}

module.exports = { generateAnswer, generateStructured, generateHTML, generateResponse }