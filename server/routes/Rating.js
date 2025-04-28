const express = require("express");
const router = express.Router();
const { auth, isStudent } = require("../middlewares/auth");
const {
  createRating,
  getAverageRating,
  getAllRating,
} = require("../controllers/RatingAndReview");

// Rating and Review Routes
router.post("/createRating", auth, isStudent, createRating);
router.get("/getAverageRating", getAverageRating);
router.get("/getReviews", getAllRating);

module.exports = router; 