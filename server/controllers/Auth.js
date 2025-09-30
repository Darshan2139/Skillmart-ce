const bcrypt = require("bcryptjs")
const User = require("../models/User")
const OTP = require("../models/OTP")
const jwt = require("jsonwebtoken")
const otpGenerator = require("otp-generator")
const mailSender = require("../utils/mailSender")
const { passwordUpdated } = require("../mail/templates/passwordUpdate")
const Profile = require("../models/Profile")
require("dotenv").config()

// Signup Controller for Registering USers

exports.signup = async (req, res) => {
  try {
    // Add a small delay to simulate processing time for better UX
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Destructure fields from the request body
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      accountType,
      contactNumber,
      otp,
    } = req.body

    // Enhanced validation with detailed error messages
    const validationErrors = []

    // Check if All Details are there or not
    if (!firstName || firstName.trim().length < 2) {
      validationErrors.push("First name must be at least 2 characters long")
    }
    if (!lastName || lastName.trim().length < 2) {
      validationErrors.push("Last name must be at least 2 characters long")
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      validationErrors.push("Please enter a valid email address")
    }
    if (!password || password.length < 8) {
      validationErrors.push("Password must be at least 8 characters long")
    }
    if (!confirmPassword) {
      validationErrors.push("Please confirm your password")
    }
    if (!otp || otp.length !== 6) {
      validationErrors.push("Please enter a valid 6-digit OTP")
    }

    // Check for special characters and numbers in password
    if (password && (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password))) {
      validationErrors.push("Password must contain at least one uppercase letter, one lowercase letter, and one number")
    }

    // Check if password and confirm password match
    if (password !== confirmPassword) {
      validationErrors.push("Password and Confirm Password do not match")
    }

    // Validate account type
    if (accountType && !["Student", "Instructor", "Admin"].includes(accountType)) {
      validationErrors.push("Invalid account type selected")
    }

    // Validate contact number if provided
    if (contactNumber && !/^[0-9+\-\s()]{10,15}$/.test(contactNumber)) {
      validationErrors.push("Please enter a valid contact number")
    }

    // Return validation errors if any
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Please fix the following errors:",
        errors: validationErrors,
        fieldErrors: {
          firstName: !firstName || firstName.trim().length < 2,
          lastName: !lastName || lastName.trim().length < 2,
          email: !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
          password: !password || password.length < 8 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password),
          confirmPassword: password !== confirmPassword,
          otp: !otp || otp.length !== 6,
          contactNumber: contactNumber && !/^[0-9+\-\s()]{10,15}$/.test(contactNumber)
        }
      })
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "An account with this email already exists. Please sign in to continue.",
        suggestion: "Try logging in instead or use a different email address"
      })
    }

    // Find the most recent OTP for the email with timeout check
    const response = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1)
    console.log("OTP verification for:", email)
    
    if (response.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No OTP found for this email. Please request a new OTP.",
        action: "resend_otp"
      })
    }

    // Check if OTP is expired (5 minutes)
    const otpAge = Date.now() - response[0].createdAt.getTime()
    const fiveMinutes = 5 * 60 * 1000
    
    if (otpAge > fiveMinutes) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new OTP.",
        action: "resend_otp"
      })
    }

    if (otp !== response[0].otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP. Please check and try again.",
        attempts: "You have limited attempts remaining"
      })
    }

    // Additional processing delay for better UX
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Hash the password with higher salt rounds for better security
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create the Additional Profile For User
    const profileDetails = await Profile.create({
      gender: null,
      dateOfBirth: null,
      about: null,
      contactNumber: contactNumber || null,
    })

    // Create the user with enhanced data
    const user = await User.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      contactNumber: contactNumber || null,
      password: hashedPassword,
      accountType: accountType || "Student",
      approved: true,
      additionalDetails: profileDetails._id,
      image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName.trim()} ${lastName.trim()}`,
    })

    // Clean up the used OTP
    await OTP.deleteOne({ _id: response[0]._id })

    // Remove sensitive data from response
    const userResponse = {
      ...user.toObject(),
      password: undefined,
      token: undefined
    }

    return res.status(200).json({
      success: true,
      user: userResponse,
      message: "Account created successfully! Welcome to SkillMart!",
      nextSteps: [
        "Complete your profile setup",
        "Explore available courses",
        "Start your learning journey"
      ]
    })
  } catch (error) {
    console.error("Signup error:", error)
    return res.status(500).json({
      success: false,
      message: "Registration failed. Please try again.",
      error: process.env.NODE_ENV === 'development' ? error.message : "Internal server error",
      support: "If the problem persists, please contact support"
    })
  }
}

// Login controller for authenticating users
exports.login = async (req, res) => {
  try {
    // Get email and password from request body
    const { email, password } = req.body

    // Check if email or password is missing
    if (!email || !password) {
      // Return 400 Bad Request status code with error message
      return res.status(400).json({
        success: false,
        message: `Please Fill up All the Required Fields`,
      })
    }

    // Find user with provided email
    const user = await User.findOne({ email }).populate("additionalDetails")

    // If user not found with provided email
    if (!user) {
      // Return 401 Unauthorized status code with error message
      return res.status(401).json({
        success: false,
        message: `User is not Registered with Us Please SignUp to Continue`,
      })
    }

    // Generate JWT token and Compare Password
    if (await bcrypt.compare(password, user.password)) {
      const token = jwt.sign(
        { email: user.email, id: user._id, accountType: user.accountType },
        process.env.JWT_SECRET,
        {
          expiresIn: "24h",
        }
      )

      // Save token to user document in database
      user.token = token
      user.password = undefined
      // Set cookie for token and return success response
      const options = {
        expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        httpOnly: true,
      }
      res.cookie("token", token, options).status(200).json({
        success: true,
        token,
        user,
        message: `User Login Success`,
      })
    } else {
      return res.status(401).json({
        success: false,
        message: `Password is incorrect`,
      })
    }
  } catch (error) {
    console.error(error)
    // Return 500 Internal Server Error status code with error message
    return res.status(500).json({
      success: false,
      message: `Login Failure Please Try Again`,
    })
  }
}
// Send OTP For Email Verification
exports.sendotp = async (req, res) => {
  try {
    // Add processing delay for better UX
    await new Promise(resolve => setTimeout(resolve, 800))

    const { email } = req.body

    // Enhanced email validation
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address",
        field: "email"
      })
    }

    // Check if user is already present
    const checkUserPresent = await User.findOne({ email })
    
    // If user found with provided email
    if (checkUserPresent) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
        suggestion: "Try logging in instead or use a different email address",
        action: "login"
      })
    }

    // Check for recent OTP requests to prevent spam
    const recentOTP = await OTP.findOne({ 
      email: email.toLowerCase().trim(), 
      createdAt: { $gte: new Date(Date.now() - 60000) } // Last 1 minute
    })

    if (recentOTP) {
      return res.status(429).json({
        success: false,
        message: "Please wait before requesting another OTP",
        retryAfter: 60,
        suggestion: "Check your email for the previous OTP or wait 1 minute"
      })
    }

    // Generate unique OTP
    let otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    })

    // Ensure OTP is unique
    let result = await OTP.findOne({ otp: otp })
    let attempts = 0
    while (result && attempts < 10) {
      otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      })
      result = await OTP.findOne({ otp: otp })
      attempts++
    }

    if (attempts >= 10) {
      return res.status(500).json({
        success: false,
        message: "Unable to generate unique OTP. Please try again.",
        support: "Contact support if this issue persists"
      })
    }

    // Clean up old OTPs for this email
    await OTP.deleteMany({ email })

    // Create new OTP
    const otpPayload = { email: email.toLowerCase().trim(), otp }
    const otpBody = await OTP.create(otpPayload)
    
    console.log("OTP generated for:", email)
    console.log("OTP:", otp)
    console.log("Expires at:", new Date(otpBody.createdAt.getTime() + 5 * 60 * 1000))

    // Additional processing delay
    await new Promise(resolve => setTimeout(resolve, 500))

    res.status(200).json({
      success: true,
      message: "OTP sent successfully to your email",
      email: email,
      expiresIn: "5 minutes",
      instructions: [
        "Check your email inbox",
        "Enter the 6-digit code",
        "Complete your registration"
      ],
      // Only include OTP in development
      ...(process.env.NODE_ENV === 'development' && { otp })
    })
  } catch (error) {
    console.error("OTP generation error:", error)
    return res.status(500).json({ 
      success: false, 
      message: "Failed to send OTP. Please try again.",
      error: process.env.NODE_ENV === 'development' ? error.message : "Internal server error",
      support: "Contact support if this issue persists"
    })
  }
}

// Controller for Changing Password
exports.changePassword = async (req, res) => {
  try {
    // Get user data from req.user
    const userDetails = await User.findById(req.user.id)

    // Get old password, new password, and confirm new password from req.body
    const { oldPassword, newPassword } = req.body

    // Validate old password
    const isPasswordMatch = await bcrypt.compare(
      oldPassword,
      userDetails.password
    )
    if (!isPasswordMatch) {
      // If old password does not match, return a 401 (Unauthorized) error
      return res
        .status(401)
        .json({ success: false, message: "The password is incorrect" })
    }

    // Update password
    const encryptedPassword = await bcrypt.hash(newPassword, 10)
    const updatedUserDetails = await User.findByIdAndUpdate(
      req.user.id,
      { password: encryptedPassword },
      { new: true }
    )

    // Send notification email
    try {
      const emailResponse = await mailSender(
        updatedUserDetails.email,
        "Password for your account has been updated",
        passwordUpdated(
          updatedUserDetails.email,
          `Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
        )
      )
      console.log("Email sent successfully:", emailResponse)
    } catch (error) {
      // If there's an error sending the email, log the error and return a 500 (Internal Server Error) error
      console.error("Error occurred while sending email:", error)
      return res.status(500).json({
        success: false,
        message: "Error occurred while sending email",
        error: error.message,
      })
    }

    // Return success response
    return res
      .status(200)
      .json({ success: true, message: "Password updated successfully" })
  } catch (error) {
    // If there's an error updating the password, log the error and return a 500 (Internal Server Error) error
    console.error("Error occurred while updating password:", error)
    return res.status(500).json({
      success: false,
      message: "Error occurred while updating password",
      error: error.message,
    })
  }
}