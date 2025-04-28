const RatingAndReview = require("../models/RatingAndReview");
const Course = require("../models/Course");
const { mongo, default: mongoose } = require("mongoose");

//createRating
exports.createRating = async (req, res) => {
    try {
        // Get user id
        const userId = req.user.id;
        // Fetch data from req body
        const {rating, review, courseId} = req.body;
        
        console.log("Received request data:", { 
            userId, 
            courseId, 
            rating, 
            review 
        });

        // Basic validation
        if (!rating || !review || !courseId) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required: rating, review, and courseId'
            });
        }

        // Convert rating to number if it's a string
        const ratingNumber = Number(rating);

        // Validate rating value
        if (isNaN(ratingNumber) || ratingNumber < 1 || ratingNumber > 5) {
            return res.status(400).json({
                success: false,
                message: 'Rating must be a number between 1 and 5'
            });
        }

        // Find course and check enrollment
        const course = await Course.findById(courseId)
            .populate('studentsEnroled', '_id')
            .exec();
        
        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        // Check if user is enrolled
        const isEnrolled = course.studentsEnroled?.some(
            student => student._id.toString() === userId.toString()
        );

        console.log("Enrollment check:", {
            userId: userId.toString(),
            isEnrolled,
            enrolledStudents: course.studentsEnroled?.map(s => s._id.toString()) || [],
            totalEnrolled: course.studentsEnroled?.length || 0
        });

        if (!isEnrolled) {
            return res.status(403).json({
                success: false,
                message: 'You must be enrolled in this course to leave a review'
            });
        }

        // Check if user has already reviewed this course
        const existingReview = await RatingAndReview.findOne({
            user: userId,
            course: courseId
        });

        if (existingReview) {
            return res.status(403).json({
                success: false,
                message: 'You have already reviewed this course'
            });
        }

        // Create the review
        const ratingReview = await RatingAndReview.create({
            rating: ratingNumber,
            review,
            course: courseId,
            user: userId
        });

        // Update course with the new review
        await Course.findByIdAndUpdate(
            courseId,
            {
                $push: { ratingAndReviews: ratingReview._id }
            },
            { new: true }
        );

        return res.status(200).json({
            success: true,
            message: "Review submitted successfully",
            data: ratingReview
        });

    } catch (error) {
        console.error("Error in createRating:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to submit review. Please try again."
        });
    }
}



//getAverageRating
exports.getAverageRating = async (req, res) => {
    try {
            //get course ID
            const courseId = req.body.courseId;
            //calculate avg rating

            const result = await RatingAndReview.aggregate([
                {
                    $match:{
                        course: new mongoose.Types.ObjectId(courseId),
                    },
                },
                {
                    $group:{
                        _id:null,
                        averageRating: { $avg: "$rating"},
                    }
                }
            ])

            //return rating
            if(result.length > 0) {

                return res.status(200).json({
                    success:true,
                    averageRating: result[0].averageRating,
                })

            }
            
            //if no rating/Review exist
            return res.status(200).json({
                success:true,
                message:'Average Rating is 0, no ratings given till now',
                averageRating:0,
            })
    }
    catch(error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
}


//getAllRatingAndReviews

exports.getAllRating = async (req, res) => {
    try{
            const allReviews = await RatingAndReview.find({})
                                    .sort({rating: "desc"})
                                    .populate({
                                        path:"user",
                                        select:"firstName lastName email image",
                                    })
                                    .populate({
                                        path:"course",
                                        select: "courseName",
                                    })
                                    .exec();
            return res.status(200).json({
                success:true,
                message:"All reviews fetched successfully",
                data:allReviews,
            });
    }   
    catch(error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    } 
}