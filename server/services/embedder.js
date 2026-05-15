const { VoyageAIClient } = require("voyageai")

const voyage = new VoyageAIClient({
  apiKey: process.env.VOYAGE_API_KEY
})

const embedTexts = async (texts) => {
  const result = await voyage.embed({
    input: texts,
    model: "voyage-2"
  })

  return result.data.map(obj => obj.embedding)
}

const embedQuery = async (text) => {
  const result = await voyage.embed({
    input: [text],
    model: "voyage-2"
  })

  return result.data[0].embedding
}

module.exports = { embedTexts, embedQuery }