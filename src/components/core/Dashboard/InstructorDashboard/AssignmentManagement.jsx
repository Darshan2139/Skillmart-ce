import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";

import { getCourseAssignments, getInstructorAssignments, getAllSubmissions } from "../../../../services/operations/assignmentAPI";
import { fetchInstructorCourses } from "../../../../services/operations/courseDetailsAPI";
import AssignmentManagementCard from "./AssignmentManagementCard";
import GradingModal from "./GradingModal";

export default function AssignmentManagement() {
  const { courseId } = useParams();
  const { token } = useSelector((state) => state.auth);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [gradingModal, setGradingModal] = useState(false);
  const [filter, setFilter] = useState("ALL"); // ALL | ASSIGNMENT | QUIZ

  useEffect(() => {
    fetchAssignments();
  }, [courseId]);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      // Check if token exists
      if (!token) {
        toast.error("Authentication required. Please log in again.");
        return;
      }

      if (!courseId) {
        const res = await getInstructorAssignments(token);
        if (res?.success) setAssignments(res.data || []);
        else toast.error(res?.message || "Failed to fetch assignments");
      } else {
        const res = await getCourseAssignments(courseId, token);
        if (res?.success) setAssignments(res.data || []);
        else toast.error(res?.message || "Failed to fetch assignments");
      }
    } catch (error) {
      toast.error("Failed to fetch assignments");
      console.error("Error fetching assignments:", error);
    }
    setLoading(false);
  };

  const filtered = assignments.filter((a) => {
    if (filter === "ALL") return true;
    if (filter === "QUIZ") return a.type === "Quiz";
    if (filter === "ASSIGNMENT") return a.type === "Assignment";
    return true;
  });

  const handleViewSubmissions = async (assignment) => {
    try {
      console.log("Fetching submissions for assignment:", assignment._id);
      const res = await getAllSubmissions(assignment._id, token);
      console.log("Submissions response:", res);
      if (res?.success) {
        console.log("Submissions data:", res.data);
        setSelectedAssignment({
          ...assignment,
          submissions: res.data
        });
        setGradingModal(true);
      } else {
        toast.error(res?.message || "Failed to fetch submissions");
      }
    } catch (error) {
      toast.error("Failed to fetch submissions");
      console.error("Error fetching submissions:", error);
    }
  };

  const handleGradingComplete = () => {
    setGradingModal(false);
    setSelectedAssignment(null);
    fetchAssignments(); // Refresh assignments
  };

  if (loading) {
    return (
      <div className="grid flex-1 place-items-center">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-richblack-5">Assignment Management</h1>
          {!courseId && (
            <p className="text-richblack-300 mt-1">All your assignments and quizzes across all courses</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex rounded-md overflow-hidden border border-richblack-600">
            <button
              className={`px-3 py-2 text-sm ${filter === "ALL" ? "bg-yellow-50 text-richblack-900" : "bg-richblack-700 text-richblack-200"}`}
              onClick={() => setFilter("ALL")}
            >
              All ({assignments.length})
            </button>
            <button
              className={`px-3 py-2 text-sm ${filter === "ASSIGNMENT" ? "bg-yellow-50 text-richblack-900" : "bg-richblack-700 text-richblack-200"}`}
              onClick={() => setFilter("ASSIGNMENT")}
            >
              Assignments ({assignments.filter(a => a.type === "Assignment").length})
            </button>
            <button
              className={`px-3 py-2 text-sm ${filter === "QUIZ" ? "bg-yellow-50 text-richblack-900" : "bg-richblack-700 text-richblack-200"}`}
              onClick={() => setFilter("QUIZ")}
            >
              Quizzes ({assignments.filter(a => a.type === "Quiz").length})
            </button>
          </div>
          <button
            onClick={fetchAssignments}
            className="rounded-md bg-yellow-50 px-4 py-2 text-sm font-medium text-richblack-900 hover:bg-yellow-100"
          >
            Refresh
          </button>
        </div>
      </div>

      {assignments.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl text-richblack-300">
            {!courseId ? "No assignments or quizzes created yet" : "No assignments or quizzes found for this course"}
          </p>
          {!courseId && (
            <p className="text-sm text-richblack-400 mt-2">
              Create assignments and quizzes from your courses to see them here
            </p>
          )}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((assignment) => (
            <AssignmentManagementCard
              key={assignment._id}
              assignment={assignment}
              onViewSubmissions={handleViewSubmissions}
            />
          ))}
        </div>
      )}

      {/* Grading Modal */}
      {gradingModal && selectedAssignment && (
        <GradingModal
          assignment={selectedAssignment}
          onClose={() => {
            setGradingModal(false);
            setSelectedAssignment(null);
          }}
          onComplete={handleGradingComplete}
        />
      )}
    </div>
  );
}
