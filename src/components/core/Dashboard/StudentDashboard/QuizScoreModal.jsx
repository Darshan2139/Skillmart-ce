import { useState, useEffect } from "react";
import { RxCross2 } from "react-icons/rx";
import { FaCheckCircle, FaTimesCircle, FaTrophy, FaChartBar } from "react-icons/fa";
import { format, parseISO, isValid as isValidDate } from "date-fns";

import { useSelector } from "react-redux";
import { getStudentSubmissions } from "../../../../services/operations/assignmentAPI";

// Safely format submission date to avoid RangeError from invalid dates
const formatSubmissionDate = (createdAt, pattern = "MMM dd, yyyy 'at' h:mm a") => {
  if (!createdAt) return "Unknown time";
  const date = typeof createdAt === "string" ? parseISO(createdAt) : new Date(createdAt);
  if (!isValidDate(date)) return "Unknown time";
  return format(date, pattern);
};

export default function QuizScoreModal({ assignment, onClose }) {
  const { token } = useSelector((state) => state.auth);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  useEffect(() => {
    fetchSubmissions();
  }, [assignment._id]);

  const fetchSubmissions = async () => {
    try {
      const response = await getStudentSubmissions(assignment._id, token);
      if (response?.success) {
        setSubmissions(response.data);
        console.log("Quiz submissions for score modal:", response.data);
        // Select the latest submission by default
        if (response.data.length > 0) {
          setSelectedSubmission(response.data[response.data.length - 1]);
        }
      }
    } catch (error) {
      console.error("Error fetching submissions:", error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score, maxScore) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return "text-green-400";
    if (percentage >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  const getScoreMessage = (score, maxScore) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 90) return "Excellent! Outstanding performance!";
    if (percentage >= 80) return "Great job! Well done!";
    if (percentage >= 70) return "Good work! Keep it up!";
    if (percentage >= 60) return "Not bad, but room for improvement.";
    return "Keep studying and try again!";
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-[1000] !mt-0 grid h-screen w-screen place-items-center overflow-auto bg-white bg-opacity-10 backdrop-blur-sm">
        <div className="my-10 w-11/12 max-w-[600px] rounded-lg border border-richblack-400 bg-richblack-800 p-6">
          <div className="text-center">
            <div className="spinner mx-auto mb-4"></div>
            <p className="text-richblack-300">Loading quiz scores...</p>
          </div>
        </div>
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <div className="fixed inset-0 z-[1000] !mt-0 grid h-screen w-screen place-items-center overflow-auto bg-white bg-opacity-10 backdrop-blur-sm">
        <div className="my-10 w-11/12 max-w-[600px] rounded-lg border border-richblack-400 bg-richblack-800">
          <div className="flex items-center justify-between rounded-t-lg bg-richblack-700 p-5">
            <h2 className="text-xl font-semibold text-richblack-5">Quiz Scores</h2>
            <button onClick={onClose}>
              <RxCross2 className="text-2xl text-richblack-5" />
            </button>
          </div>
          <div className="p-6 text-center">
            <p className="text-richblack-300">No submissions found for this quiz.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[1000] !mt-0 grid h-screen w-screen place-items-center overflow-auto bg-white bg-opacity-10 backdrop-blur-sm">
      <div className="my-10 w-11/12 max-w-[800px] rounded-lg border border-richblack-400 bg-richblack-800">
        {/* Modal Header */}
        <div className="flex items-center justify-between rounded-t-lg bg-richblack-700 p-5">
          <div>
            <h2 className="text-xl font-semibold text-richblack-5">{assignment.title}</h2>
            <p className="text-sm text-richblack-300">Quiz Results & Analysis</p>
          </div>
          <button onClick={onClose}>
            <RxCross2 className="text-2xl text-richblack-5" />
          </button>
        </div>

        {/* Attempt Selection */}
        {submissions.length > 1 && (
          <div className="p-4 border-b border-richblack-600">
            <label className="text-sm text-richblack-300 mb-2 block">Select Attempt:</label>
            <select
              value={selectedSubmission?._id || ''}
              onChange={(e) => {
                const submission = submissions.find(s => s._id === e.target.value);
                setSelectedSubmission(submission);
              }}
              className="form-style w-full max-w-xs"
            >
              {submissions.map((submission) => (
                <option key={submission._id} value={submission._id}>
                  Attempt {submission.attemptNumber} - {formatSubmissionDate(submission.createdAt, "MMM dd, h:mm a")}
                </option>
              ))}
            </select>
          </div>
        )}

        {selectedSubmission && (
          <>
            {/* Score Summary */}
            <div className="p-6 border-b border-richblack-600">
              <div className="text-center">
                <div className="flex items-center justify-center mb-4">
                  <FaTrophy className="text-4xl text-yellow-400 mr-3" />
                  <div>
                    <div className={`text-4xl font-bold ${getScoreColor(selectedSubmission.score, selectedSubmission.maxScore)}`}>
                      {selectedSubmission.score}/{selectedSubmission.maxScore}
                    </div>
                    <div className="text-sm text-richblack-400">
                      {((selectedSubmission.score / selectedSubmission.maxScore) * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
                <p className="text-richblack-300 mb-2">{getScoreMessage(selectedSubmission.score, selectedSubmission.maxScore)}</p>
                <div className="flex items-center justify-center gap-4 text-sm text-richblack-400">
                  <span>Attempt {selectedSubmission.attemptNumber}</span>
                  <span>•</span>
                  <span>{formatSubmissionDate(selectedSubmission.createdAt)}</span>
                </div>
              </div>
            </div>

            {/* Detailed Results */}
            <div className="p-6">
              <h3 className="text-lg font-semibold text-richblack-5 mb-4 flex items-center gap-2">
                <FaChartBar />
                Question-by-Question Results
              </h3>
              <div className="space-y-4">
                {assignment.questions.map((question, index) => {
                  const answer = selectedSubmission.answers.find(a => 
                    a.questionId === question._id || a.questionId === index
                  );
                  const isCorrect = answer?.isCorrect;
                  
                  return (
                    <div key={index} className="rounded-lg border border-richblack-600 bg-richblack-700 p-4">
                      <div className="flex items-start gap-3">
                        {isCorrect ? (
                          <FaCheckCircle className="text-green-400 mt-1" />
                        ) : (
                          <FaTimesCircle className="text-red-400 mt-1" />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-medium text-richblack-5">
                              Question {index + 1}
                            </h4>
                            <span className="text-xs text-richblack-400">
                              {isCorrect ? `${question.marks} marks` : '0 marks'}
                            </span>
                          </div>
                          <p className="text-sm text-richblack-300 mb-3">{question.question}</p>
                          
                          <div className="space-y-2">
                            {question.options.map((option, optIndex) => {
                              const isSelected = answer?.selectedOption === optIndex;
                              const isCorrectAnswer = question.correctAnswer === optIndex;
                              
                              return (
                                <div
                                  key={optIndex}
                                  className={`p-2 rounded text-sm ${
                                    isCorrectAnswer
                                      ? 'bg-green-600 text-white'
                                      : isSelected && !isCorrectAnswer
                                      ? 'bg-red-600 text-white'
                                      : 'bg-richblack-600 text-richblack-300'
                                  }`}
                                >
                                  {option}
                                  {isCorrectAnswer && <span className="ml-2">✓ Correct Answer</span>}
                                  {isSelected && !isCorrectAnswer && <span className="ml-2">✗ Your Answer</span>}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* Modal Footer */}
        <div className="flex justify-end rounded-b-lg bg-richblack-700 p-5">
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
