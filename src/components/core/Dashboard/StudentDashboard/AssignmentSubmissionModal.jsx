import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { RxCross2 } from "react-icons/rx";
import { useSelector } from "react-redux";

import { submitAssignment, getStudentSubmissions } from "../../../../services/operations/assignmentAPI";
import { supabase, debugSupabaseConfig } from "../../../../services/supabaseClient";
import IconBtn from "../../../common/IconBtn";

export default function AssignmentSubmissionModal({ assignment, onClose, onComplete }) {
  const { token } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [currentAttempt, setCurrentAttempt] = useState(1);
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const fetchSubmissions = useCallback(async () => {
    if (!assignment?._id) return;
    try {
      const response = await getStudentSubmissions(assignment._id, token);
      if (response?.success) {
        setSubmissions(response.data);
        // Current attempt should be the next attempt number, but not exceed 3
        const nextAttempt = Math.min(response.data.length + 1, 3);
        setCurrentAttempt(nextAttempt);
        console.log("Submissions found:", response.data.length);
        console.log("Current attempt set to:", nextAttempt);
        console.log("Submissions data:", response.data);
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
  if (!assignment) {
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

  const validateFile = (f) => {
    if (!f) return null;
    const name = f.name.toLowerCase();
    const type = f.type;
    const ok = name.endsWith('.pdf') || name.endsWith('.txt') || type === 'application/pdf' || type === 'text/plain';
    if (!ok) return 'Only PDF or TXT files are allowed.';
    const sizeMB = f.size / (1024 * 1024);
    if (sizeMB > 25) return 'File size must be <= 25 MB.';
    return null;
  };

  const onSubmit = async (data) => {
    console.log("Attempting to submit assignment - currentAttempt:", currentAttempt);
    console.log("Submissions count:", submissions.length);
    
    // Debug Supabase configuration
    debugSupabaseConfig();
    
    // Check if submission is closed
    if (isSubmissionClosed()) {
      if (hasGradedSubmission()) {
        toast.error("This assignment has been graded by your instructor. No further attempts allowed.");
      } else {
        toast.error("Maximum 3 attempts allowed");
      }
      return;
    }

    const err = validateFile(file);
    if (file && err) {
      toast.error(err);
      return;
    }

    setLoading(true);
    setProgress(0);

    try {
      let attachments = [];
      if (file) {
        setProgress(10);
        const ext = file.name.split('.').pop();
        const path = `${assignment._id}/${Date.now()}.${ext}`;
        const bucket = process.env.REACT_APP_SUPABASE_BUCKET || 'assignments-bucket';
        
        console.log("Uploading to Supabase:", { bucket, path, fileName: file.name });
        
        const { data: uploaded, error } = await supabase.storage.from(bucket).upload(path, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type || (ext === 'pdf' ? 'application/pdf' : 'text/plain'),
        });
        
        if (error) {
          console.error("Supabase upload error:", error);
          
          // Provide more specific error messages
          if (error.message.includes('row-level security policy')) {
            throw new Error("Storage access denied. Please check your Supabase RLS policies. See SUPABASE_SETUP.md for configuration help.");
          } else if (error.message.includes('400')) {
            throw new Error("Invalid request to Supabase storage. Please check your bucket configuration and RLS policies.");
          } else if (error.message.includes('401') || error.message.includes('403')) {
            throw new Error("Authentication failed. Please check your Supabase credentials in the .env file.");
          } else {
            throw new Error(`Upload failed: ${error.message}`);
          }
        }
        
        setProgress(70);
        const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(uploaded.path);
        console.log("Supabase public URL (post-upload):", { bucket, path: uploaded.path, publicUrl: publicUrlData?.publicUrl });
        attachments = [{ fileName: file.name, fileUrl: publicUrlData.publicUrl }];
        setProgress(90);
      }

      const submissionData = {
        submissionText: data.submissionText,
        attachments,
      };

      console.log("Submitting assignment with data:", {
        assignmentId: assignment._id,
        submissionData,
        token: token ? "Present" : "Missing"
      });

      const response = await submitAssignment(assignment._id, submissionData, token);
      setProgress(100);
      if (response?.success) {
        toast.success("Assignment submitted successfully!");
        onComplete();
        setFile(null);
      }
    } catch (error) {
      console.error("Error submitting assignment:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      
      // Show more helpful error messages
      if (error.message.includes('Supabase')) {
        toast.error(error.message);
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error(error?.message || "Failed to submit assignment");
      }
    }
    setLoading(false);
    setProgress(0);
  };

  // Check if any submission has been graded by instructor
  const hasGradedSubmission = () => {
    return submissions.some(sub => sub.isGraded && sub.gradedBy);
  };

  // Check if assignment is closed for submissions
  const isSubmissionClosed = () => {
    return hasGradedSubmission() || currentAttempt > 3 || submissions.length >= 3;
  };

  const getAttemptStatus = () => {
    if (hasGradedSubmission()) {
      return { text: "Graded by instructor", color: "text-blue-400" };
    }
    if (currentAttempt > 3) return { text: "No attempts left", color: "text-red-400" };
    if (currentAttempt === 3) return { text: "Last attempt", color: "text-yellow-400" };
    return { text: `Attempt ${currentAttempt} of 3`, color: "text-green-400" };
  };

  const attemptStatus = getAttemptStatus();

  return (
    <div className="fixed inset-0 z-[1000] !mt-0 grid h-screen w-screen place-items-center overflow-auto bg-white bg-opacity-10 backdrop-blur-sm">
      <div className="my-10 w-11/12 max-w-[700px] rounded-lg border border-richblack-400 bg-richblack-800">
        {/* Modal Header */}
        <div className="flex items-center justify-between rounded-t-lg bg-richblack-700 p-5">
          <div>
            <h2 className="text-xl font-semibold text-richblack-5">{assignment.title}</h2>
            <p className="text-sm text-richblack-300">Assignment Submission</p>
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

        {/* Assignment Details */}
        <div className="p-6 border-b border-richblack-600">
          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-medium text-richblack-300 mb-1">Description:</h3>
              <p className="text-richblack-400">{assignment.description}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-richblack-300 mb-1">Instructions:</h3>
              <p className="text-richblack-400">{assignment.instructions}</p>
            </div>
            <div className="flex gap-4 text-sm text-richblack-400">
              <span>Max Marks: {assignment.maxMarks}</span>
              <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
            </div>
            
            {/* Graded Assignment Notice */}
            {hasGradedSubmission() && (
              <div className="bg-blue-600/20 border border-blue-500/30 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <p className="text-blue-300 text-sm font-medium">
                    This assignment has been graded by your instructor
                  </p>
                </div>
                <p className="text-blue-400/80 text-xs mt-1">
                  No further submissions are allowed
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Submission Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-richblack-5 mb-2 block">
                Your Submission <sup className="text-pink-200">*</sup>
              </label>
              <textarea
                {...register("submissionText", { required: true })}
                placeholder="Write your assignment submission here..."
                className="form-style resize-none min-h-[200px] w-full"
                disabled={loading || isSubmissionClosed()}
              />
              {errors.submissionText && (
                <span className="ml-2 text-xs tracking-wide text-pink-200">
                  Submission text is required
                </span>
              )}
            </div>

            {/* File Upload Section - You can implement this later */}
            <div>
              <label className="text-sm font-medium text-richblack-5 mb-2 block">
                Attachments (Optional)
              </label>
              <div className="border-2 border-dashed border-richblack-600 rounded-lg p-4 text-center">
                <input
                  type="file"
                  accept=".pdf,.txt"
                  disabled={loading || isSubmissionClosed()}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    const err = validateFile(f);
                    if (err) {
                      toast.error(err);
                      e.target.value = '';
                      setFile(null);
                      return;
                    }
                    setFile(f);
                  }}
                  className="block w-full text-sm text-richblack-5 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-yellow-50 file:text-richblack-900 hover:file:bg-yellow-100"
                />
                {file && (
                  <p className="text-xs text-richblack-300 mt-2">Selected: {file.name}</p>
                )}
                {loading && (
                  <div className="w-full bg-richblack-700 rounded h-2 overflow-hidden mt-3">
                    <div className="bg-yellow-200 h-2 transition-all" style={{ width: `${progress}%` }} />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Previous Submissions */}
          {submissions.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-richblack-300 mb-3">Previous Submissions:</h3>
              <div className="space-y-2">
                {submissions.map((submission, index) => (
                  <div key={submission._id} className="rounded bg-richblack-700 p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-richblack-300">
                        Attempt {submission.attemptNumber}
                      </span>
                      <span className="text-sm text-richblack-400">
                        {new Date(submission.submittedAt).toLocaleDateString()}
                      </span>
                    </div>
                    {submission.isGraded && (
                      <div className="mt-1 text-sm text-richblack-300">
                        <div className="flex items-center space-x-2">
                          <span>Score: {submission.score}/{submission.maxScore}</span>
                          {submission.gradedBy && (
                            <span className="text-xs bg-blue-600/20 text-blue-300 px-2 py-1 rounded">
                              Graded by Instructor
                            </span>
                          )}
                        </div>
                        {submission.feedback && (
                          <p className="text-xs text-richblack-400 mt-1">
                            Feedback: {submission.feedback}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </form>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 rounded-b-lg bg-richblack-700 p-5">
          <button
            onClick={onClose}
            disabled={loading}
            className="rounded-md bg-richblack-600 px-4 py-2 text-sm font-medium text-richblack-300 hover:bg-richblack-500"
          >
            Cancel
          </button>
          <IconBtn
            disabled={loading || isSubmissionClosed()}
            text={loading ? "Submitting..." : isSubmissionClosed() ? "Submission Closed" : "Submit Assignment"}
            onclick={handleSubmit(onSubmit)}
          />
        </div>
      </div>
    </div>
  );
}
