import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { fetchInstructorCourses } from '../../../../services/operations/courseDetailsAPI'
import { getInstructorData } from '../../../../services/operations/profileAPI'
import InstructorChart from './InstructorChart'

export default function Instructor() {
  const { token } = useSelector((state) => state.auth)
  const { user } = useSelector((state) => state.profile)
  const [loading, setLoading] = useState(true)
  const [instructorData, setInstructorData] = useState([])
  const [courses, setCourses] = useState([])
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalAmount: 0,
    totalCourses: 0
  })

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch instructor data
      const instructorApiData = await getInstructorData(token)
      console.log("Instructor API Data:", instructorApiData)
      
      if (instructorApiData) {
        setInstructorData(instructorApiData.courses)
        setStats(instructorApiData.stats)
      }

      // Fetch course data
      const coursesData = await fetchInstructorCourses(token)
      setCourses(coursesData || [])
    } catch (error) {
      console.error("Error fetching instructor data:", error)
      setInstructorData([])
      setCourses([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) {
      // Initial fetch
      fetchData()

      // Set up polling every 30 seconds
      const intervalId = setInterval(fetchData, 30000)

      // Cleanup function to clear interval when component unmounts
      return () => clearInterval(intervalId)
    }
  }, [token])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="text-white">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-richblack-5">
          Hi {user?.firstName || 'Instructor'} 👋
        </h1>
        <p className="font-medium text-richblack-200">
          Let's start something new
        </p>
      </div>

      <div className="my-4 flex h-[450px] space-x-4">
        {/* Visualize Section */}
        <div className="flex-1 rounded-md bg-richblack-800 p-6">
          {stats.totalAmount > 0 || stats.totalStudents > 0 ? (
            <div style={{ height: 250, width: 250, margin: "0 auto" }}>
              <InstructorChart courses={instructorData || []} />
            </div>
          ) : (
            <div>
              <p className="text-lg font-bold text-richblack-5">Visualize</p>
              <p className="mt-4 text-xl font-medium text-richblack-50">
                Not Enough Data To Visualize
              </p>
            </div>
          )}
        </div>

        {/* Statistics Section */}
        <div className="flex min-w-[250px] flex-col rounded-md bg-richblack-800 p-6">
          <p className="text-lg font-bold text-richblack-5">Statistics</p>
          <div className="mt-4 space-y-4">
            <div>
              <p className="text-lg text-richblack-200">Total Courses</p>
              <p className="text-3xl font-semibold text-richblack-50">
                {stats.totalCourses}
              </p>
            </div>
            <div>
              <p className="text-lg text-richblack-200">Total Students</p>
              <p className="text-3xl font-semibold text-richblack-50">
                {stats.totalStudents}
              </p>
            </div>
            <div>
              <p className="text-lg text-richblack-200">Total Income</p>
              <p className="text-3xl font-semibold text-richblack-50">
                Rs. {stats.totalAmount}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Courses Section */}
      <div className="rounded-md bg-richblack-800 p-6">
        <div className="flex items-center justify-between">
          <p className="text-lg font-bold text-richblack-5">Your Courses</p>
          <Link to="/dashboard/my-courses">
            <p className="text-xs font-semibold text-yellow-50">View All</p>
          </Link>
        </div>
        
        {courses && courses.length > 0 ? (
          <div className="my-4 flex items-start space-x-6">
            {courses.slice(0, 3).map((course) => (
              <div key={course?._id} className="w-1/3">
                <img
                  src={course?.thumbnail}
                  alt={course?.courseName || 'Course'}
                  className="h-[201px] w-full rounded-md object-cover"
                />
                <div className="mt-3 w-full">
                  <p className="text-sm font-medium text-richblack-50">
                    {course?.courseName}
                  </p>
                  <div className="mt-1 flex items-center space-x-2">
                    <span>{course?.studentsEnroled?.length ?? 0} students</span>
                    <p className="text-xs font-medium text-richblack-300">|</p>
                    <span>{course?.price ?? 0}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-10 text-center text-richblack-50">
            <p>You haven't created any courses yet</p>
            <Link to="/dashboard/add-course">
              <button className="mt-4 px-4 py-2 rounded-md bg-yellow-50 text-richblack-900 font-semibold">
                Create Your First Course
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}