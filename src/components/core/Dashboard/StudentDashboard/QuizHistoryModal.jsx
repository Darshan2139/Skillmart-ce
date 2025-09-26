import { useState, useEffect } from "react";
import { RxCross2 } from "react-icons/rx";
import { FaEye, FaRedo, FaCheckCircle, FaClock, FaExclamationTriangle } from "react-icons/fa";
import { format } from "date-fns";

import { useSelector } from "react-redux";
import { getStudentSubmissions } from "../../../../services/operations/assignmentAPI";

export default function QuizHistoryModal({ assignment, onClose, onReattempt, onViewScore, onRefresh }) {
  const { token } = useSelector((state) => state.auth);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubmissions();
  }, [assignment._id]);

  // Refresh submissions when modal opens
  useEffect(() => {
    if (assignment) {
      fetchSubmissions();
    }
  }, [assignment]);

  const fetchSubmissions = async () => {
    try {
      const response = await getStudentSubmissions(assignment._id, token);
      if (response?.success) {
        setSubmissions(response.data);
        console.log("Quiz submissions fetched:", response.data);
      }
    } catch (error) {
      console.error("Error fetching submissions:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (submission) => {
    if (submission.isGraded) {
      return <FaCheckCircle className="text-green-400" />;
    }
    return <FaClock className="text-yellow-400" />;
  };

  const getStatusText = (submission) => {
    if (submission.isGraded) {
      return "Completed";
    }
    return "Submitted";
  };

  const canReattempt = () => {
    if (submissions.length >= 3) return false;
    // Block reattempts if student already passed (>= 50% of maxScore)
    const best = submissions.reduce((m, s) => Math.max(m, s.score || 0), 0);
    const passThreshold = Math.ceil((assignment.maxMarks || 0) * 0.5);
    return best < passThreshold;
  };

  const isOverdue = () => {
    return new Date() > new Date(assignment.dueDate);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-[1000] !mt-0 grid h-screen w-screen place-items-center overflow-auto bg-white bg-opacity-10 backdrop-blur-sm">
        <div className="my-10 w-11/12 max-w-[600px] rounded-lg border border-richblack-400 bg-richblack-800 p-6">
          <div className="text-center">
            <div className="spinner mx-auto mb-4"></div>
            <p className="text-richblack-300">Loading quiz history...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[1000] !mt-0 grid h-screen w-screen place-items-center overflow-auto bg-white bg-opacity-10 backdrop-blur-sm">
      <div className="my-10 w-11/12 max-w-[600px] rounded-lg border border-richblack-400 bg-richblack-800">
        {/* Modal Header */}
        <div className="flex items-center justify-between rounded-t-lg bg-richblack-700 p-5">
          <div>
            <h2 className="text-xl font-semibold text-richblack-5">{assignment.title}</h2>
            <p className="text-sm text-richblack-300">Quiz History & Options</p>
          </div>
          <button onClick={onClose}>
            <RxCross2 className="text-2xl text-richblack-5" />
          </button>
        </div>

        {/* Quiz Status */}
        <div className="p-6 border-b border-richblack-600">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {isOverdue() ? (
                <FaExclamationTriangle className="text-red-400" />
              ) : (
                <FaClock className="text-yellow-400" />
              )}
              <span className={`text-sm font-medium ${isOverdue() ? 'text-red-400' : 'text-yellow-400'}`}>
                {isOverdue() ? 'Overdue' : 'Active'}
              </span>
            </div>
            <div className="text-sm text-richblack-400">
              Due: {format(new Date(assignment.dueDate), "MMM dd, yyyy")}
            </div>
          </div>
          
          <div className="text-sm text-richblack-300">
            <p>Attempts: {submissions.length}/3</p>
            <p>Remaining: {3 - submissions.length} attempts</p>
            <p>Max Marks: {assignment.maxMarks}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-6 border-b border-richblack-600">
          <div className="grid gap-3">
            {submissions.length > 0 && (
              <button
                onClick={onViewScore}
                className="flex items-center gap-3 rounded-md bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
              >
                <FaEye />
                View Your Score
              </button>
            )}
            
            {canReattempt() && !isOverdue() && (
              <button
                onClick={onReattempt}
                className="flex items-center gap-3 rounded-md bg-green-600 px-4 py-3 text-sm font-medium text-white hover:bg-green-700 transition-colors"
              >
                <FaRedo />
                {submissions.length === 0 ? 'Start Quiz' : `Reattempt Quiz (${3 - submissions.length} attempts left)`}
              </button>
            )}
            
            {!canReattempt() && (
              <div className="rounded-md bg-richblack-600 px-4 py-3 text-sm text-richblack-300">
                <FaExclamationTriangle className="inline mr-2" />
                Maximum attempts reached
              </div>
            )}
            
            {isOverdue() && (
              <div className="rounded-md bg-red-600 px-4 py-3 text-sm text-white">
                <FaExclamationTriangle className="inline mr-2" />
                Quiz deadline has passed
              </div>
            )}
          </div>
        </div>

        {/* Submission History */}
        {submissions.length > 0 && (
          <div className="p-6">
            <h3 className="text-lg font-semibold text-richblack-5 mb-4">Submission History</h3>
            <div className="space-y-3">
              {submissions.map((submission, index) => (
                <div key={submission._id} className="rounded-lg border border-richblack-600 bg-richblack-700 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(submission)}
                      <div>
                        <p className="text-sm font-medium text-richblack-5">
                          Attempt {submission.attemptNumber}
                        </p>
                        <p className="text-xs text-richblack-400">
                          {format(new Date(submission.submittedAt || submission.createdAt), "MMM dd, yyyy 'at' h:mm a")}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-richblack-5">
                        {submission.score}/{submission.maxScore}
                      </p>
                      <p className="text-xs text-richblack-400">
                        {getStatusText(submission)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="flex justify-between rounded-b-lg bg-richblack-700 p-5">
          <button
            onClick={fetchSubmissions}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Refresh
          </button>
          <button
            onClick={onClose}
            className="rounded-md bg-richblack-600 px-4 py-2 text-sm font-medium text-richblack-300 hover:bg-richblack-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
