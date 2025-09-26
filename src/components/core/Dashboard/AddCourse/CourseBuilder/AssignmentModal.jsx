import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { RxCross2 } from "react-icons/rx";
import { useDispatch, useSelector } from "react-redux";

import { createAssignment, updateAssignment } from "../../../../../services/operations/assignmentAPI";
import { setCourse } from "../../../../../slices/courseSlice";
import IconBtn from "../../../../common/IconBtn";

export default function AssignmentModal({
  modalData,
  setModalData,
  add = false,
  view = false,
  edit = false,
}) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm();

  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const { token } = useSelector((state) => state.auth);
  const { course } = useSelector((state) => state.course);

  const assignmentType = watch("type");

  useEffect(() => {
    if (view || edit) {
      console.log("AssignmentModal - modalData:", modalData);
      console.log("AssignmentModal - questions:", modalData.questions);
      setValue("title", modalData.title);
      setValue("description", modalData.description);
      setValue("type", modalData.type);
      setValue("maxMarks", modalData.maxMarks);
      setValue("dueDate", modalData.dueDate?.split("T")[0]);
      setValue("instructions", modalData.instructions);
      if (modalData.questions) {
        console.log("Setting questions:", modalData.questions);
        setQuestions(modalData.questions);
      } else {
        console.log("No questions found in modalData");
        setQuestions([]);
      }
    }
  }, [modalData, view, edit, setValue]);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        _id: `temp_${Date.now()}_${Math.random()}`, // Add temporary ID
        question: "",
        options: ["", "", "", ""],
        correctAnswer: 0,
        marks: 1,
      },
    ]);
  };

  const updateQuestion = (index, field, value) => {
    const updatedQuestions = questions.map((question, i) => {
      if (i === index) {
        return { ...question, [field]: value };
      }
      return question;
    });
    setQuestions(updatedQuestions);
  };

  const removeQuestion = (index) => {
    const updatedQuestions = questions.filter((_, i) => i !== index);
    setQuestions(updatedQuestions);
  };

  const onSubmit = async (data) => {
    if (view) return;

    if (assignmentType === "Quiz" && questions.length === 0) {
      toast.error("Please add at least one question for the quiz");
      return;
    }

    if (assignmentType === "Quiz") {
      // Validate questions
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        if (!q.question.trim()) {
          toast.error(`Question ${i + 1} is required`);
          return;
        }
        if (q.options.some(opt => !opt.trim())) {
          toast.error(`All options for Question ${i + 1} are required`);
          return;
        }
        if (q.correctAnswer === undefined || q.correctAnswer === null) {
          toast.error(`Please select a correct answer for Question ${i + 1}`);
          return;
        }
      }
    }

    const payload = {
      title: data.title,
      description: data.description,
      type: data.type,
      maxMarks: parseInt(data.maxMarks),
      dueDate: data.dueDate,
      instructions: data.instructions,
    };

    if (assignmentType === "Quiz") {
      // Remove temporary IDs before sending to backend
      payload.questions = questions.map(q => ({
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        marks: q.marks
      }));
    }

    console.log("Assignment payload:", payload);
    setLoading(true);
    try {
      if (edit && modalData?._id) {
        const res = await updateAssignment(modalData._id, payload, token);
        if (res?.data?.success) {
          toast.success("Updated successfully");
          setModalData(null);
        } else {
          toast.error(res?.data?.message || "Failed to update");
        }
      } else {
        const result = await createAssignment({
          ...payload,
          courseId: course._id,
          sectionId: modalData.sectionId,
        }, token);
        if (result?.success) {
          toast.success(`${data.type} created successfully`);
          // Immediately reflect the new assignment/quiz in Course Builder UI
          const newAssignment = result?.data;
          if (newAssignment) {
            const updatedCourse = {
              ...course,
              courseContent: course.courseContent.map((sec) =>
                sec._id === modalData.sectionId
                  ? { ...sec, assignments: [ ...(sec.assignments || []), newAssignment ] }
                  : sec
              ),
            };
            dispatch(setCourse(updatedCourse));
          }
          setModalData(null);
        } else {
          toast.error(result?.message || "Failed to create assignment");
        }
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Request failed");
      console.error("Assignment request error:", error);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[1000] !mt-0 grid h-screen w-screen place-items-center overflow-auto bg-white bg-opacity-10 backdrop-blur-sm">
      <div className="my-10 w-11/12 max-w-[800px] rounded-lg border border-richblack-400 bg-richblack-800">
        {/* Modal Header */}
        <div className="flex items-center justify-between rounded-t-lg bg-richblack-700 p-5">
          <p className="text-xl font-semibold text-richblack-5">
            {view && "Viewing"} {add && "Adding"} {edit && "Editing"} Assignment/Quiz
          </p>
          <button onClick={() => (!loading ? setModalData(null) : {})}>
            <RxCross2 className="text-2xl text-richblack-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 px-8 py-10">
          {/* Assignment Type */}
          <div className="flex flex-col space-y-2">
            <label className="text-sm text-richblack-5" htmlFor="type">
              Type <sup className="text-pink-200">*</sup>
            </label>
            <select
              disabled={view || loading}
              id="type"
              {...register("type", { required: true })}
              className="form-style w-full"
            >
              <option value="">Select Type</option>
              <option value="Assignment">Assignment</option>
              <option value="Quiz">Quiz</option>
            </select>
            {errors.type && (
              <span className="ml-2 text-xs tracking-wide text-pink-200">
                Type is required
              </span>
            )}
          </div>

          {/* Title */}
          <div className="flex flex-col space-y-2">
            <label className="text-sm text-richblack-5" htmlFor="title">
              Title <sup className="text-pink-200">*</sup>
            </label>
            <input
              disabled={view || loading}
              id="title"
              placeholder="Enter assignment/quiz title"
              {...register("title", { required: true })}
              className="form-style w-full"
            />
            {errors.title && (
              <span className="ml-2 text-xs tracking-wide text-pink-200">
                Title is required
              </span>
            )}
          </div>

          {/* Description */}
          <div className="flex flex-col space-y-2">
            <label className="text-sm text-richblack-5" htmlFor="description">
              Description <sup className="text-pink-200">*</sup>
            </label>
            <textarea
              disabled={view || loading}
              id="description"
              placeholder="Enter assignment/quiz description"
              {...register("description", { required: true })}
              className="form-style resize-x-none min-h-[100px] w-full"
            />
            {errors.description && (
              <span className="ml-2 text-xs tracking-wide text-pink-200">
                Description is required
              </span>
            )}
          </div>

          {/* Max Marks */}
          <div className="flex flex-col space-y-2">
            <label className="text-sm text-richblack-5" htmlFor="maxMarks">
              Max Marks <sup className="text-pink-200">*</sup>
            </label>
            <input
              disabled={view || loading}
              id="maxMarks"
              type="number"
              min="1"
              placeholder="Enter maximum marks"
              {...register("maxMarks", { required: true, min: 1 })}
              className="form-style w-full"
            />
            {errors.maxMarks && (
              <span className="ml-2 text-xs tracking-wide text-pink-200">
                Max marks is required and must be at least 1
              </span>
            )}
          </div>

          {/* Due Date */}
          <div className="flex flex-col space-y-2">
            <label className="text-sm text-richblack-5" htmlFor="dueDate">
              Due Date <sup className="text-pink-200">*</sup>
            </label>
            <input
              disabled={view || loading}
              id="dueDate"
              type="date"
              {...register("dueDate", { required: true })}
              className="form-style w-full"
            />
            {errors.dueDate && (
              <span className="ml-2 text-xs tracking-wide text-pink-200">
                Due date is required
              </span>
            )}
          </div>

          {/* Instructions */}
          <div className="flex flex-col space-y-2">
            <label className="text-sm text-richblack-5" htmlFor="instructions">
              Instructions <sup className="text-pink-200">*</sup>
            </label>
            <textarea
              disabled={view || loading}
              id="instructions"
              placeholder="Enter detailed instructions"
              {...register("instructions", { required: true })}
              className="form-style resize-x-none min-h-[100px] w-full"
            />
            {errors.instructions && (
              <span className="ml-2 text-xs tracking-wide text-pink-200">
                Instructions are required
              </span>
            )}
          </div>

          {/* Quiz Questions */}
          {assignmentType === "Quiz" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm text-richblack-5">Quiz Questions</label>
                {!view && (
                  <button
                    type="button"
                    onClick={addQuestion}
                    className="rounded-md bg-yellow-50 px-3 py-1 text-sm font-medium text-richblack-900"
                  >
                    Add Question
                  </button>
                )}
              </div>

              {questions.map((question, index) => (
                <div key={index} className="rounded-md border border-richblack-600 bg-richblack-700 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm font-medium text-richblack-5">
                      Question {index + 1}
                    </span>
                    {!view && (
                      <button
                        type="button"
                        onClick={() => removeQuestion(index)}
                        className="text-pink-200 hover:text-pink-100"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Enter question"
                      value={question.question}
                      onChange={(e) => updateQuestion(index, "question", e.target.value)}
                      disabled={view}
                      className="form-style w-full"
                    />

                    <div className="space-y-2">
                      <p className="text-sm text-richblack-300 mb-2">Select the correct answer:</p>
                      {question.options.map((option, optIndex) => (
                        <div key={optIndex} className="flex items-center space-x-2">
                          <input
                            type="radio"
                            name={`correctAnswer_${index}`}
                            checked={question.correctAnswer === optIndex}
                            onChange={() => updateQuestion(index, "correctAnswer", optIndex)}
                            disabled={view}
                            className="text-yellow-50"
                          />
                          <input
                            type="text"
                            placeholder={`Option ${optIndex + 1}`}
                            value={option}
                            onChange={(e) => {
                              const newOptions = [...question.options];
                              newOptions[optIndex] = e.target.value;
                              updateQuestion(index, "options", newOptions);
                            }}
                            disabled={view}
                            className={`form-style flex-1 ${question.correctAnswer === optIndex ? 'border-green-400 bg-green-50' : ''}`}
                          />
                          {question.correctAnswer === optIndex && (
                            <span className="text-green-400 text-sm font-medium">✓ Correct</span>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center space-x-2">
                      <label className="text-sm text-richblack-5">Marks:</label>
                      <input
                        type="number"
                        min="1"
                        value={question.marks}
                        onChange={(e) => updateQuestion(index, "marks", parseInt(e.target.value))}
                        disabled={view}
                        className="form-style w-20"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!view && (
            <div className="flex justify-end">
              <IconBtn
                disabled={loading}
                text={loading ? (edit ? "Updating..." : "Creating...") : (edit ? "Update" : "Create Assignment")}
              />
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
