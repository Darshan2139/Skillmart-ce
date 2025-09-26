const Assignment = require("../models/Assignment");
const AssignmentSubmission = require("../models/AssignmentSubmission");
const Course = require("../models/Course");
const Section = require("../models/Section");
const User = require("../models/User");
const { uploadImageToCloudinary } = require("../utils/imageUploader");
const EmailNotificationService = require("../services/emailNotificationService");
const mongoose = require('mongoose');

// Create Assignment or Quiz
exports.createAssignment = async (req, res) => {
  try {
    console.log("CreateAssignment payload:", req.body);
    console.log("User ID:", req.user?.id);
    console.log("User email:", req.user?.email);
    console.log("Request headers:", req.headers);
    
    const {
      title,
      description,
      type,
      courseId,
      sectionId,
      maxMarks,
      dueDate,
      instructions,
      questions,
      attachments,
    } = req.body;

    // Validate required fields
    if (!title || !description || !type || !courseId || !sectionId || !maxMarks || !dueDate || !instructions) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
      });
    }

    // Validate type
    if (!["Assignment", "Quiz"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Type must be either 'Assignment' or 'Quiz'",
      });
    }

    // For Quiz, validate questions
    if (type === "Quiz" && (!questions || questions.length === 0)) {
      return res.status(400).json({
        success: false,
        message: "Quiz must have at least one question",
      });
    }

    // For Quiz, ensure sum of question marks <= maxMarks
    if (type === "Quiz" && Array.isArray(questions)) {
      // basic per-question validation
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i] || {};
        if (!q.question || !Array.isArray(q.options) || q.options.length < 2) {
          return res.status(400).json({
            success: false,
            message: `Question ${i + 1} must have text and at least 2 options`,
          });
        }
        const answerIndex = parseInt(q.correctAnswer);
        if (Number.isNaN(answerIndex) || answerIndex < 0 || answerIndex >= q.options.length) {
          return res.status(400).json({
            success: false,
            message: `Question ${i + 1} has an invalid correct option index`,
          });
        }
        const markValue = parseInt(q.marks);
        if (Number.isNaN(markValue) || markValue < 1) {
          return res.status(400).json({
            success: false,
            message: `Question ${i + 1} must have marks >= 1`,
          });
        }
      }
      const totalQuizMarks = questions.reduce((sum, q) => sum + (parseInt(q.marks) || 0), 0);
      if (totalQuizMarks > parseInt(maxMarks)) {
        return res.status(400).json({
          success: false,
          message: `Total quiz marks (${totalQuizMarks}) cannot exceed max marks (${maxMarks})`,
        });
      }
    }

    // Verify course exists and user is instructor
    console.log("Looking for course with ID:", courseId);
    console.log("User from token:", req.user);
    const course = await Course.findById(courseId).populate("instructor");
    console.log("Course found:", course ? "Yes" : "No");
    if (course) {
      console.log("Course instructor:", course.instructor?._id);
      console.log("User ID from token:", req.user.id);
      console.log("User email from token:", req.user.email);
    }
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    if (!course.instructor || course.instructor._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Only course instructor can create assignments",
      });
    }

    // Verify section exists
    console.log("Looking for section with ID:", sectionId);
    const section = await Section.findById(sectionId);
    console.log("Section found:", section ? "Yes" : "No");
    
    if (!section) {
      return res.status(404).json({
        success: false,
        message: "Section not found",
      });
    }

    // Ensure the section belongs to the given course
    const sectionBelongsToCourse = await Course.exists({
      _id: courseId,
      courseContent: { $in: [sectionId] },
    });
    if (!sectionBelongsToCourse) {
      return res.status(400).json({
        success: false,
        message: "Section does not belong to the specified course",
      });
    }

    // Create assignment
    const assignmentData = {
      title,
      description,
      type,
      course: courseId,
      section: sectionId,
      maxMarks: parseInt(maxMarks),
      dueDate: new Date(dueDate),
      instructions,
      createdBy: req.user.id,
    };

    if (type === "Quiz") {
      // normalize question marks to numbers and ensure all required fields
      assignmentData.questions = questions.map((q) => ({
        question: q.question || "",
        options: q.options || [],
        correctAnswer: parseInt(q.correctAnswer) || 0,
        marks: parseInt(q.marks) || 1,
      }));
    }

    if (type === "Assignment" && attachments) {
      assignmentData.attachments = attachments;
    }

    console.log("Creating assignment with data:", JSON.stringify(assignmentData, null, 2));
    const assignment = await Assignment.create(assignmentData);
    console.log("Assignment created successfully:", assignment._id);

    // Add assignment to section
    section.assignments = section.assignments || [];
    section.assignments.push(assignment._id);
    console.log("Saving section with assignments:", section.assignments);
    await section.save();
    console.log("Section saved successfully");

    // Populate assignment with course and section details
    const populatedAssignment = await Assignment.findById(assignment._id)
      .populate("course", "courseName")
      .populate("section", "sectionName")
      .populate("createdBy", "firstName lastName");

    // Send email notification to enrolled students
    try {
      await EmailNotificationService.sendNewAssignmentNotification(assignment._id);
      console.log("New assignment notification emails sent successfully");
    } catch (emailError) {
      console.error("Failed to send new assignment notification emails:", emailError);
      // Don't fail the assignment creation if email fails
    }

    res.status(201).json({
      success: true,
      message: `${type} created successfully`,
      data: populatedAssignment,
    });
  } catch (error) {
    console.error("Error creating assignment:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      success: false,
      message: "Failed to create assignment",
      error: error.message,
      stack: error.stack,
    });
  }
};

