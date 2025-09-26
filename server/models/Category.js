const mongoose = require("mongoose");

// Define the Tags schema
const categorySchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
	},
	description: { type: String },
	createdBy: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: true,
	},
	isSystemCategory: {
		type: Boolean,
		default: false,
	},
	courses: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Course",
		},
	],
	createdAt: {
		type: Date,
		default: Date.now,
	},
});

// Export the Tags model
module.exports = mongoose.model("Category", categorySchema);