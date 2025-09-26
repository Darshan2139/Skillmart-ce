import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { FaPlus, FaEdit, FaTrash, FaTag } from "react-icons/fa";

import { 
  getUserCategories, 
  createCategory, 
  updateCategory, 
  deleteCategory 
} from "../../../../services/operations/categoryAPI";
import CategoryModal from "./CategoryModal";

export default function CategoryManagement() {
  const { token } = useSelector((state) => state.auth);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  useEffect(() => {
    if (token) {
      fetchCategories();
    }
  }, [token]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await getUserCategories(token);
      if (response?.success) {
        setCategories(response.data);
      }
    } catch (error) {
      toast.error("Failed to fetch categories");
      console.error("Error fetching categories:", error);
    }
    setLoading(false);
  };

  const handleCreateCategory = async (categoryData) => {
    try {
      const payload = { 
        name: categoryData.name?.trim(), 
        description: categoryData.description?.trim() 
      };
      const response = await createCategory(payload, token);
      if (response?.success) {
        toast.success("Category created successfully");
        setShowModal(false);
        fetchCategories();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create category");
      console.error("Error creating category:", error);
    }
  };

  const handleUpdateCategory = async (categoryId, categoryData) => {
    try {
      const payload = { 
        name: categoryData.name?.trim(), 
        description: categoryData.description?.trim() 
      };
      const response = await updateCategory(categoryId, payload, token);
      if (response?.success) {
        toast.success("Category updated successfully");
        setShowModal(false);
        setEditingCategory(null);
        fetchCategories();
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || "Failed to update category";
      toast.error(message);
      console.error("Error updating category:", error.response?.data || error);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        const response = await deleteCategory(categoryId, token);
        if (response?.success) {
          toast.success("Category deleted successfully");
          fetchCategories();
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to delete category");
        console.error("Error deleting category:", error);
      }
    }
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCategory(null);
  };

  if (loading) {
    return (
      <div className="grid flex-1 place-items-center">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold text-richblack-5">My Categories</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded-md bg-yellow-50 px-4 py-2 text-sm font-medium text-richblack-900 hover:bg-yellow-100"
        >
          <FaPlus className="text-sm" />
          Create Category
        </button>
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-12">
          <FaTag className="mx-auto text-6xl text-richblack-400 mb-4" />
          <p className="text-xl text-richblack-300 mb-4">No categories created yet</p>
          <p className="text-richblack-400 mb-6">Create your first category to organize your courses</p>
          <button
            onClick={() => setShowModal(true)}
            className="rounded-md bg-yellow-50 px-6 py-2 text-sm font-medium text-richblack-900 hover:bg-yellow-100"
          >
            Create Your First Category
          </button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <div
              key={category._id}
              className="rounded-lg border border-richblack-600 bg-richblack-700 p-6 transition-all hover:shadow-lg"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FaTag className="text-yellow-400" />
                  <span className="text-sm font-medium text-richblack-300">
                    Custom Category
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditCategory(category)}
                    className="text-richblack-400 hover:text-yellow-400 transition-colors"
                  >
                    <FaEdit className="text-sm" />
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(category._id)}
                    className="text-richblack-400 hover:text-red-400 transition-colors"
                  >
                    <FaTrash className="text-sm" />
                  </button>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-richblack-5 mb-2">
                {category.name}
              </h3>

              {category.description && (
                <p className="text-sm text-richblack-300 mb-4 line-clamp-2">
                  {category.description}
                </p>
              )}

              <div className="text-sm text-richblack-400">
                <p>Courses: {category.courses?.length || 0}</p>
                <p>Created: {new Date(category.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Category Modal */}
      {showModal && (
        <CategoryModal
          category={editingCategory}
          onClose={handleCloseModal}
          onSubmit={editingCategory ? 
            (data) => handleUpdateCategory(editingCategory._id, data) : 
            handleCreateCategory
          }
        />
      )}
    </div>
  );
}
