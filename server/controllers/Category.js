const { Mongoose } = require("mongoose");
const Category = require("../models/Category");
function getRandomInt(max) {
    return Math.floor(Math.random() * max)
  }

exports.createCategory = async (req, res) => {
	try {
		let { name, description } = req.body;
		name = (name || "").trim();
		description = (description || "").trim();
		if (!name) {
			return res
				.status(400)
				.json({ success: false, message: "Category name is required" });
		}

		// Check if category already exists for this user (case-insensitive)
		const existingCategory = await Category.findOne({ 
			name: { $regex: new RegExp(`^${name}$`, 'i') },
			createdBy: req.user.id,
		});
		
		if (existingCategory) {
			return res.status(400).json({
				success: false,
				message: "Category with this name already exists",
			});
		}

		const CategorysDetails = await Category.create({
			name: name,
			description: description,
			createdBy: req.user.id,
			isSystemCategory: false,
		});
		
		console.log(CategorysDetails);
		return res.status(200).json({
			success: true,
			message: "Category Created Successfully",
			data: CategorysDetails,
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};

exports.showAllCategories = async (req, res) => {
	try {
        console.log("INSIDE SHOW ALL CATEGORIES");
		// Get all system categories and user-created categories
		const allCategorys = await Category.find({})
			.sort({ isSystemCategory: -1, createdAt: -1 })
			.lean();
		
		res.status(200).json({
			success: true,
			data: allCategorys,
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};

// Get user's own categories
exports.getUserCategories = async (req, res) => {
	try {
		const userCategories = await Category.find({ 
			createdBy: req.user.id 
		})
			.sort({ createdAt: -1 })
			.lean();
		
		res.status(200).json({
			success: true,
			data: userCategories,
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};

// Update category
exports.updateCategory = async (req, res) => {
	try {
		const { categoryId } = req.params;
		const { name, description } = req.body;

		const category = await Category.findById(categoryId);
		if (!category) {
			return res.status(404).json({
				success: false,
				message: "Category not found",
			});
		}

		// Check if user owns this category or is admin
		if (category.createdBy.toString() !== req.user.id && req.user.accountType !== "Admin") {
			return res.status(403).json({
				success: false,
				message: "You can only update your own categories",
			});
		}

		// Check if name already exists for this user (excluding current category)
		if (name && name !== category.name) {
			const existingCategory = await Category.findOne({ 
				name: { $regex: new RegExp(`^${name}$`, 'i') },
				createdBy: req.user.id,
				_id: { $ne: categoryId }
			});
			
			if (existingCategory) {
				return res.status(400).json({
					success: false,
					message: "Category with this name already exists",
				});
			}
		}

		const updatedCategory = await Category.findByIdAndUpdate(
			categoryId,
			{ name, description },
			{ new: true }
		).lean();

		res.status(200).json({
			success: true,
			message: "Category updated successfully",
			data: updatedCategory,
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};

// Delete category
exports.deleteCategory = async (req, res) => {
	try {
		const { categoryId } = req.params;

		const category = await Category.findById(categoryId);
		if (!category) {
			return res.status(404).json({
				success: false,
				message: "Category not found",
			});
		}

		// Check if user owns this category or is admin
		if (category.createdBy.toString() !== req.user.id && req.user.accountType !== "Admin") {
			return res.status(403).json({
				success: false,
				message: "You can only delete your own categories",
			});
		}

		// Check if category has courses
		if (category.courses.length > 0) {
			return res.status(400).json({
				success: false,
				message: "Cannot delete category that has courses. Please move or delete courses first.",
			});
		}

		await Category.findByIdAndDelete(categoryId);

		res.status(200).json({
			success: true,
			message: "Category deleted successfully",
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};

//categoryPageDetails 

exports.categoryPageDetails = async (req, res) => {
    try {
      const { categoryId } = req.body
      console.log("PRINTING CATEGORY ID: ", categoryId);
      // Get courses for the specified category
      const selectedCategory = await Category.findById(categoryId)
        .populate({
          path: "courses",
          match: { status: "Published" },
          populate: "ratingAndReviews",
        })
        .exec()
  
      //console.log("SELECTED COURSE", selectedCategory)
      // Handle the case when the category is not found
      if (!selectedCategory) {
        console.log("Category not found.")
        return res
          .status(404)
          .json({ success: false, message: "Category not found" })
      }
      // Handle the case when there are no courses
      if (selectedCategory.courses.length === 0) {
        console.log("No courses found for the selected category.")
        return res.status(404).json({
          success: false,
          message: "No courses found for the selected category.",
        })
      }
  
      // Get courses for other categories
      const categoriesExceptSelected = await Category.find({
        _id: { $ne: categoryId },
      })
      let differentCategory = await Category.findOne(
        categoriesExceptSelected[getRandomInt(categoriesExceptSelected.length)]
          ._id
      )
        .populate({
          path: "courses",
          match: { status: "Published" },
        })
        .exec()
        //console.log("Different COURSE", differentCategory)
      // Get top-selling courses across all categories
      const allCategories = await Category.find()
        .populate({
          path: "courses",
          match: { status: "Published" },
          populate: {
            path: "instructor",
        },
        })
        .exec()
      const allCourses = allCategories.flatMap((category) => category.courses)
      const mostSellingCourses = allCourses
        .sort((a, b) => b.sold - a.sold)
        .slice(0, 10)
       // console.log("mostSellingCourses COURSE", mostSellingCourses)
      res.status(200).json({
        success: true,
        data: {
          selectedCategory,
          differentCategory,
          mostSellingCourses,
        },
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      })
    }
  }