const express = require('express')
const router = express.Router()
const upload = require('../middleware/upload')
const { uploadPDFs } = require('../controllers/uploadController')

// POST /api/upload
// multer handles up to 5 PDF files, then uploadPDFs processes them all
router.post('/', upload.array('pdfs', 5), uploadPDFs)

module.exports = router
