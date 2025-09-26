import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";

import { getStudentAssignments } from "../../../../services/operations/assignmentAPI";
import AssignmentCard from "./AssignmentCard";
import QuizAttemptModal from "./QuizAttemptModal";
import AssignmentSubmissionModal from "./AssignmentSubmissionModal";
import QuizHistoryModal from "./QuizHistoryModal";
import QuizScoreModal from "./QuizScoreModal";

export default function Assignments() {
  const { token } = useSelector((state) => state.auth);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [attemptModal, setAttemptModal] = useState(false);
  const [submissionModal, setSubmissionModal] = useState(false);
  const [historyModal, setHistoryModal] = useState(false);
  const [scoreModal, setScoreModal] = useState(false);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const response = await getStudentAssignments(token);
      if (response?.success) {
        setAssignments(response.data);
      }
    } catch (error) {
      toast.error("Failed to fetch assignments");
      console.error("Error fetching assignments:", error);
    }
    setLoading(false);
  };

  const handleAttemptAssignment = (assignment) => {
    setSelectedAssignment(assignment);
    if (assignment.type === "Quiz") {
      setAttemptModal(true);
    } else {
      setSubmissionModal(true);
    }
  };

  const handleSubmissionComplete = () => {
    setAttemptModal(false);
    setSubmissionModal(false);
    // Show history modal after successful submission for quizzes
    if (selectedAssignment && selectedAssignment.type === "Quiz") {
      setHistoryModal(true);
    } else {
      setSelectedAssignment(null);
    }
    fetchAssignments(); // Refresh assignments
  };

  const handleViewHistory = (assignment) => {
    setSelectedAssignment(assignment);
    setHistoryModal(true);
  };

  const handleReattemptQuiz = () => {
    setHistoryModal(false);
    setAttemptModal(true);
  };

  const handleViewScore = () => {
    setHistoryModal(false);
    setScoreModal(true);
  };

  const handleCloseModals = () => {
    setHistoryModal(false);
    setScoreModal(false);
    setSelectedAssignment(null);
  };

  const handleRefreshAssignments = () => {
    fetchAssignments();
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
        <h1 className="text-3xl font-semibold text-richblack-5">Assignments & Quizzes</h1>
        <button
          onClick={fetchAssignments}
          className="rounded-md bg-yellow-50 px-4 py-2 text-sm font-medium text-richblack-900 hover:bg-yellow-100"
        >
          Refresh
        </button>
      </div>

      {assignments.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl text-richblack-300">No assignments or quizzes available for your enrolled courses</p>
          <p className="text-sm text-richblack-400 mt-2">Enroll in courses to see their assignments and quizzes</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {assignments.map((assignment) => (
            <AssignmentCard
              key={assignment._id}
              assignment={assignment}
              onAttempt={handleAttemptAssignment}
              onViewHistory={handleViewHistory}
            />
          ))}
        </div>
      )}

      {/* Quiz Attempt Modal */}
      {attemptModal && selectedAssignment && (
        <QuizAttemptModal
          assignment={selectedAssignment}
          onClose={() => {
            setAttemptModal(false);
            setSelectedAssignment(null);
          }}
          onComplete={handleSubmissionComplete}
        />
      )}

      {/* Assignment Submission Modal */}
      {submissionModal && selectedAssignment && (
        <AssignmentSubmissionModal
          assignment={selectedAssignment}
          onClose={() => {
            setSubmissionModal(false);
            setSelectedAssignment(null);
          }}
          onComplete={handleSubmissionComplete}
        />
      )}

      {/* Quiz History Modal */}
      {historyModal && selectedAssignment && (
        <QuizHistoryModal
          assignment={selectedAssignment}
          onClose={handleCloseModals}
          onReattempt={handleReattemptQuiz}
          onViewScore={handleViewScore}
          onRefresh={handleRefreshAssignments}
        />
      )}

      {/* Quiz Score Modal */}
      {scoreModal && selectedAssignment && (
        <QuizScoreModal
          assignment={selectedAssignment}
          onClose={handleCloseModals}
        />
      )}
    </div>
  );
}
