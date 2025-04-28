import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { RxCross2 } from "react-icons/rx"
import ReactStars from "react-rating-stars-component"
import { useSelector } from "react-redux"
import { toast } from "react-hot-toast"

import { createRating } from "../../../services/operations/courseDetailsAPI"
import IconBtn from "../../common/IconBtn"

export default function CourseReviewModal({ setReviewModal }) {
  const { user } = useSelector((state) => state.profile)
  const { token } = useSelector((state) => state.auth)
  const { courseEntireData } = useSelector((state) => state.viewCourse)
  const [loading, setLoading] = useState(false)
  const [rating, setRating] = useState(0)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm()

  useEffect(() => {
    setValue("courseExperience", "")
    setValue("courseRating", 0)
  }, [setValue])

  const ratingChanged = (newRating) => {
    setRating(newRating)
    setValue("courseRating", newRating)
  }

  const onSubmit = async (data) => {
    if (rating === 0) {
      toast.error("Please provide a rating")
      return
    }

    if (!data.courseExperience?.trim()) {
      toast.error("Please provide a review")
      return
    }

    if (!courseEntireData?._id) {
      toast.error("Course information is missing")
      return
    }

    setLoading(true)
    try {
      const formData = {
        courseId: courseEntireData._id,
        rating: rating,
        review: data.courseExperience.trim(),
      }

      console.log("Submitting review:", {
        courseId: courseEntireData._id,
        courseName: courseEntireData.courseName,
        rating: rating,
        review: data.courseExperience.trim()
      })

      const result = await createRating(formData, token)
      if (result?.success) {
        toast.success("Review submitted successfully")
        setReviewModal(false)
      } else {
        toast.error(result?.message || "Failed to submit review")
      }
    } catch (error) {
      console.error("Error submitting review:", error)
      toast.error(error?.message || "Failed to submit review. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Check if we have the required data
  useEffect(() => {
    if (!courseEntireData?._id) {
      console.log("Missing course data:", courseEntireData)
      toast.error("Unable to load course data")
      setReviewModal(false)
    }
  }, [courseEntireData, setReviewModal])

  return (
    <div className="fixed inset-0 z-[1000] !mt-0 grid h-screen w-screen place-items-center overflow-auto bg-white bg-opacity-10 backdrop-blur-sm">
      <div className="my-10 w-11/12 max-w-[700px] rounded-lg border border-richblack-400 bg-richblack-800">
        {/* Modal Header */}
        <div className="flex items-center justify-between rounded-t-lg bg-richblack-700 p-5">
          <p className="text-xl font-semibold text-richblack-5">Add Review</p>
          <button 
            onClick={() => setReviewModal(false)}
            disabled={loading}
            className="text-2xl text-richblack-5 hover:text-richblack-25 transition-colors"
          >
            <RxCross2 />
          </button>
        </div>
        {/* Modal Body */}
        <div className="p-6">
          <div className="flex items-center justify-center gap-x-4">
            <img
              src={user?.image}
              alt={user?.firstName + "profile"}
              className="aspect-square w-[50px] rounded-full object-cover"
            />
            <div className="">
              <p className="font-semibold text-richblack-5">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-sm text-richblack-5">
                Reviewing: {courseEntireData?.courseName}
              </p>
            </div>
          </div>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mt-6 flex flex-col items-center"
          >
            <div className="flex flex-col items-center gap-y-2">
              <p className="text-sm text-richblack-5">Course Rating</p>
              <ReactStars
                count={5}
                onChange={ratingChanged}
                size={24}
                value={rating}
                activeColor="#ffd700"
              />
              {rating === 0 && (
                <p className="text-xs text-pink-200">Please provide a rating</p>
              )}
            </div>
            <div className="mt-4 flex w-11/12 flex-col space-y-2">
              <label
                className="text-sm text-richblack-5"
                htmlFor="courseExperience"
              >
                Add Your Experience <sup className="text-pink-200">*</sup>
              </label>
              <textarea
                id="courseExperience"
                placeholder="Tell us about your experience with this course..."
                {...register("courseExperience", { 
                  required: "Please share your experience",
                  minLength: {
                    value: 10,
                    message: "Review must be at least 10 characters long"
                  }
                })}
                className="form-style resize-x-none min-h-[130px] w-full p-3 text-richblack-5 bg-richblack-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-richblack-25"
                disabled={loading}
              />
              {errors.courseExperience && (
                <span className="ml-2 text-xs tracking-wide text-pink-200">
                  {errors.courseExperience.message}
                </span>
              )}
            </div>
            <div className="mt-6 flex w-11/12 justify-end gap-x-2">
              <button
                onClick={() => setReviewModal(false)}
                className={`flex cursor-pointer items-center gap-x-2 rounded-md bg-richblack-300 py-[8px] px-[20px] font-semibold text-richblack-900 hover:bg-richblack-200 transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                type="button"
                disabled={loading}
              >
                Cancel
              </button>
              <IconBtn 
                text={loading ? "Submitting..." : "Submit Review"}
                disabled={loading}
                type="submit"
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}