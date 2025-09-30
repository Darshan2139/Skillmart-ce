const { GoogleGenerativeAI } = require('@google/generative-ai');

// Test available models
const testAvailableModels = async (req, res) => {
    try {
        // Check if API key is configured
        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({
                success: false,
                message: 'GEMINI_API_KEY is not configured'
            });
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        
        // Try to list models using the REST API directly
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
        const data = await response.json();
        
        return res.status(200).json({
            success: true,
            message: 'Available models retrieved',
            data: data
        });

    } catch (error) {
        console.error('Error in testAvailableModels:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to retrieve models',
            error: error.message
        });
    }
};

module.exports = {
    testAvailableModels
};
