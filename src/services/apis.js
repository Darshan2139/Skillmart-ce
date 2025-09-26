// Base API URL defaults to Render deployment but can be overridden via environment variable
const BASE_URL = (process.env.REACT_APP_API_BASE_URL || "https://skillmart-server.onrender.com/api/v1").replace(/\/$/, "")

// AUTH ENDPOINTS
export const endpoints = {
  SENDOTP_API: BASE_URL + "/auth/sendotp",
  SIGNUP_API: BASE_URL + "/auth/signup",
  LOGIN_API: BASE_URL + "/auth/login",
  RESETPASSTOKEN_API: BASE_URL + "/auth/reset-password-token",
  RESETPASSWORD_API: BASE_URL + "/auth/reset-password",
}

// PROFILE ENDPOINTS
export const profileEndpoints = {
  GET_USER_DETAILS_API: BASE_URL + "/profile/getUserDetails",
  GET_USER_ENROLLED_COURSES_API: BASE_URL + "/profile/getEnrolledCourses",
  GET_INSTRUCTOR_DATA_API: BASE_URL + "/profile/instructorDashboard",
}

// STUDENTS ENDPOINTS
export const studentEndpoints = {
  COURSE_PAYMENT_API: BASE_URL + "/payment/capturePayment",
  COURSE_VERIFY_API: BASE_URL + "/payment/verifyPayment",
  SEND_PAYMENT_SUCCESS_EMAIL_API: BASE_URL + "/payment/sendPaymentSuccessEmail",
}

// COURSE ENDPOINTS
export const courseEndpoints = {
  GET_ALL_COURSE_API: BASE_URL + "/course/getAllCourses",
  COURSE_DETAILS_API: BASE_URL + "/course/getCourseDetails",
  EDIT_COURSE_API: BASE_URL + "/course/editCourse",
  COURSE_CATEGORIES_API: BASE_URL + "/course/showAllCategories",
  CREATE_COURSE_API: BASE_URL + "/course/createCourse",
  CREATE_SECTION_API: BASE_URL + "/course/addSection",
  CREATE_SUBSECTION_API: BASE_URL + "/course/addSubSection",
  UPDATE_SECTION_API: BASE_URL + "/course/updateSection",
  UPDATE_SUBSECTION_API: BASE_URL + "/course/updateSubSection",
  GET_ALL_INSTRUCTOR_COURSES_API: BASE_URL + "/course/getInstructorCourses",
  DELETE_SECTION_API: BASE_URL + "/course/deleteSection",
  DELETE_SUBSECTION_API: BASE_URL + "/course/deleteSubSection",
  DELETE_COURSE_API: BASE_URL + "/course/deleteCourse",
  GET_FULL_COURSE_DETAILS_AUTHENTICATED:
    BASE_URL + "/course/getFullCourseDetails",
  LECTURE_COMPLETION_API: BASE_URL + "/course/updateCourseProgress",
}

// RATINGS AND REVIEWS
export const ratingsEndpoints = {
  REVIEWS_DETAILS_API: BASE_URL + "/rating/getReviews",
  GET_AVERAGE_RATING_API: BASE_URL + "/rating/getAverageRating",
  CREATE_RATING_API: BASE_URL + "/rating/createRating",
}

// CATAGORIES API
export const categories = {
  CATEGORIES_API: BASE_URL + "/course/showAllCategories",
  CREATE_CATEGORY_API: BASE_URL + "/course/createCategory",
  GET_USER_CATEGORIES_API: BASE_URL + "/course/getUserCategories",
  UPDATE_CATEGORY_API: BASE_URL + "/course/updateCategory/:categoryId",
  DELETE_CATEGORY_API: BASE_URL + "/course/deleteCategory/:categoryId",
}

// CATALOG PAGE DATA
export const catalogData = {
  CATALOGPAGEDATA_API: BASE_URL + "/course/getCategoryPageDetails",
}
// CONTACT-US API
export const contactusEndpoint = {
  CONTACT_US_API: BASE_URL + "/reach/contact",
}

// SETTINGS PAGE API
export const settingsEndpoints = {
  UPDATE_DISPLAY_PICTURE_API: BASE_URL + "/profile/updateDisplayPicture",
  UPDATE_PROFILE_API: BASE_URL + "/profile/updateProfile",
  CHANGE_PASSWORD_API: BASE_URL + "/auth/changepassword",
  DELETE_PROFILE_API: BASE_URL + "/profile/deleteProfile",
}

// ASSIGNMENT ENDPOINTS
export const assignmentEndpoints = {
  CREATE_ASSIGNMENT_API: BASE_URL + "/assignment/create",
  GET_INSTRUCTOR_ASSIGNMENTS_API: BASE_URL + "/assignment/instructor",
  GET_COURSE_ASSIGNMENTS_API: BASE_URL + "/assignment/course/:courseId",
  GET_STUDENT_ASSIGNMENTS_API: BASE_URL + "/assignment/student/enrolled",
  GET_ASSIGNMENT_API: BASE_URL + "/assignment/:assignmentId",
  UPDATE_ASSIGNMENT_API: BASE_URL + "/assignment/:assignmentId",
  DELETE_ASSIGNMENT_API: BASE_URL + "/assignment/:assignmentId",
  SUBMIT_ASSIGNMENT_API: BASE_URL + "/assignment/:assignmentId/submit",
  GET_STUDENT_SUBMISSIONS_API: BASE_URL + "/assignment/:assignmentId/submissions",
  GET_ALL_SUBMISSIONS_API: BASE_URL + "/assignment/:assignmentId/all-submissions",
  GRADE_ASSIGNMENT_API: BASE_URL + "/assignment/submission/:submissionId/grade",
}

// CHATBOT ENDPOINTS
export const chatbotEndpoints = {
  CHAT_API: BASE_URL + "/chatbot/chat",
}

// PROJECT INFO ENDPOINTS
export const projectInfoEndpoints = {
  PROJECT_INFO: BASE_URL + "/project/info",
  ENHANCED_CHAT: BASE_URL + "/project/chat",
}

export default BASE_URL