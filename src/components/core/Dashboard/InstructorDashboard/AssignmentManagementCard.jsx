import { FaFileAlt, FaQuestionCircle, FaUsers, FaClock } from "react-icons/fa";
import { format } from "date-fns";

export default function AssignmentManagementCard({ assignment, onViewSubmissions }) {
  const isOverdue = assignment?.dueDate ? new Date(assignment.dueDate) < new Date() : false;
  const isDueSoon = assignment?.dueDate ? new Date(assignment.dueDate) < new Date(Date.now() + 24 * 60 * 60 * 1000) : false;

  const getStatusColor = () => {
    if (isOverdue) return "text-red-400";
    if (isDueSoon) return "text-yellow-400";
    return "text-green-400";
  };

  const getStatusText = () => {
    if (isOverdue) return "Overdue";
    if (isDueSoon) return "Due Soon";
    return "Active";
  };

  return (
    <div className="rounded-lg border border-richblack-600 bg-richblack-700 p-6 transition-all hover:shadow-lg">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          {assignment.type === "Quiz" ? (
            <FaQuestionCircle className="text-green-400" />
          ) : (
            <FaFileAlt className="text-blue-400" />
          )}
          <span className="text-sm font-medium text-richblack-300">
            {assignment.type}
          </span>
          <span className={`text-xs font-medium ${getStatusColor()}`}>
            {getStatusText()}
          </span>
        </div>
      </div>
      
      <h3 className="text-lg font-semibold text-richblack-5 mb-2">
        {assignment.title}
      </h3>
      
      <p className="text-sm text-richblack-300 mb-4 line-clamp-2">
        {assignment.description}
      </p>

      <div className="space-y-2 mb-4">
        {assignment.course && (
          <div className="text-sm text-richblack-400">
            <span className="font-medium">Course:</span> {assignment.course.courseName}
          </div>
        )}
        {assignment.section && (
          <div className="text-sm text-richblack-400">
            <span className="font-medium">Section:</span> {assignment.section.sectionName}
          </div>
        )}
        <div className="flex items-center gap-2 text-sm text-richblack-400">
          <FaClock />
          <span>Due: {assignment?.dueDate ? format(new Date(assignment.dueDate), "MMM dd, yyyy") : "-"}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-richblack-400">
          <FaUsers />
          <span>Max Marks: {assignment.maxMarks}</span>
        </div>
        {assignment.type === "Quiz" && assignment.questions && (
          <div className="text-sm text-richblack-400">
            Questions: {assignment.questions.length}
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onViewSubmissions(assignment)}
          className="flex-1 rounded-md bg-yellow-50 px-4 py-2 text-sm font-medium text-richblack-900 hover:bg-yellow-100 transition-colors"
        >
          View Submissions
        </button>
      </div>
    </div>
  );
}
