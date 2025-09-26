# SkillMart Chatbot Setup Guide

## Overview
The SkillMart Study Adviser Bot is an AI-powered chatbot integrated into the SkillMart platform using Google's Gemini AI API. It helps students and instructors with study-related questions, academic problems, and platform features.

## Features
- 🤖 AI-powered responses using Gemini AI
- 💬 Real-time chat interface
- 📚 Study guidance and academic support
- 🎓 SkillMart platform feature explanations
- 📱 Responsive design for all devices
- ⚡ Fast and reliable responses

## Setup Instructions

### 1. Get Gemini API Key
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Copy the generated API key

### 2. Environment Variables
Add the following environment variable to your server's `.env` file:

```env
# Gemini AI Configuration
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Install Dependencies
The required dependencies are already installed:
- `@google/generative-ai` - For Gemini AI integration

### 4. API Endpoints
The chatbot API is available at:
- `POST /api/v1/chatbot/chat` - Send message to chatbot

### 5. Frontend Integration
The chatbot is automatically available on all pages as a floating button in the bottom-right corner.

## Usage

### For Students
- Click the robot icon in the bottom-right corner
- Ask questions about:
  - Study techniques and learning strategies
  - Course content and assignments
  - SkillMart platform features
  - Technical concepts and programming help

### For Instructors
- Use the chatbot to:
  - Get help with course creation
  - Understand platform features
  - Get guidance on assignment management
  - Learn about student engagement tools

## Example Questions
- "What is the difference between let and var in JavaScript?"
- "How should I prepare for a technical exam?"
- "What are the benefits of using SkillMart?"
- "How can I attempt a quiz on SkillMart?"
- "Explain what an assignment is in SkillMart."

## Bot Behavior
The chatbot is designed to:
- ✅ Answer study-related questions
- ✅ Explain SkillMart platform features
- ✅ Provide academic guidance
- ✅ Help with learning techniques
- ❌ Answer unrelated questions (weather, sports, etc.)
- ❌ Provide inappropriate content

## Troubleshooting

### Common Issues
1. **"Failed to send message" error**
   - Check if GEMINI_API_KEY is set correctly
   - Verify the API key is valid and active
   - Check server logs for detailed error messages

2. **Chatbot not appearing**
   - Ensure the Chatbot component is imported in App.js
   - Check browser console for JavaScript errors

3. **Slow responses**
   - This is normal for AI-generated responses
   - Responses typically take 2-5 seconds

### Server Logs
Check server logs for detailed error information:
```bash
cd server
npm run dev
```

## Security Notes
- The API key is stored server-side only
- All communication is encrypted
- No user data is stored permanently
- Each conversation starts fresh

## Support
For technical support or feature requests, please contact the development team.
