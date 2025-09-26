import { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import { RxCross2 } from "react-icons/rx";
import { useSelector } from "react-redux";

import { submitAssignment, getStudentSubmissions } from "../../../../services/operations/assignmentAPI";
import IconBtn from "../../../common/IconBtn";

export default function QuizAttemptModal({ assignment, onClose, onComplete }) {
  const { token } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentAttempt, setCurrentAttempt] = useState(1);

  const fetchSubmissions = useCallback(async () => {
    if (!assignment?._id) return;
    try {
      const response = await getStudentSubmissions(assignment._id, token);
      console.log("Frontend fetchSubmissions response:", response);
      if (response?.success) {
        setSubmissions(response.data);
        // Current attempt should be the next attempt number, but not exceed 3
        const nextAttempt = Math.min(response.data.length + 1, 3);
        setCurrentAttempt(nextAttempt);
        console.log("Submissions found:", response.data.length);
        console.log("Submissions data:", response.data);
        console.log("Current attempt set to:", nextAttempt);
      }
    } catch (error) {
      console.error("Error fetching submissions:", error);
    }
  }, [assignment?._id, token]);

  useEffect(() => {
    if (assignment && assignment._id) {
      fetchSubmissions();
    }
  }, [assignment?._id, fetchSubmissions]);

  // Add safety checks for assignment data
  if (!assignment || !assignment.questions || !Array.isArray(assignment.questions)) {
    return (
      <div className="fixed inset-0 z-[1000] !mt-0 grid h-screen w-screen place-items-center overflow-auto bg-white bg-opacity-10 backdrop-blur-sm">
        <div className="my-10 w-11/12 max-w-[800px] rounded-lg border border-richblack-400 bg-richblack-800 p-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-richblack-5 mb-4">Invalid Assignment</h2>
            <p className="text-richblack-300 mb-4">This assignment data is incomplete or invalid.</p>
            <button
              onClick={onClose}
              className="rounded-md bg-yellow-50 px-4 py-2 text-sm font-medium text-richblack-900 hover:bg-yellow-100"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleAnswerChange = (questionId, selectedOption) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: selectedOption
    }));
  };

  const handleSubmit = async () => {
    console.log("Attempting to submit - currentAttempt:", currentAttempt);
    console.log("Submissions count:", submissions.length);
    
    if (currentAttempt > 3 || submissions.length >= 3) {
      toast.error("Maximum 3 attempts allowed");
      return;
    }

    // Enforce reattempt only if previous best score < 50%
    const best = submissions.reduce((m, s) => Math.max(m, s.score || 0), 0);
    const passThreshold = Math.ceil((assignment.maxMarks || 0) * 0.5);
    if (best >= passThreshold) {
      toast.error("You have already passed this quiz. No further attempts allowed.");
      return;
    }

    // Check if all questions are answered
    const unansweredQuestions = assignment.questions.filter(
      (q, index) => {
        const questionId = q._id || `q_${index}`;
        return !answers[questionId] && answers[questionId] !== 0;
      }
    );

    if (unansweredQuestions.length > 0) {
      toast.error("Please answer all questions");
      return;
    }

    const submissionData = {
      answers: assignment.questions.map((q, index) => {
        const questionId = q._id || `q_${index}`; // Use _id if available, otherwise use index-based ID
        // Try multiple ways to find the answer
        const selectedOption = answers[questionId] || answers[q._id] || answers[index] || answers[`q_${index}`];
        console.log(`Question ${index}: ID=${questionId}, _id=${q._id}, selectedOption=${selectedOption}`);
        console.log(`Available answer keys:`, Object.keys(answers));
        return {
          questionId: questionId,
          selectedOption: selectedOption
        };
      }).filter(answer => answer.selectedOption !== null && answer.selectedOption !== undefined)
    };

    console.log("Quiz submission data:", submissionData);
    console.log("Assignment questions:", assignment.questions);
    console.log("Answers state:", answers);

    setLoading(true);
    try {
      const response = await submitAssignment(assignment._id, submissionData, token);
      if (response?.success) {
        toast.success(`Quiz submitted successfully! Score: ${response.data.score}/${response.data.maxScore}`);
        // Refresh submissions to update attempt count
        await fetchSubmissions();
        // Close the modal after a short delay to show the toast
        setTimeout(() => {
          onComplete();
        }, 1500);
      } else {
        toast.error(response?.message || "Failed to submit quiz");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to submit quiz";
      toast.error(errorMessage);
      console.error("Error submitting quiz:", error);
      console.error("Error response:", error.response?.data);
    }
    setLoading(false);
  };

  const getAttemptStatus = () => {
    const remainingAttempts = 3 - submissions.length;
    if (submissions.length >= 3) return { text: "No attempts left", color: "text-red-400" };
    if (currentAttempt === 3) return { text: "Last attempt", color: "text-yellow-400" };
    return { 
      text: `Attempt ${currentAttempt} of 3 (${remainingAttempts} remaining)`, 
      color: "text-green-400" 
    };
  };

  const attemptStatus = getAttemptStatus();

  return (
    <div className="fixed inset-0 z-[1000] !mt-0 grid h-screen w-screen place-items-center overflow-auto bg-white bg-opacity-10 backdrop-blur-sm">
      <div className="my-10 w-11/12 max-w-[800px] rounded-lg border border-richblack-400 bg-richblack-800">
        {/* Modal Header */}
        <div className="flex items-center justify-between rounded-t-lg bg-richblack-700 p-5">
          <div>
            <h2 className="text-xl font-semibold text-richblack-5">{assignment.title}</h2>
            <p className="text-sm text-richblack-300">Quiz - {assignment.questions.length} questions</p>
          </div>
          <div className="flex items-center gap-4">
            <span className={`text-sm font-medium ${attemptStatus.color}`}>
              {attemptStatus.text}
            </span>
            <button onClick={onClose} disabled={loading}>
              <RxCross2 className="text-2xl text-richblack-5" />
            </button>
          </div>
        </div>

        {/* Quiz Content */}
        <div className="max-h-[70vh] overflow-y-auto p-6">
          <div className="space-y-6">
            {assignment.questions.map((question, index) => {
              const questionId = question._id || `q_${index}`;
              console.log(`Rendering question ${index}: _id=${question._id}, questionId=${questionId}`);
              return (
                <div key={questionId} className="rounded-lg border border-richblack-600 bg-richblack-700 p-4">
                  <div className="mb-4">
                    <h3 className="text-lg font-medium text-richblack-5 mb-2">
                      Question {index + 1}
                    </h3>
                    <p className="text-richblack-300">{question.question}</p>
                    <p className="text-sm text-richblack-400 mt-1">
                      Marks: {question.marks}
                    </p>
                  </div>

                  <div className="space-y-2">
                    {question.options.map((option, optionIndex) => (
                      <label
                        key={optionIndex}
                        className="flex items-center space-x-3 cursor-pointer hover:bg-richblack-600 p-2 rounded"
                      >
                        <input
                          type="radio"
                          name={`question_${questionId}`}
                          value={optionIndex}
                          checked={answers[questionId] === optionIndex}
                          onChange={() => handleAnswerChange(questionId, optionIndex)}
                          className="text-yellow-50"
                        />
                        <span className="text-richblack-300">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between rounded-b-lg bg-richblack-700 p-5">
          <div className="text-sm text-richblack-300">
            Max Marks: {assignment.maxMarks}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="rounded-md bg-richblack-600 px-4 py-2 text-sm font-medium text-richblack-300 hover:bg-richblack-500"
            >
              Cancel
            </button>
            <IconBtn
              disabled={loading || currentAttempt > 3 || submissions.length >= 3}
              text={loading ? "Submitting..." : (submissions.length >= 3 ? "No Attempts Left" : "Submit Quiz")}
              onclick={handleSubmit}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