// Get all assignments for a course
exports.getCourseAssignments = async (req, res) => {
  try {
    const { courseId } = req.params;
    console.log("getCourseAssignments called for course:", courseId);

    const assignments = await Assignment.find({ course: courseId })
      .populate("section", "sectionName")
      .populate("createdBy", "firstName lastName")
      .populate("course", "courseName")
      .sort({ createdAt: -1 });

    console.log("Found assignments for course:", assignments.length);
    console.log("Assignments:", assignments.map(a => ({ 
      id: a._id, 
      title: a.title, 
      type: a.type, 
      course: a.course?.courseName,
      questions: a.questions?.length || 0
    })));
    
    // Log detailed question data for quizzes
    assignments.forEach(assignment => {
      if (assignment.type === "Quiz") {
        console.log(`Quiz "${assignment.title}" questions:`, assignment.questions);
      }
    });

    res.status(200).json({
      success: true,
      data: assignments,
    });
  } catch (error) {
    console.error("Error fetching course assignments:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch assignments",
      error: error.message,
    });
  }
};

// Get assignments for student's enrolled courses only
exports.getStudentAssignments = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log("getStudentAssignments called for user:", userId);
    
    // First get all courses the student is enrolled in
    const user = await User.findById(userId).populate('courses');
    if (!user) {
      console.log("User not found:", userId);
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    console.log("User found, enrolled courses:", user.courses.length);
    console.log("Enrolled course IDs:", user.courses.map(course => course._id));

    const enrolledCourseIds = user.courses.map(course => course._id);
    
    if (enrolledCourseIds.length === 0) {
      console.log("No enrolled courses found for user:", userId);
      return res.status(200).json({
        success: true,
        data: [],
        message: "No enrolled courses found",
      });
    }

    // Get assignments only for enrolled courses
    const assignments = await Assignment.find({ 
      course: { $in: enrolledCourseIds } 
    })
      .populate("section", "sectionName")
      .populate("createdBy", "firstName lastName")
      .populate("course", "courseName")
      .sort({ createdAt: -1 });

    console.log("Found assignments for enrolled courses:", assignments.length);

    // Add submission status for each assignment
    const assignmentsWithStatus = await Promise.all(
      assignments.map(async (assignment) => {
        const submissions = await AssignmentSubmission.find({
          assignment: assignment._id,
          student: userId,
        }).sort({ submittedAt: -1 });

        const hasGradedSubmission = submissions.some(sub => sub.isGraded && sub.gradedBy);
        const submissionCount = submissions.length;
        const latestSubmission = submissions[0];

        // For quizzes, include all attempts with scores
        const allAttempts = submissions.map(sub => ({
          attemptNumber: sub.attemptNumber,
          score: sub.score,
          maxScore: sub.maxScore,
          isGraded: sub.isGraded,
          gradedBy: sub.gradedBy,
          submittedAt: sub.submittedAt
        }));

        return {
          ...assignment.toObject(),
          submissionStatus: {
            hasGradedSubmission,
            submissionCount,
            latestSubmission: latestSubmission ? {
              score: latestSubmission.score,
              maxScore: latestSubmission.maxScore,
              isGraded: latestSubmission.isGraded,
              gradedBy: latestSubmission.gradedBy,
              submittedAt: latestSubmission.submittedAt
            } : null,
            // Include all attempts for quizzes
            allAttempts: assignment.type === "Quiz" ? allAttempts : null
          }
        };
      })
    );

    console.log("Assignments with status:", assignmentsWithStatus.map(a => ({ 
      id: a._id, 
      title: a.title, 
      type: a.type, 
      course: a.course?.courseName,
      hasGradedSubmission: a.submissionStatus.hasGradedSubmission,
      submissionCount: a.submissionStatus.submissionCount
    })));

    res.status(200).json({
      success: true,
      data: assignmentsWithStatus,
    });
  } catch (error) {
    console.error("Error fetching student assignments:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch assignments",
      error: error.message,
    });
  }
};

