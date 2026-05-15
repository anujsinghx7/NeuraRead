const express = require('express')
const router = express.Router()
const { queryDocument } = require('../controllers/queryController')

// POST /api/query
router.post('/', queryDocument)

module.exports = router
