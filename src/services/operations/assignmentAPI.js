import { apiConnector } from "../apiconnector";
import { assignmentEndpoints } from "../apis";

const {
  CREATE_ASSIGNMENT_API,
  GET_INSTRUCTOR_ASSIGNMENTS_API,
  GET_COURSE_ASSIGNMENTS_API,
  GET_STUDENT_ASSIGNMENTS_API,
  GET_ASSIGNMENT_API,
  UPDATE_ASSIGNMENT_API,
  DELETE_ASSIGNMENT_API,
  SUBMIT_ASSIGNMENT_API,
  GET_STUDENT_SUBMISSIONS_API,
  GET_ALL_SUBMISSIONS_API,
  GRADE_ASSIGNMENT_API,
} = assignmentEndpoints;

// Create Assignment or Quiz
export const createAssignment = async (data, token) => {
  try {
    const response = await apiConnector("POST", CREATE_ASSIGNMENT_API, data, {
      Authorization: `Bearer ${token}`,
    });
    // Return server JSON for consistency with callers checking .success and .data
    return response?.data;
  } catch (error) {
    console.error("CREATE_ASSIGNMENT_API ERROR:", error);
    throw error;
  }
};

// Get all assignments for an instructor
export const getInstructorAssignments = async (token) => {
  try {
    // Check if token exists
    if (!token) {
      console.error("No token provided for getInstructorAssignments");
      throw new Error("Authentication token is required");
    }

    const response = await apiConnector(
      "GET",
      GET_INSTRUCTOR_ASSIGNMENTS_API,
      null,
      {
        Authorization: `Bearer ${token}`,
      }
    );
    return response?.data;
  } catch (error) {
    console.error("GET_INSTRUCTOR_ASSIGNMENTS_API ERROR:", error);
    throw error;
  }
};

// Get all assignments for a course
export const getCourseAssignments = async (courseId, token) => {
  try {
    const response = await apiConnector(
      "GET",
      GET_COURSE_ASSIGNMENTS_API.replace(":courseId", courseId),
      null,
      {
        Authorization: `Bearer ${token}`,
      }
    );
    return response?.data;
  } catch (error) {
    console.error("GET_COURSE_ASSIGNMENTS_API ERROR:", error);
    throw error;
  }
};

// Get assignments for student's enrolled courses only
export const getStudentAssignments = async (token) => {
  try {
    const response = await apiConnector(
      "GET",
      GET_STUDENT_ASSIGNMENTS_API,
      null,
      {
        Authorization: `Bearer ${token}`,
      }
    );
    return response?.data;
  } catch (error) {
    console.error("GET_STUDENT_ASSIGNMENTS_API ERROR:", error);
    throw error;
  }
};

// Get single assignment
export const getAssignment = async (assignmentId, token) => {
  try {
    const response = await apiConnector(
      "GET",
      GET_ASSIGNMENT_API.replace(":assignmentId", assignmentId),
      null,
      {
        Authorization: `Bearer ${token}`,
      }
    );
    return response?.data;
  } catch (error) {
    console.error("GET_ASSIGNMENT_API ERROR:", error);
    throw error;
  }
};

// Update assignment
export const updateAssignment = async (assignmentId, data, token) => {
  try {
    const response = await apiConnector(
      "PUT",
      UPDATE_ASSIGNMENT_API.replace(":assignmentId", assignmentId),
      data,
      {
        Authorization: `Bearer ${token}`,
      }
    );
    return response?.data;
  } catch (error) {
    console.error("UPDATE_ASSIGNMENT_API ERROR:", error);
    throw error;
  }
};

// Delete assignment
export const deleteAssignment = async (assignmentId, token) => {
  try {
    const response = await apiConnector(
      "DELETE",
      DELETE_ASSIGNMENT_API.replace(":assignmentId", assignmentId),
      null,
      {
        Authorization: `Bearer ${token}`,
      }
    );
    return response?.data;
  } catch (error) {
    console.error("DELETE_ASSIGNMENT_API ERROR:", error);
    throw error;
  }
};

// Submit assignment/quiz
export const submitAssignment = async (assignmentId, data, token) => {
  try {
    const response = await apiConnector(
      "POST",
      SUBMIT_ASSIGNMENT_API.replace(":assignmentId", assignmentId),
      data,
      {
        Authorization: `Bearer ${token}`,
      }
    );
    return response?.data;
  } catch (error) {
    console.error("SUBMIT_ASSIGNMENT_API ERROR:", error);
    throw error;
  }
};

// Get student submissions for an assignment
export const getStudentSubmissions = async (assignmentId, token) => {
  try {
    const response = await apiConnector(
      "GET",
      GET_STUDENT_SUBMISSIONS_API.replace(":assignmentId", assignmentId),
      null,
      {
        Authorization: `Bearer ${token}`,
      }
    );
    return response?.data;
  } catch (error) {
    console.error("GET_STUDENT_SUBMISSIONS_API ERROR:", error);
    throw error;
  }
};

// Get all submissions for an assignment (instructor view)
export const getAllSubmissions = async (assignmentId, token) => {
  try {
    const response = await apiConnector(
      "GET",
      GET_ALL_SUBMISSIONS_API.replace(":assignmentId", assignmentId),
      null,
      {
        Authorization: `Bearer ${token}`,
      }
    );
    return response?.data;
  } catch (error) {
    console.error("GET_ALL_SUBMISSIONS_API ERROR:", error);
    throw error;
  }
};

// Grade assignment
export const gradeAssignment = async (submissionId, data, token) => {
  try {
    const response = await apiConnector(
      "POST",
      GRADE_ASSIGNMENT_API.replace(":submissionId", submissionId),
      data,
      {
        Authorization: `Bearer ${token}`,
      }
    );
    return response?.data;
  } catch (error) {
    console.error("GRADE_ASSIGNMENT_API ERROR:", error);
    throw error;
  }
};