// Get all assignments for an instructor
exports.getInstructorAssignments = async (req, res) => {
  try {
    console.log("getInstructorAssignments called, req.user:", req.user);
    
    if (!req.user || !req.user.id) {
      console.log("User not authenticated or missing ID");
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    console.log("Searching for assignments with createdBy:", req.user.id);
    console.log("User ID type:", typeof req.user.id);
    
    // Use the user ID directly - Mongoose will handle ObjectId conversion
    const userId = req.user.id;
    
    // First, let's verify the user exists and is an instructor
    const user = await User.findById(userId);
    if (!user) {
      console.log("User not found in database");
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.accountType !== "Instructor") {
      console.log("User is not an instructor");
      return res.status(403).json({
        success: false,
        message: "Access denied. Instructor role required.",
      });
    }
    
    const assignments = await Assignment.find({ createdBy: userId })
      .populate("section", "sectionName")
      .populate("course", "courseName")
      .populate("createdBy", "firstName lastName")
      .sort({ createdAt: -1 });

    console.log("Found assignments:", assignments.length);
    console.log("Assignments:", assignments.map(a => ({ id: a._id, title: a.title, type: a.type })));
    
    res.status(200).json({
      success: true,
      data: assignments,
    });
  } catch (error) {
    console.error("Error fetching instructor assignments:", error);
    console.error("Error details:", error.stack);
    res.status(500).json({
      success: false,
      message: "Failed to fetch assignments",
      error: error.message,
    });
  }
};

// Test endpoint to check all assignments in database
exports.getAllAssignments = async (req, res) => {
  try {
    console.log("getAllAssignments called - checking all assignments in database");
    
    const allAssignments = await Assignment.find({})
      .populate("course", "courseName")
      .populate("section", "sectionName")
      .populate("createdBy", "firstName lastName");

    console.log("Total assignments in database:", allAssignments.length);
    console.log("All assignments:", allAssignments.map(a => ({ 
      id: a._id, 
      title: a.title, 
      type: a.type, 
      course: a.course?.courseName,
      section: a.section?.sectionName
    })));

    res.status(200).json({
      success: true,
      data: allAssignments,
      count: allAssignments.length
    });
  } catch (error) {
    console.error("Error fetching all assignments:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch assignments",
      error: error.message,
    });
  }
};

