const mongoose = require('mongoose')

const documentSchema = new mongoose.Schema(
  {
    documentId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    sessionId: {
      type: String,
      index: true,
    },
    filename: {
      type: String,
      required: true,
    },
    totalPages: {
      type: Number,
      default: 0,
    },
    totalChunks: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Document', documentSchema)
