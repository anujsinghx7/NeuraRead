/**
 * Page-aware text chunker.
 *
 * Splits document into overlapping chunks while tracking which page
 * each chunk originated from (uses the page with the most words).
 *
 * @param {Array<{pageNum: number, text: string}>} pages - Page-aware text
 * @param {number} chunkSize  - Target words per chunk (default 400)
 * @param {number} overlap    - Words to overlap (default 60)
 * @returns {Array<{text: string, pageNumber: number}>}
 */
const chunkText = (pages, chunkSize = 400, overlap = 60) => {
  // Build a flat word array where each word knows its page
  const taggedWords = []
  for (const page of pages) {
    const words = page.text.split(/\s+/).filter(Boolean)
    for (const word of words) {
      taggedWords.push({ word, pageNum: page.pageNum })
    }
  }

  if (taggedWords.length === 0) return []

  // If the whole document is smaller than one chunk
  if (taggedWords.length <= chunkSize) {
    const majorityPage = getMajorityPage(taggedWords)
    return [{ text: taggedWords.map((w) => w.word).join(' '), pageNumber: majorityPage }]
  }

  const chunks = []
  let start = 0

  while (start < taggedWords.length) {
    const end = Math.min(start + chunkSize, taggedWords.length)
    const slice = taggedWords.slice(start, end)

    chunks.push({
      text: slice.map((w) => w.word).join(' '),
      pageNumber: getMajorityPage(slice),
    })

    start += chunkSize - overlap
    if (start >= taggedWords.length) break
  }

  return chunks
}

/**
 * Returns the page number that contributed the most words to this slice.
 */
const getMajorityPage = (taggedWords) => {
  const counts = {}
  for (const w of taggedWords) {
    counts[w.pageNum] = (counts[w.pageNum] || 0) + 1
  }
  let maxPage = taggedWords[0].pageNum
  let maxCount = 0
  for (const [page, count] of Object.entries(counts)) {
    if (count > maxCount) {
      maxCount = count
      maxPage = Number(page)
    }
  }
  return maxPage
}

module.exports = { chunkText }
