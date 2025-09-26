const express = require('express');
const router = express.Router();
const { getProjectInfo, chatWithBotEnhanced } = require('../controllers/ProjectInfo');

// Get project information
router.get('/info', getProjectInfo);

// Enhanced chatbot with project navigation
router.post('/chat', chatWithBotEnhanced);

module.exports = router;
