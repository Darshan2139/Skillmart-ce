const { instance } = require("../config/razorpay")
const Course = require("../models/Course")
const crypto = require("crypto")
const User = require("../models/User")
const mailSender = require("../utils/mailSender")
const mongoose = require("mongoose")
const {
  courseEnrollmentEmail,
} = require("../mail/templates/courseEnrollmentEmail")
const { paymentSuccessEmail } = require("../mail/templates/paymentSuccessEmail")
const CourseProgress = require("../models/CourseProgress")

// Capture the payment and initiate the Razorpay order
exports.capturePayment = async (req, res) => {
  try {
    const { courses } = req.body;
    const userId = req.user.id;
    
    if (!courses || !Array.isArray(courses) || courses.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Please provide valid course IDs" 
      });
    }

    let total_amount = 0;

    // Process each course
    for (const courseId of courses) {
      try {
        // Find the course by its ID
        const course = await Course.findById(courseId);
        if (!course) {
          return res.status(404).json({ 
            success: false, 
            message: `Could not find course with id: ${courseId}` 
          });
        }

        // Check if user is already enrolled
        const uid = new mongoose.Types.ObjectId(userId);
        if (course.studentsEnroled && course.studentsEnroled.includes(uid)) {
          return res.status(400).json({ 
            success: false, 
            message: `You are already enrolled in course: ${course.courseName}` 
          });
        }

        // Add the price
        total_amount += course.price;

      } catch (error) {
        console.error("Error processing course:", error);
        return res.status(500).json({ 
          success: false, 
          message: "Error processing course information"
        });
      }
    }

    if (total_amount === 0) {
      return res.status(400).json({
        success: false,
        message: "Total amount cannot be zero"
      });
    }

    // Create Razorpay order
    try {
      const options = {
        amount: Math.round(total_amount * 100),
        currency: "INR",
        receipt: `receipt_${Math.random().toString(36).substring(7)}`,
        notes: {
          userId: userId.toString()
        }
      };

      const order = await instance.orders.create(options);

      return res.json({
        success: true,
        message: {
          orderId: order.id,
          amount: order.amount,
          currency: order.currency
        }
      });
    } catch (error) {
      console.error("Razorpay Order Error:", error);
      return res.status(500).json({
        success: false,
        message: "Could not create order"
      });
    }
  } catch (error) {
    console.error("Payment Capture Error:", error);
    return res.status(500).json({
      success: false,
      message: "Could not process payment request"
    });
  }
}

// verify the payment
exports.verifyPayment = async (req, res) => {
  const razorpay_order_id = req.body?.razorpay_order_id
  const razorpay_payment_id = req.body?.razorpay_payment_id
  const razorpay_signature = req.body?.razorpay_signature
  const courses = req.body?.courses

  const userId = req.user.id

  if (
    !razorpay_order_id ||
    !razorpay_payment_id ||
    !razorpay_signature ||
    !courses ||
    !userId
  ) {
    return res.status(200).json({ success: false, message: "Payment Failed" })
  }

  let body = razorpay_order_id + "|" + razorpay_payment_id

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_SECRET)
    .update(body.toString())
    .digest("hex")

  if (expectedSignature === razorpay_signature) {
    await enrollStudents(courses, userId, res)
    return res.status(200).json({ success: true, message: "Payment Verified" })
  }

  return res.status(200).json({ success: false, message: "Payment Failed" })
}

// Send Payment Success Email
exports.sendPaymentSuccessEmail = async (req, res) => {
  const { orderId, paymentId, amount } = req.body

  const userId = req.user.id

  if (!orderId || !paymentId || !amount || !userId) {
    return res
      .status(400)
      .json({ success: false, message: "Please provide all the details" })
  }

  try {
    const enrolledStudent = await User.findById(userId)

    await mailSender(
      enrolledStudent.email,
      `Payment Received`,
      paymentSuccessEmail(
        `${enrolledStudent.firstName} ${enrolledStudent.lastName}`,
        amount / 100,
        orderId,
        paymentId
      )
    )
  } catch (error) {
    console.log("error in sending mail", error)
    return res
      .status(400)
      .json({ success: false, message: "Could not send email" })
  }
}

// enroll the student in the courses
const enrollStudents = async (courses, userId, res) => {
  if (!courses || !userId) {
    return res
      .status(400)
      .json({ success: false, message: "Please Provide Course ID and User ID" })
  }

  for (const courseId of courses) {
    try {
      // Find the course and enroll the student in it
      const enrolledCourse = await Course.findOneAndUpdate(
        { _id: courseId },
        { $push: { studentsEnroled: userId } },
        { new: true }
      )

      if (!enrolledCourse) {
        return res
          .status(500)
          .json({ success: false, error: "Course not found" })
      }
      console.log("Updated course: ", enrolledCourse)

      const courseProgress = await CourseProgress.create({
        courseID: courseId,
        userId: userId,
        completedVideos: [],
      })
      // Find the student and add the course to their list of enrolled courses
      const enrolledStudent = await User.findByIdAndUpdate(
        userId,
        {
          $push: {
            courses: courseId,
            courseProgress: courseProgress._id,
          },
        },
        { new: true }
      )

      console.log("Enrolled student: ", enrolledStudent)
      // Send an email notification to the enrolled student
      const emailResponse = await mailSender(
        enrolledStudent.email,
        `Successfully Enrolled into ${enrolledCourse.courseName}`,
        courseEnrollmentEmail(
          enrolledCourse.courseName,
          `${enrolledStudent.firstName} ${enrolledStudent.lastName}`
        )
      )

      console.log("Email sent successfully: ", emailResponse.response)
    } catch (error) {
      console.log(error)
      return res.status(400).json({ success: false, error: error.message })
    }
  }
}