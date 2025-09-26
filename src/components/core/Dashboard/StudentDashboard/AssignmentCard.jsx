import { useState } from "react";
import { FiChevronDown } from "react-icons/fi";
import { FaClock, FaFileAlt, FaClipboardList } from "react-icons/fa";
import { format, parseISO, isValid } from "date-fns";

export default function AssignmentCard({ assignment, onAttempt, onViewHistory }) {
  const [showDetails, setShowDetails] = useState(false);
  const isOverdue = new Date(assignment.dueDate) < new Date();
  const isDueSoon = new Date(assignment.dueDate) < new Date(Date.now() + 24 * 60 * 60 * 1000);

  const getStatusColor = () => {
    if (assignment.submissionStatus?.hasGradedSubmission) return "text-blue-400";
    if (assignment.type === "Quiz" && assignment.submissionStatus?.allAttempts && assignment.submissionStatus.allAttempts.length > 0) {
      return "text-green-400";
    }
    if (isOverdue) return "text-red-400";
    if (isDueSoon) return "text-yellow-400";
    return "text-green-400";
  };

  const getStatusText = () => {
    if (assignment.submissionStatus?.hasGradedSubmission) return "Graded";
    if (assignment.type === "Quiz" && assignment.submissionStatus?.allAttempts && assignment.submissionStatus.allAttempts.length > 0) {
      return `${assignment.submissionStatus.allAttempts.length} Attempt${assignment.submissionStatus.allAttempts.length !== 1 ? 's' : ''}`;
    }
    if (isOverdue) return "Overdue";
    if (isDueSoon) return "Due Soon";
    return "Active";
  };

  // Safe date formatting to avoid RangeError and allow wrapping text
  const safeDueDate = (() => {
    const d = typeof assignment.dueDate === 'string' ? parseISO(assignment.dueDate) : new Date(assignment.dueDate);
    return isValid(d) ? format(d, "MMM dd, yyyy") : "Unknown";
  })();

  return (
    <div className="rounded-lg border border-richblack-600 bg-richblack-700 p-6 transition-all hover:shadow-lg">
      <div className="flex flex-col gap-4">
        {/* Header: type + status */}
        <div className="flex items-center gap-2">
          {assignment.type === "Quiz" ? (
            <FaClipboardList className="text-green-400 shrink-0" />
          ) : (
            <FaFileAlt className="text-blue-400 shrink-0" />
          )}
          <span className="text-sm font-medium text-richblack-300 whitespace-nowrap">
            {assignment.type}
          </span>
          <span className={`text-xs font-medium ${getStatusColor()} whitespace-nowrap`}>
            {getStatusText()}
          </span>
        </div>

        {/* Title and meta */}
        <div>
          <h3 className="text-lg font-semibold text-richblack-5 mb-1 break-words line-clamp-2">
            {assignment.title}
          </h3>

          <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-richblack-300">
            <span className="rounded bg-richblack-600 px-2 py-0.5">Course: {assignment.course?.courseName || "Unknown"}</span>
            <span className="rounded bg-richblack-600 px-2 py-0.5">Section: {assignment.section?.sectionName || "Unknown"}</span>
          </div>

          <p className="text-sm text-richblack-300 mb-4 break-words line-clamp-2">
            {assignment.description}
          </p>

          <div className="flex flex-wrap items-center gap-4 text-sm text-richblack-400">
            <div className="flex items-center gap-1">
              <FaClock />
              <span className="whitespace-nowrap">Due: {safeDueDate}</span>
            </div>
            <span className="whitespace-nowrap">Max Marks: {assignment.maxMarks}</span>
            
            {/* Show scores for quizzes - all attempts */}
            {assignment.type === "Quiz" && assignment.submissionStatus?.allAttempts && assignment.submissionStatus.allAttempts.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {assignment.submissionStatus.allAttempts.map((attempt, index) => (
                  <span 
                    key={index}
                    className="whitespace-nowrap text-blue-300 font-medium bg-blue-600/20 px-2 py-1 rounded text-xs"
                  >
                    Attempt {attempt.attemptNumber}: {attempt.score}/{attempt.maxScore}
                  </span>
                ))}
              </div>
            )}
            
            {/* Show score for assignments - latest only */}
            {assignment.type === "Assignment" && assignment.submissionStatus?.hasGradedSubmission && assignment.submissionStatus?.latestSubmission && (
              <span className="whitespace-nowrap text-blue-300 font-medium">
                Score: {assignment.submissionStatus.latestSubmission.score}/{assignment.submissionStatus.latestSubmission.maxScore}
              </span>
            )}
          </div>
        </div>

        {/* Actions moved below to prevent overlap */}
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (assignment.type === "Quiz") {
                onViewHistory(assignment);
              } else {
                onAttempt(assignment);
              }
            }}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              assignment.submissionStatus?.hasGradedSubmission
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-yellow-50 text-richblack-900 hover:bg-yellow-100"
            }`}
          >
            {assignment.submissionStatus?.hasGradedSubmission 
              ? "View Results" 
              : assignment.type === "Quiz" 
                ? "Open Quiz" 
                : "Open Assignment"
            }
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowDetails(!showDetails);
            }}
            className="text-richblack-400 hover:text-richblack-200"
            aria-label="Toggle details"
            title="Details"
          >
            <FiChevronDown className={`transition-transform ${showDetails ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {showDetails && (
        <div className="mt-4 pt-4 border-t border-richblack-600">
          <div className="space-y-3">
            <div>
              <h4 className="text-sm font-medium text-richblack-300 mb-1">Instructions:</h4>
              <p className="text-sm text-richblack-400 break-words">{assignment.instructions}</p>
            </div>

            {assignment.type === "Quiz" && assignment.questions && (
              <div>
                <h4 className="text-sm font-medium text-richblack-300 mb-1">Questions:</h4>
                <p className="text-sm text-richblack-400">
                  {assignment.questions.length} question{assignment.questions.length !== 1 ? 's' : ''}
                </p>
              </div>
            )}

            {/* Quiz Attempts Summary */}
            {assignment.type === "Quiz" && assignment.submissionStatus?.allAttempts && assignment.submissionStatus.allAttempts.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-richblack-300 mb-2">Your Attempts:</h4>
                <div className="space-y-2">
                  {assignment.submissionStatus.allAttempts.map((attempt, index) => (
                    <div key={index} className="flex items-center justify-between bg-richblack-600 rounded px-3 py-2">
                      <span className="text-sm text-richblack-300">
                        Attempt {attempt.attemptNumber}
                      </span>
                      <span className="text-sm font-medium text-blue-300">
                        {attempt.score}/{attempt.maxScore} 
                        ({((attempt.score / attempt.maxScore) * 100).toFixed(1)}%)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              {assignment.type !== "Quiz" && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAttempt(assignment);
                  }}
                  disabled={isOverdue || assignment.submissionStatus?.hasGradedSubmission}
                  className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                    assignment.submissionStatus?.hasGradedSubmission
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : isOverdue
                      ? "bg-richblack-600 text-richblack-400 cursor-not-allowed"
                      : "bg-yellow-50 text-richblack-900 hover:bg-yellow-100"
                  }`}
                >
                  {assignment.submissionStatus?.hasGradedSubmission 
                    ? "View Results" 
                    : isOverdue 
                      ? "Overdue" 
                      : "Submit Assignment"
                  }
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
