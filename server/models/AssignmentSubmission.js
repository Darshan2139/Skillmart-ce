const mongoose = require("mongoose");

const assignmentSubmissionSchema = new mongoose.Schema({
  assignment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Assignment",
    required: true,
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user", // Align with model name in User.js
    required: true,
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  attemptNumber: {
    type: Number,
    required: true,
    min: 1,
    max: 3,
  },
  // For Quiz submissions
  answers: [
    {
      questionId: {
        type: String, // Changed from ObjectId to String to handle both _id and index-based IDs
        required: true,
      },
      selectedOption: {
        type: Number, // Index of selected option
        required: true,
      },
      isCorrect: {
        type: Boolean,
        default: false,
      },
    },
  ],
  // For Assignment submissions
  submissionText: {
    type: String,
    required: false,
  },
  attachments: [
    {
      fileName: String,
      fileUrl: String,
    },
  ],
  score: {
    type: Number,
    default: 0,
    min: 0,
  },
  maxScore: {
    type: Number,
    required: true,
  },
  isGraded: {
    type: Boolean,
    default: false,
  },
  gradedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  feedback: {
    type: String,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
  gradedAt: {
    type: Date,
  },
});

// Index for efficient queries
assignmentSubmissionSchema.index({ assignment: 1, student: 1 });
assignmentSubmissionSchema.index({ student: 1, course: 1 });

module.exports = mongoose.model("AssignmentSubmission", assignmentSubmissionSchema);