// Test endpoint to create a sample assignment
exports.createTestAssignment = async (req, res) => {
  try {
    console.log("createTestAssignment called");
    
    // Find the first course and section to create a test assignment
    const Course = require("../models/Course");
    const Section = require("../models/Section");
    
    const course = await Course.findOne({}).populate('courseContent');
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "No courses found to create test assignment",
      });
    }
    
    const section = await Section.findOne({ course: course._id });
    if (!section) {
      return res.status(404).json({
        success: false,
        message: "No sections found to create test assignment",
      });
    }
    
    // Create a test assignment
    const testAssignment = await Assignment.create({
      title: "Test Quiz - Sample Questions",
      description: "This is a test quiz to verify assignment functionality",
      type: "Quiz",
      course: course._id,
      section: section._id,
      maxMarks: 100,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      instructions: "Answer all questions carefully",
      questions: [
        {
          question: "What is the capital of India?",
          options: ["Mumbai", "Delhi", "Bangalore", "Chennai"],
          correctAnswer: 1,
          marks: 25
        },
        {
          question: "Which programming language is this project built with?",
          options: ["Python", "JavaScript", "Java", "C++"],
          correctAnswer: 1,
          marks: 25
        }
      ],
      createdBy: req.user.id
    });
    
    // Add assignment to section
    section.assignments = section.assignments || [];
    section.assignments.push(testAssignment._id);
    await section.save();
    
    console.log("Test assignment created:", testAssignment._id);
    
    res.status(201).json({
      success: true,
      message: "Test assignment created successfully",
      data: testAssignment,
    });
  } catch (error) {
    console.error("Error creating test assignment:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create test assignment",
      error: error.message,
    });
  }
};

// Get single assignment
exports.getAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;

    const assignment = await Assignment.findById(assignmentId)
      .populate("course", "courseName")
      .populate("section", "sectionName")
      .populate("createdBy", "firstName lastName");

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    res.status(200).json({
      success: true,
      data: assignment,
    });
  } catch (error) {
    console.error("Error fetching assignment:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch assignment",
      error: error.message,
    });
  }
};

// Update assignment
exports.updateAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const updateData = req.body;

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    // Check if user is the creator
    if (assignment.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Only assignment creator can update it",
      });
    }

    // Update assignment
    const updatedAssignment = await Assignment.findByIdAndUpdate(
      assignmentId,
      updateData,
      { new: true, runValidators: true }
    )
      .populate("course", "courseName")
      .populate("section", "sectionName")
      .populate("createdBy", "firstName lastName");

    res.status(200).json({
      success: true,
      message: "Assignment updated successfully",
      data: updatedAssignment,
    });
  } catch (error) {
    console.error("Error updating assignment:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update assignment",
      error: error.message,
    });
  }
};

// Delete assignment
exports.deleteAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    // Check if user is the creator
    if (assignment.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Only assignment creator can delete it",
      });
    }

    // Delete all submissions for this assignment
    await AssignmentSubmission.deleteMany({ assignment: assignmentId });

    // Remove assignment from section
    await Section.findByIdAndUpdate(assignment.section, {
      $pull: { assignments: assignmentId },
    });

    // Delete assignment
    await Assignment.findByIdAndDelete(assignmentId);

    res.status(200).json({
      success: true,
      message: "Assignment deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting assignment:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete assignment",
      error: error.message,
    });
  }
};

