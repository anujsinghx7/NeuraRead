const express = require('express')
const router = express.Router()
const { executeMode } = require('../controllers/modeController')

// POST /api/mode
router.post('/', executeMode)

module.exports = router
