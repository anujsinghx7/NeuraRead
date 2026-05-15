const mongoose = require('mongoose')

const chunkSchema = new mongoose.Schema(
  {
    documentId: {
      type: String,
      required: true,
      index: true,
    },
    filename: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    chunkIndex: {
      type: Number,
      required: true,
    },
    pageNumber: {
      type: Number,
      default: 1,
    },
    // Topic label assigned by Naive Bayes classifier (e.g. "ML", "DBMS", "OS")
    label: {
      type: String,
      default: 'GENERAL',
    },
    // Voyage AI embedding vector (1024 dimensions)
    embedding: {
      type: [Number],
      required: true,
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Chunk', chunkSchema)