// Submit assignment/quiz
exports.submitAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { answers, submissionText, attachments } = req.body;

    console.log("Submit assignment request:", {
      assignmentId,
      answers,
      submissionText,
      attachments,
      userId: req.user.id,
      userEmail: req.user.email,
      accountType: req.user.accountType
    });

    // Validate assignmentId format
    if (!assignmentId || !mongoose.Types.ObjectId.isValid(assignmentId)) {
      console.log("Invalid assignment ID:", assignmentId);
      return res.status(400).json({
        success: false,
        message: "Invalid assignment ID format",
      });
    }

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    console.log("Found assignment:", {
      id: assignment._id,
      title: assignment.title,
      type: assignment.type,
      questions: assignment.questions,
      course: assignment.course
    });

    // Check if student is enrolled in the course (guard against undefined arrays)
    const course = await Course.findById(assignment.course);
    const isEnrolled = course && Array.isArray(course.studentsEnroled)
      ? course.studentsEnroled.some((id) => id.toString() === req.user.id)
      : false;
    if (!isEnrolled) {
      return res.status(403).json({
        success: false,
        message: "You must be enrolled in the course to submit assignments",
      });
    }

    // Check if due date has passed
    if (new Date() > new Date(assignment.dueDate)) {
      return res.status(400).json({
        success: false,
        message: "Assignment submission deadline has passed",
      });
    }

    // Check previous attempts
    const existingSubmissions = await AssignmentSubmission.find({
      assignment: assignmentId,
      student: req.user.id,
    }).sort({ attemptNumber: -1 });

    console.log("Existing submissions found:", existingSubmissions.length);
    console.log("Submissions:", existingSubmissions.map(s => ({ id: s._id, attemptNumber: s.attemptNumber })));

    if (existingSubmissions.length >= 3) {
      console.log("BLOCKING: Too many attempts");
      return res.status(400).json({
        success: false,
        message: "Maximum 3 attempts allowed for this assignment",
      });
    }

    // Check if any submission has been graded by instructor
    const gradedSubmission = existingSubmissions.find(sub => sub.isGraded && sub.gradedBy);
    
    if (gradedSubmission) {
      console.log("BLOCKING: Assignment already graded by instructor");
      return res.status(400).json({
        success: false,
        message: "This assignment has already been graded by your instructor. No further attempts allowed.",
      });
    }

    // For Quiz: Enforce re-attempt only if the student has not yet passed
    // Define passing threshold as 50% of max marks (adjust as needed)
    if (assignment.type === "Quiz") {
      const passThreshold = Math.ceil((assignment.maxMarks || 0) * 0.5);
      const bestPrevScore = existingSubmissions.reduce((max, s) => Math.max(max, s.score || 0), 0);

      if (bestPrevScore >= passThreshold) {
        console.log("BLOCKING: Student already passed quiz with score:", bestPrevScore, "threshold:", passThreshold);
        return res.status(400).json({
          success: false,
          message: `You have already passed this quiz (score ${bestPrevScore}/${assignment.maxMarks}). No further attempts allowed`,
        });
      }
    }
    
    console.log("ALLOWING: Attempts within limit and not yet passed");

    const attemptNumber = existingSubmissions.length + 1;

    // For Quiz, calculate score automatically
    let score = 0;
    let processedAnswers = [];

    if (assignment.type === "Quiz") {
      console.log("Processing quiz answers:", answers);
      console.log("Assignment questions for processing:", assignment.questions);
      
      for (const answer of answers) {
        console.log("Processing answer:", answer);
        console.log("Looking for questionId:", answer.questionId);
        console.log("Available questions:", assignment.questions.map((q, i) => ({ index: i, _id: q._id, title: q.question })));
        
        // Try to find question by _id first, then by index
        let question = assignment.questions.id(answer.questionId);
        if (!question) {
          // Fallback: try to find by index if questionId is a number
          const questionIndex = parseInt(answer.questionId);
          console.log("Trying to find by index:", questionIndex);
          if (!isNaN(questionIndex) && questionIndex >= 0 && questionIndex < assignment.questions.length) {
            question = assignment.questions[questionIndex];
            console.log("Found question by index:", question);
          }
        } else {
          console.log("Found question by _id:", question);
        }
        
        if (question) {
          const isCorrect = answer.selectedOption === question.correctAnswer;
          processedAnswers.push({
            questionId: answer.questionId,
            selectedOption: answer.selectedOption,
            isCorrect,
          });
          if (isCorrect) {
            score += question.marks;
          }
        } else {
          console.log("Question not found for ID:", answer.questionId);
          console.log("Available question IDs:", assignment.questions.map((q, i) => ({ index: i, _id: q._id })));
        }
      }
      
      console.log("Processed answers:", processedAnswers);
      console.log("Final score:", score);
    }

    // Create submission
    const submissionData = {
      assignment: assignmentId,
      student: req.user.id,
      course: assignment.course,
      attemptNumber,
      maxScore: assignment.maxMarks,
      score,
      isGraded: assignment.type === "Quiz", // Quiz is auto-graded
    };

    if (assignment.type === "Quiz") {
      submissionData.answers = processedAnswers;
    } else {
      // Validate attachments: only PDF or TXT
      const safeAttachments = Array.isArray(attachments) ? attachments.filter((att) => {
        if (!att || !att.fileUrl || !att.fileName) return false
        const lower = att.fileName.toLowerCase()
        return lower.endsWith('.pdf') || lower.endsWith('.txt')
      }) : []
      submissionData.submissionText = submissionText;
      submissionData.attachments = safeAttachments;
    }

    const submission = await AssignmentSubmission.create(submissionData);

    // Populate submission data
    const populatedSubmission = await AssignmentSubmission.findById(submission._id)
      .populate("assignment", "title type maxMarks")
      .populate("student", "firstName lastName")
      .populate("course", "courseName");

    // Send email notification to student
    try {
      await EmailNotificationService.sendAssignmentSubmissionConfirmation(submission._id);
      console.log("Assignment submission confirmation email sent successfully");
    } catch (emailError) {
      console.error("Failed to send submission confirmation email:", emailError);
      // Don't fail the submission if email fails
    }

    res.status(201).json({
      success: true,
      message: "Assignment submitted successfully",
      data: populatedSubmission,
    });
  } catch (error) {
    console.error("Error submitting assignment:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit assignment",
      error: error.message,
    });
  }
};

