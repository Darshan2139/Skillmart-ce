const express = require("express");
const { chatWithBot } = require("../controllers/Chatbot");

const router = express.Router();

// Chat with the bot
router.post("/chat", chatWithBot);

module.exports = router;
