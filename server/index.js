const express = require("express");
const app = express();

const userRoutes = require("./routes/User");
const profileRoutes = require("./routes/Profile");
const paymentRoutes = require("./routes/Payments");
const courseRoutes = require("./routes/Course");
const ratingRoutes = require("./routes/Rating");
const contactUsRoute = require("./routes/Contact");
const assignmentRoutes = require("./routes/Assignment");
const chatbotRoutes = require("./routes/Chatbot");
const projectInfoRoutes = require("./routes/ProjectInfo");
const database = require("./config/database");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const {cloudinaryConnect } = require("./config/cloudinary");
const fileUpload = require("express-fileupload");
const dotenv = require("dotenv");

dotenv.config();
const PORT = process.env.PORT || 4000;

//database connect
database.connect();
//middlewares
app.use(express.json());
app.use(cookieParser());
const allowedOrigins = process.env.CORS_ORIGIN
	? process.env.CORS_ORIGIN.split(",")
	: [
		"http://localhost:3000",
		"http://localhost:3001",
		"https://skillmart-client.onrender.com",
	];

app.use(
	cors({
		origin: allowedOrigins,
		credentials: true,
	})
)

app.use(
	fileUpload({
		useTempFiles:true,
		tempFileDir:"/tmp",
	})
)
//cloudinary connection
cloudinaryConnect();

//routes
app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/course", courseRoutes);
app.use("/api/v1/rating", ratingRoutes);
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/reach", contactUsRoute);
app.use("/api/v1/assignment", assignmentRoutes);
app.use("/api/v1/chatbot", chatbotRoutes);
app.use("/api/v1/project", projectInfoRoutes);

//def route

app.get("/", (req, res) => {
	return res.json({
		success:true,
		message:'Your server is up and running....'
	});
});

// Test endpoint to check environment variables
app.get("/test-env", (req, res) => {
	return res.json({
		success: true,
		hasJwtSecret: !!process.env.JWT_SECRET,
		hasMongoUrl: !!process.env.MONGODB_URL,
        hasGeminiApiKey: !!process.env.GEMINI_API_KEY,
		message: 'Environment check'
	});
});

// Start email notification scheduler
const EmailNotificationService = require('./services/emailNotificationService');

// Manual trigger for due date reminders (for testing)
app.post("/admin/send-due-reminders", async (req, res) => {
	try {
		await EmailNotificationService.sendDueDateReminders();
		res.json({
			success: true,
			message: 'Due date reminders sent successfully'
		});
	} catch (error) {
		console.error('Error sending due date reminders:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to send due date reminders',
			error: error.message
		});
	}
});

// Manual trigger for pending reminders (for testing)
app.post("/admin/send-pending-reminders", async (req, res) => {
	try {
		await EmailNotificationService.sendPendingReminders();
		res.json({
			success: true,
			message: 'Pending assignment reminders sent successfully'
		});
	} catch (error) {
		console.error('Error sending pending reminders:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to send pending reminders',
			error: error.message
		});
	}
});

// Manual trigger for graded notification (for testing)
app.post("/admin/send-graded-notification", async (req, res) => {
	try {
		const { submissionId, grade, feedback, instructorName } = req.body;
		
		if (!submissionId || grade === undefined) {
			return res.status(400).json({
				success: false,
				message: 'submissionId and grade are required'
			});
		}
		
		await EmailNotificationService.sendAssignmentGradedNotification(
			submissionId,
			grade,
			feedback || 'Great work!',
			instructorName || 'Test Instructor'
		);
		
		res.json({
			success: true,
			message: 'Graded notification sent successfully'
		});
	} catch (error) {
		console.error('Error sending graded notification:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to send graded notification',
			error: error.message
		});
	}
});

app.listen(PORT, () => {
	console.log(`App is running at ${PORT}`)
	
	// Start email notification scheduler
	EmailNotificationService.scheduleAllReminders();
})

