const express = require('express');
const { testAvailableModels } = require('../controllers/ModelTest');

const router = express.Router();

// Test available models
router.get('/models', testAvailableModels);

module.exports = router;
