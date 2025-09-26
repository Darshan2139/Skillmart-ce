const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Project structure and navigation data
const PROJECT_STRUCTURE = {
  dashboard: {
    student: [
      { name: "Enrolled Courses", path: "/dashboard/enrolled-courses", description: "View all courses you're enrolled in" },
      { name: "Your Cart", path: "/dashboard/cart", description: "Manage your course cart and checkout" },
      { name: "Assignments", path: "/dashboard/assignments", description: "View and submit assignments" },
      { name: "My Profile", path: "/dashboard/my-profile", description: "Manage your profile settings" }
    ],
    instructor: [
      { name: "Dashboard", path: "/dashboard/instructor", description: "Main instructor dashboard" },
      { name: "My Courses", path: "/dashboard/my-courses", description: "Manage your created courses" },
      { name: "Add Course", path: "/dashboard/add-course", description: "Create new courses" },
      { name: "Assignment Management", path: "/dashboard/assignment-management", description: "Create and manage assignments" },
      { name: "Category Management", path: "/dashboard/category-management", description: "Manage course categories" },
      { name: "My Profile", path: "/dashboard/my-profile", description: "Manage your profile settings" }
    ]
  },
  mainPages: [
    { name: "Home", path: "/", description: "Main homepage with course exploration" },
    { name: "Catalog", path: "/catalog", description: "Browse all available courses" },
    { name: "About Us", path: "/about", description: "Learn about SkillMart platform" },
    { name: "Contact Us", path: "/contact", description: "Get in touch with support" }
  ],
  courseCategories: [
    { name: "Free Courses", description: "No-cost courses for beginners" },
    { name: "New to Coding", description: "Perfect for absolute beginners" },
    { name: "Most Popular", description: "Trending and highly-rated courses" },
    { name: "Skills Paths", description: "Structured learning paths" },
    { name: "Career Paths", description: "Professional development tracks" }
  ],
  features: [
    { name: "Course Creation", description: "Instructors can create comprehensive courses with videos, quizzes, and assignments" },
    { name: "Assignment System", description: "Create and manage assignments with due dates and grading" },
    { name: "Quiz System", description: "Interactive quizzes with multiple attempts and instant feedback" },
    { name: "Progress Tracking", description: "Monitor learning progress and completion rates" },
    { name: "Payment Integration", description: "Secure payment processing with Razorpay" },
    { name: "Email Notifications", description: "Automated email notifications for assignments and updates" },
    { name: "Category Management", description: "Organize courses by categories and difficulty levels" },
    { name: "Rating & Reviews", description: "Students can rate and review courses" }
  ],
  technologies: {
    frontend: ["React.js", "Tailwind CSS", "Redux Toolkit", "React Router"],
    backend: ["Node.js", "Express.js", "MongoDB", "JWT Authentication"],
    payment: ["Razorpay Integration"],
    email: ["Nodemailer", "Custom Email Templates"],
    ai: ["Google Gemini AI", "Chatbot Integration"],
    storage: ["Cloudinary", "File Upload System"]
  }
};

// Get project information
const getProjectInfo = async (req, res) => {
  try {
    const { section } = req.query;
    
    if (!section) {
      return res.status(200).json({
        success: true,
        message: 'Project information retrieved successfully',
        data: {
          overview: "SkillMart is a comprehensive online learning platform that connects students with instructors for various courses including programming, web development, and more.",
          sections: Object.keys(PROJECT_STRUCTURE),
          totalSections: Object.keys(PROJECT_STRUCTURE).length
        }
      });
    }

    const sectionData = PROJECT_STRUCTURE[section];
    if (!sectionData) {
      return res.status(404).json({
        success: false,
        message: 'Section not found',
        availableSections: Object.keys(PROJECT_STRUCTURE)
      });
    }

    return res.status(200).json({
      success: true,
      message: `${section} information retrieved successfully`,
      data: {
        section,
        content: sectionData
      }
    });

  } catch (error) {
    console.error('Error in getProjectInfo:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve project information',
      error: error.message
    });
  }
};

// Enhanced chatbot with project navigation
const chatWithBotEnhanced = async (req, res) => {
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

    // Enhanced system prompt with project navigation capabilities
    const SYSTEM_PROMPT = `You are SkillMart Study Adviser Bot, a helpful, polite, and knowledgeable assistant designed to help students and instructors navigate the SkillMart platform. Your purpose is to provide useful guidance, answer study-related questions, solve academic problems, and help users navigate the platform.

    ⚡ Behavior Rules

    Always respond in a friendly and encouraging tone.

    Answer study-related questions clearly, simply, and in an easy-to-understand way.

    Focus on study guidance, academic problem-solving, learning techniques, and SkillMart platform navigation.

    Help users understand how to use different features of the platform.

    Provide navigation guidance and explain what each section of the platform does.

    NEVER provide unrelated, inappropriate, or external internet search answers.

    When asked about SkillMart platform features, provide detailed explanations with navigation paths.

    If a question is not related to study or SkillMart platform, politely say:
    "I'm here to help with study questions and SkillMart platform navigation. Please ask related queries."

    📚 Platform Navigation Help

    You can help users with:
    - Dashboard navigation (student vs instructor views)
    - Course creation and management
    - Assignment system usage
    - Quiz functionality
    - Progress tracking
    - Payment and enrollment
    - Profile management
    - Category browsing
    - Feature explanations

    🎯 Examples of Questions You Can Answer

    "How do I create a new course?"
    "Where can I find my assignments?"
    "How does the quiz system work?"
    "What's the difference between student and instructor dashboard?"
    "How do I submit an assignment?"
    "Where can I view my enrolled courses?"
    "How do I manage course categories?"
    "What features are available for instructors?"
    "How do I track my learning progress?"
    "Where can I find course ratings and reviews?"

    🚫 Examples of Questions You Should NOT Answer

    "Tell me a joke."
    "What is the weather today?"
    "Who won the last cricket match?"

    ✅ Goal

    Provide simple, direct, and helpful answers to questions related to study, academic problems, and SkillMart platform navigation and features.`;

    // Get the generative model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Start a chat session with the enhanced system prompt
    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: SYSTEM_PROMPT }]
        },
        {
          role: "model",
          parts: [{ text: "Hello! I'm the SkillMart Study Adviser Bot. I'm here to help you with study questions, academic problems, and SkillMart platform navigation. I can help you understand how to use different features, navigate the dashboard, manage courses, work with assignments, and much more. How can I assist you today?" }]
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
    console.error('Error in chatWithBotEnhanced:', error);
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
  getProjectInfo,
  chatWithBotEnhanced
};
