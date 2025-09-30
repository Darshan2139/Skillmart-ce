const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// System prompt for SkillMart Study Adviser Bot
const SYSTEM_PROMPT = `You are SkillMart Study Adviser Bot, a helpful, polite, and knowledgeable assistant designed to help students and instructors of the SkillMart platform. Your purpose is to provide useful guidance, answer study-related questions, solve academic problems, and explain the benefits and features of the SkillMart platform.

⚡ Behavior Rules

Always respond in a friendly and encouraging tone.

Answer study-related questions clearly, simply, and in an easy-to-understand way.

Focus only on study guidance, academic problem-solving, learning techniques, and SkillMart platform-related information.

NEVER provide unrelated, inappropriate, or external internet search answers.

When asked about SkillMart platform benefits or features, clearly describe them in simple words.

If a question is not related to study or SkillMart platform, politely say:
"I'm here to help with study questions and SkillMart platform features. Please ask related queries."

📚 Examples of Questions You Can Answer

"What is the difference between let and var in JavaScript?"
"How should I prepare for a technical exam?"
"What are the benefits of using SkillMart?"
"How can I attempt a quiz on SkillMart?"
"Explain what an assignment is in SkillMart."
"I need help understanding object-oriented programming concepts."
"What does the SkillMart chatbot help with?"
"What is the maximum number of attempts I can take for a quiz in SkillMart?"

🚫 Examples of Questions You Should NOT Answer

"Tell me a joke."
"What is the weather today?"
"Who won the last cricket match?"

✅ Goal

Provide simple, direct, and helpful answers to questions related to study, academic problems, and the SkillMart platform features.`;

// Chat with the bot
const chatWithBot = async (req, res) => {
    try {
        // Check if API key is configured
        if (!process.env.GEMINI_API_KEY) {
            console.error('GEMINI_API_KEY is not configured');
            return res.status(500).json({
                success: false,
                message: 'Chatbot service is not configured. Please contact administrator.',
                error: 'GEMINI_API_KEY not found'
            });
        }

        const { message } = req.body;

        if (!message || message.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Message is required'
            });
        }

        // Get the generative model
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        // Start a chat session with the system prompt
        const chat = model.startChat({
            history: [
                {
                    role: "user",
                    parts: [{ text: SYSTEM_PROMPT }]
                },
                {
                    role: "model",
                    parts: [{ text: "Hello! I'm the SkillMart Study Adviser Bot. I'm here to help you with study questions, academic problems, and SkillMart platform features. How can I assist you today?" }]
                }
            ]
        });

        // Send the user's message
        const result = await chat.sendMessage(message);
        const response = await result.response;
        const text = response.text();

        return res.status(200).json({
            success: true,
            message: 'Chat response generated successfully',
            data: {
                response: text
            }
        });

    } catch (error) {
        console.error('Error in chatWithBot:', error);
        console.error('Error details:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        return res.status(500).json({
            success: false,
            message: 'Failed to generate chat response',
            error: error.message
        });
    }
};

module.exports = {
    chatWithBot
};
