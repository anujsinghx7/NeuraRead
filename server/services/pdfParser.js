const fs = require('fs')
const pdfParse = require('pdf-parse')

/**
 * Reads a PDF file and returns page-aware text extraction.
 * @param {string} filePath - Absolute path to the PDF file
 * @returns {Promise<{fullText: string, pages: {pageNum: number, text: string}[]}>}
 */
const extractText = async (filePath) => {
  const buffer = fs.readFileSync(filePath)

  // Track text per page using pdf-parse's pagerender option
  const pageTexts = []

  const options = {
    // Custom page renderer that captures text per page
    pagerender: (pageData) => {
      return pageData.getTextContent().then((textContent) => {
        let pageText = ''
        let lastY = null
        for (const item of textContent.items) {
          // Add newline when Y position changes (new line of text)
          if (lastY !== null && Math.abs(item.transform[5] - lastY) > 2) {
            pageText += '\n'
          }
          pageText += item.str
          lastY = item.transform[5]
        }
        return pageText
      })
    },
  }

  const data = await pdfParse(buffer, options)

  if (!data.text || data.text.trim().length === 0) {
    throw new Error(
      'No text found in this PDF. It may be a scanned/image-only PDF.'
    )
  }

  // pdf-parse returns pages as rendered strings joined by form-feed
  // Split by form-feed character or use the numpages info
  const rawPages = data.text.split(/\f/)

  const pages = rawPages
    .map((text, i) => ({
      pageNum: i + 1,
      text: cleanText(text),
    }))
    .filter((p) => p.text.length > 0)

  const fullText = pages.map((p) => p.text).join('\n\n')

  return { fullText, pages, totalPages: data.numpages }
}

/**
 * Clean up text whitespace while keeping paragraph breaks.
 */
const cleanText = (text) => {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim()
}

module.exports = { extractText }
