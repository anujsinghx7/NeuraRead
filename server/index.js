import "./env.js"; // ← MUST be first: loads .env before any other module reads process.env
import dns from "dns";
dns.setDefaultResultOrder("ipv4first");

// createRequire lets ESM files load CommonJS modules (all services use CJS require/module.exports)
import { createRequire } from "module";
const require = createRequire(import.meta.url);

console.log("URI:", process.env.MONGODB_URI);

import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";

import uploadRoutes from "./routes/uploadRoutes.js";
import queryRoutes from "./routes/queryRoutes.js";
import modeRoutes from "./routes/modeRoutes.js";

// ─── Train Naive Bayes Classifier (once, before any request) ─────────────────
// Training is synchronous and takes < 10 ms. No re-training on requests.
const { trainClassifier } = require('./services/classifier.js')
trainClassifier()

const app = express()

// ─── Connect to MongoDB ───────────────────────────────────────────────────────
connectDB()

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({
  origin: 'http://localhost:3000', // React dev server
  methods: ['GET', 'POST'],
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/upload', uploadRoutes)
app.use('/api/query',  queryRoutes)
app.use('/api/mode',   modeRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', project: 'NeuraRead' })
})

// ─── Global Error Handler ────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Server error:', err.message)
  res.status(err.status || 500).json({ message: err.message || 'Internal server error' })
})

// ─── Start ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`
  ✦ NeuraRead server running
  → Local:  http://localhost:${PORT}
  → Health: http://localhost:${PORT}/api/health
  → Modes:  qa | summary | quiz | mindmap
  `)
})