// Get student submissions for an assignment
exports.getStudentSubmissions = async (req, res) => {
  try {
    const { assignmentId } = req.params;

    const submissions = await AssignmentSubmission.find({
      assignment: assignmentId,
      student: req.user.id,
    })
      .populate("assignment", "title type maxMarks")
      .sort({ attemptNumber: 1 });

    res.status(200).json({
      success: true,
      data: submissions,
    });
  } catch (error) {
    console.error("Error fetching student submissions:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch submissions",
      error: error.message,
    });
  }
};

// Get all submissions for an assignment (instructor view)
exports.getAllSubmissions = async (req, res) => {
  try {
    const { assignmentId } = req.params;

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    // Check if user is the instructor
    if (assignment.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Only assignment creator can view all submissions",
      });
    }

    const submissions = await AssignmentSubmission.find({
      assignment: assignmentId,
    })
      .populate("student", "firstName lastName email")
      .sort({ submittedAt: -1 });

    console.log("Found submissions:", submissions.length);
    console.log("Sample submission:", submissions[0] ? {
      id: submissions[0]._id,
      student: submissions[0].student,
      attachments: submissions[0].attachments,
      submissionText: submissions[0].submissionText
    } : "No submissions");

    res.status(200).json({
      success: true,
      data: submissions,
    });
  } catch (error) {
    console.error("Error fetching all submissions:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch submissions",
      error: error.message,
    });
  }
};

// Grade assignment (for manual grading)
exports.gradeAssignment = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { score, feedback } = req.body;

    const submission = await AssignmentSubmission.findById(submissionId)
      .populate("assignment");

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Submission not found",
      });
    }

    // Check if user is the instructor
    if (submission.assignment.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Only assignment creator can grade submissions",
      });
    }

    // Update submission
    submission.score = score;
    submission.feedback = feedback;
    submission.isGraded = true;
    submission.gradedBy = req.user.id;
    submission.gradedAt = new Date();
    await submission.save();

    // Send email notification to student
    try {
      const instructor = await User.findById(req.user.id);
      const instructorName = instructor ? `${instructor.firstName} ${instructor.lastName}` : 'Instructor';
      
      await EmailNotificationService.sendAssignmentGradedNotification(
        submission._id,
        score,
        feedback,
        instructorName
      );
      console.log("Graded notification email sent successfully");
    } catch (emailError) {
      console.error("Failed to send graded notification email:", emailError);
      // Don't fail the grading if email fails
    }

    res.status(200).json({
      success: true,
      message: "Assignment graded successfully",
      data: submission,
    });
  } catch (error) {
    console.error("Error grading assignment:", error);
    res.status(500).json({
      success: false,
      message: "Failed to grade assignment",
      error: error.message,
    });
  }
};
