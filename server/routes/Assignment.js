const express = require("express");
const {
  createAssignment,
  getCourseAssignments,
  getStudentAssignments,
  getInstructorAssignments,
  getAllAssignments,
  createTestAssignment,
  getAssignment,
  updateAssignment,
  deleteAssignment,
  submitAssignment,
  getStudentSubmissions,
  getAllSubmissions,
  gradeAssignment,
} = require("../controllers/Assignment");
const { auth, isInstructor, isStudent } = require("../middlewares/auth");

const router = express.Router();

// Create assignment (instructor only)
router.post("/create", auth, isInstructor, createAssignment);

// Get all assignments for an instructor
router.get("/instructor", auth, isInstructor, getInstructorAssignments);

// Get all assignments for a course
router.get("/course/:courseId", auth, getCourseAssignments);

// Get assignments for student's enrolled courses only
router.get("/student/enrolled", auth, isStudent, getStudentAssignments);

// Test endpoint to check all assignments
router.get("/all", auth, getAllAssignments);

// Test endpoint to create a sample assignment
router.post("/create-test", auth, createTestAssignment);

// Get single assignment
router.get("/:assignmentId", auth, getAssignment);

// Update assignment (instructor only)
router.put("/:assignmentId", auth, isInstructor, updateAssignment);

// Delete assignment (instructor only)
router.delete("/:assignmentId", auth, isInstructor, deleteAssignment);

// Submit assignment/quiz (student only)
router.post("/:assignmentId/submit", auth, isStudent, submitAssignment);

// Get student's submissions for an assignment
router.get("/:assignmentId/submissions", auth, getStudentSubmissions);

// Get all submissions for an assignment (instructor only)
router.get("/:assignmentId/all-submissions", auth, isInstructor, getAllSubmissions);

// Grade assignment (instructor only)
router.post("/submission/:submissionId/grade", auth, isInstructor, gradeAssignment);

module.exports = router;
