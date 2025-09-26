import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { RxCross2 } from "react-icons/rx";
import { useSelector } from "react-redux";

import { gradeAssignment } from "../../../../services/operations/assignmentAPI";
import IconBtn from "../../../common/IconBtn";

export default function GradingModal({ assignment, onClose, onComplete }) {
  const { token } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm();

  const watchedScore = watch("score");

  const handleGradeSubmission = async (data) => {
    if (!selectedSubmission) {
      toast.error("Please select a submission to grade");
      return;
    }

    if (assignment.type === "Quiz") {
      toast.error("Quizzes are automatically graded");
      return;
    }

    const gradingData = {
      score: parseInt(data.score),
      feedback: data.feedback || "",
    };

    setLoading(true);
    try {
      const response = await gradeAssignment(selectedSubmission._id, gradingData, token);
      if (response?.success) {
        toast.success("Assignment graded successfully");
        // Update the submission in the list
        const updatedSubmissions = assignment.submissions.map(sub => 
          sub._id === selectedSubmission._id 
            ? { ...sub, ...response.data }
            : sub
        );
        assignment.submissions = updatedSubmissions;
        setSelectedSubmission(null);
        setValue("score", "");
        setValue("feedback", "");
      }
    } catch (error) {
      toast.error("Failed to grade assignment");
      console.error("Error grading assignment:", error);
    }
    setLoading(false);
  };

  const handleSelectSubmission = (submission) => {
    console.log("Selected submission data:", submission);
    console.log("Attachments:", submission.attachments);
    setSelectedSubmission(submission);
    setValue("score", submission.score || "");
    setValue("feedback", submission.feedback || "");
  };

  const getSubmissionStatus = (submission) => {
    if (submission.isGraded) {
      return { text: "Graded", color: "text-green-400" };
    }
    return { text: "Pending", color: "text-yellow-400" };
  };

  return (
    <div className="fixed inset-0 z-[1000] !mt-0 grid h-screen w-screen place-items-center overflow-auto bg-white bg-opacity-10 backdrop-blur-sm">
      <div className="my-10 w-11/12 max-w-[1000px] rounded-lg border border-richblack-400 bg-richblack-800">
        {/* Modal Header */}
        <div className="flex items-center justify-between rounded-t-lg bg-richblack-700 p-5">
          <div>
            <h2 className="text-xl font-semibold text-richblack-5">{assignment.title}</h2>
            <p className="text-sm text-richblack-300">
              {assignment.type} - {assignment.submissions.length} submission{assignment.submissions.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button onClick={onClose} disabled={loading}>
            <RxCross2 className="text-2xl text-richblack-5" />
          </button>
        </div>

        <div className="flex h-[70vh]">
          {/* Submissions List */}
          <div className="w-1/3 border-r border-richblack-600 overflow-y-auto">
            <div className="p-4">
              <h3 className="text-lg font-medium text-richblack-5 mb-4">Submissions</h3>
              <div className="space-y-2">
                {assignment.submissions.map((submission) => {
                  const status = getSubmissionStatus(submission);
                  return (
                    <div
                      key={submission._id}
                      onClick={() => handleSelectSubmission(submission)}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedSubmission?._id === submission._id
                          ? "border-yellow-400 bg-yellow-400/10"
                          : "border-richblack-600 hover:border-richblack-500"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-richblack-5">
                          {submission.student.firstName} {submission.student.lastName}
                        </span>
                        <span className={`text-xs font-medium ${status.color}`}>
                          {status.text}
                        </span>
                      </div>
                      <div className="text-xs text-richblack-400">
                        Attempt {submission.attemptNumber} • {new Date(submission.submittedAt).toLocaleDateString()}
                      </div>
                      {submission.isGraded && (
                        <div className="text-xs text-richblack-300 mt-1">
                          Score: {submission.score}/{submission.maxScore}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Submission Details and Grading */}
          <div className="flex-1 overflow-y-auto">
            {selectedSubmission ? (
              <div className="p-6">
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-richblack-5 mb-2">
                    {selectedSubmission.student.firstName} {selectedSubmission.student.lastName}
                  </h3>
                  <div className="text-sm text-richblack-400 mb-4">
                    Attempt {selectedSubmission.attemptNumber} • Submitted on{" "}
                    {new Date(selectedSubmission.submittedAt).toLocaleString()}
                  </div>
                </div>

                {/* Submission Content */}
                <div className="mb-6">
                  <h4 className="text-md font-medium text-richblack-5 mb-2">Submission:</h4>
                  <div className="bg-richblack-700 rounded-lg p-4">
                    <p className="text-richblack-300 whitespace-pre-wrap">
                      {selectedSubmission.submissionText || "No text submission provided"}
                    </p>
                  </div>
                </div>

                {/* Attachments Section */}
                {selectedSubmission.attachments && selectedSubmission.attachments.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-md font-medium text-richblack-5 mb-2">Attachments:</h4>
                    <div className="space-y-3">
                      {selectedSubmission.attachments.map((attachment, index) => (
                        <div key={index} className="bg-richblack-700 rounded-lg p-4 border border-richblack-600">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="flex-shrink-0">
                                {attachment.fileName.toLowerCase().endsWith('.pdf') ? (
                                  <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center">
                                    <span className="text-white text-xs font-bold">PDF</span>
                                  </div>
                                ) : attachment.fileName.toLowerCase().endsWith('.txt') ? (
                                  <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                                    <span className="text-white text-xs font-bold">TXT</span>
                                  </div>
                                ) : (
                                  <div className="w-8 h-8 bg-gray-600 rounded flex items-center justify-center">
                                    <span className="text-white text-xs font-bold">FILE</span>
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-richblack-5 truncate">
                                  {attachment.fileName}
                                </p>
                                <p className="text-xs text-richblack-400">
                                  {attachment.fileUrl ? 'File uploaded successfully' : 'File processing...'}
                                </p>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => window.open(attachment.fileUrl, '_blank')}
                                className="px-3 py-1 bg-yellow-600 text-white text-xs rounded hover:bg-yellow-700 transition-colors"
                                disabled={!attachment.fileUrl}
                              >
                                View
                              </button>
                              <button
                                onClick={() => {
                                  const link = document.createElement('a');
                                  link.href = attachment.fileUrl;
                                  link.download = attachment.fileName;
                                  link.target = '_blank';
                                  document.body.appendChild(link);
                                  link.click();
                                  document.body.removeChild(link);
                                }}
                                className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                                disabled={!attachment.fileUrl}
                              >
                                Download
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* No Attachments Message */}
                {(!selectedSubmission.attachments || selectedSubmission.attachments.length === 0) && (
                  <div className="mb-6">
                    <h4 className="text-md font-medium text-richblack-5 mb-2">Attachments:</h4>
                    <div className="bg-richblack-700 rounded-lg p-4 border border-richblack-600">
                      <p className="text-richblack-400 text-sm">No files attached to this submission</p>
                    </div>
                  </div>
                )}

                {/* Grading Form (only for assignments) */}
                {assignment.type === "Assignment" && (
                  <form onSubmit={handleSubmit(handleGradeSubmission)} className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-richblack-5 mb-2 block">
                        Score (out of {assignment.maxMarks}) <sup className="text-pink-200">*</sup>
                      </label>
                      <input
                        type="number"
                        min="0"
                        max={assignment.maxMarks}
                        {...register("score", { 
                          required: true, 
                          min: 0, 
                          max: assignment.maxMarks 
                        })}
                        className="form-style w-full"
                        disabled={loading}
                      />
                      {errors.score && (
                        <span className="ml-2 text-xs tracking-wide text-pink-200">
                          Please enter a valid score
                        </span>
                      )}
                      {watchedScore && (
                        <div className="text-xs text-richblack-400 mt-1">
                          Percentage: {((watchedScore / assignment.maxMarks) * 100).toFixed(1)}%
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="text-sm font-medium text-richblack-5 mb-2 block">
                        Feedback (Optional)
                      </label>
                      <textarea
                        {...register("feedback")}
                        placeholder="Provide feedback for the student..."
                        className="form-style resize-none min-h-[100px] w-full"
                        disabled={loading}
                      />
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedSubmission(null);
                          setValue("score", "");
                          setValue("feedback", "");
                        }}
                        className="rounded-md bg-richblack-600 px-4 py-2 text-sm font-medium text-richblack-300 hover:bg-richblack-500"
                      >
                        Cancel
                      </button>
                      <IconBtn
                        disabled={loading}
                        text={loading ? "Grading..." : "Grade Assignment"}
                      />
                    </div>
                  </form>
                )}

                {/* Quiz Results (read-only) */}
                {assignment.type === "Quiz" && selectedSubmission.answers && (
                  <div>
                    <h4 className="text-md font-medium text-richblack-5 mb-4">Quiz Results:</h4>
                    <div className="space-y-4">
                      {assignment.questions.map((question, index) => {
                        const answer = selectedSubmission.answers.find(
                          a => a.questionId === question._id
                        );
                        return (
                          <div key={question._id} className="bg-richblack-700 rounded-lg p-4">
                            <h5 className="text-sm font-medium text-richblack-5 mb-2">
                              Question {index + 1}
                            </h5>
                            <p className="text-richblack-300 mb-3">{question.question}</p>
                            <div className="space-y-2">
                              {question.options.map((option, optionIndex) => (
                                <div
                                  key={optionIndex}
                                  className={`p-2 rounded ${
                                    optionIndex === question.correctAnswer
                                      ? "bg-green-600/20 text-green-300"
                                      : optionIndex === answer?.selectedOption
                                      ? "bg-red-600/20 text-red-300"
                                      : "bg-richblack-600 text-richblack-300"
                                  }`}
                                >
                                  {option}
                                  {optionIndex === question.correctAnswer && " (Correct)"}
                                  {optionIndex === answer?.selectedOption && optionIndex !== question.correctAnswer && " (Your Answer)"}
                                </div>
                              ))}
                            </div>
                            <div className="mt-2 text-sm text-richblack-400">
                              Marks: {answer?.isCorrect ? question.marks : 0}/{question.marks}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-richblack-400">Select a submission to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
