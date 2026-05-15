# NeuraRead

NeuraRead is an AI-powered intelligent study assistant built using a Retrieval-Augmented Generation (RAG) architecture to transform static PDF documents into an interactive learning experience.

The system processes unstructured academic documents through a complete AI pipeline including PDF parsing, semantic text chunking, embedding generation, vector-based retrieval, and Large Language Model (LLM) response synthesis. Instead of relying on naive prompt-based AI responses, NeuraRead uses contextual retrieval to ground answers in uploaded documents, improving factual relevance and reducing hallucinations.

The platform enables students to upload multiple PDFs and interact with their study material through semantic question answering, AI-generated summaries, adaptive quiz generation, and visual mind-map exploration.

This project demonstrates practical implementation of modern AI engineering concepts including:

- Retrieval-Augmented Generation (RAG)
- Semantic search and vector retrieval
- Text chunking strategies for long-context document processing
- Embedding generation for similarity search
- LLM orchestration
- Multi-document contextual reasoning
- AI-powered educational workflow design

Built as a full-stack AI application using React, Node.js, Express, and Gemini API.

## Features

- Upload one or multiple PDF documents
- AI-powered document understanding
- PDF text extraction and parsing
- Smart chunking for long documents
- Embedding + vector search
- Ask questions from uploaded PDFs
- AI-generated summaries
- Quiz generation
- Mind map visualization
- Multiple study modes
- Gemini API integration

---

## Tech Stack

### Frontend
- React
- Vite
- Axios
- CSS

### Backend
- Node.js
- Express.js
- Multer (file upload)
- PDF parsing
- Vector storage logic
- Gemini API

### Deployment
- Frontend: Netlify
- Backend: Render

---

## Project Structure

```bash
NeuraRead/
│
├── client/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   │
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   │   ├── generation/
│   │   ├── chunker.js
│   │   ├── classifier.js
│   │   ├── embedder.js
│   │   ├── llm.js
│   │   ├── pdfParser.js
│   │   └── vectorStore.js
│   │
│   ├── tmp/
│   ├── index.js
│   └── package.json
│
└── README.md
```

---

## Installation

### Clone repository

```bash
git clone https://github.com/anujsinghx7/NeuraRead.git
cd NeuraRead
```

---

## Frontend Setup

```bash
cd client
npm install
npm run dev
```

Frontend runs on:

```bash
http://localhost:5173
```

---

## Backend Setup

```bash
cd server
npm install
npm start
```

Backend runs on:

```bash
http://localhost:5000
```

---

## Environment Variables

Create:

```bash
server/.env
```

Add:

```env
GEMINI_API_KEY=your_api_key_here
```

If your project uses additional variables:

```env
PORT=5000
MONGODB_URI=your_database_url
JWT_SECRET=your_secret
```

---

## Deployment

### Backend (Render)

Settings:

```bash
Root Directory: server
Build Command: npm install
Start Command: node index.js
```

Add environment variables in Render dashboard.

---

### Frontend (Netlify)

Settings:

```bash
Base Directory: client
Build Command: npm run build
Publish Directory: dist
```

Environment variable:

```env
VITE_API_URL=https://your-render-backend-url.onrender.com
```

---

## API Usage

Example endpoints:

### Upload PDF

```http
POST /api/upload
```

### Query Documents

```http
POST /api/query
```

### Study Modes

```http
POST /api/mode
```

---

## Live Demo

Frontend:

```bash
https://your-netlify-link.netlify.app
```

Backend:

```bash
https://your-render-link.onrender.com
```

---

## Author

Anuj Singh

GitHub:
https://github.com/anujsinghx7

---

## License

This project is for educational and personal use.
