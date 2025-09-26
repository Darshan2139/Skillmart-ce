import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { RxCross2 } from "react-icons/rx";

import IconBtn from "../../../common/IconBtn";

export default function CategoryModal({ category, onClose, onSubmit }) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (category) {
      setValue("name", category.name);
      setValue("description", category.description || "");
    }
  }, [category, setValue]);

  const handleFormSubmit = async (data) => {
    setLoading(true);
    try {
      await onSubmit(data);
    } catch (error) {
      console.error("Error submitting form:", error);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[1000] !mt-0 grid h-screen w-screen place-items-center overflow-auto bg-white bg-opacity-10 backdrop-blur-sm">
      <div className="my-10 w-11/12 max-w-[500px] rounded-lg border border-richblack-400 bg-richblack-800">
        {/* Modal Header */}
        <div className="flex items-center justify-between rounded-t-lg bg-richblack-700 p-5">
          <h2 className="text-xl font-semibold text-richblack-5">
            {category ? "Edit Category" : "Create New Category"}
          </h2>
          <button onClick={onClose} disabled={loading}>
            <RxCross2 className="text-2xl text-richblack-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-6">
          {/* Category Name */}
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-richblack-5" htmlFor="name">
              Category Name <sup className="text-pink-200">*</sup>
            </label>
            <input
              id="name"
              disabled={loading}
              placeholder="Enter category name"
              {...register("name", { 
                required: "Category name is required",
                minLength: {
                  value: 2,
                  message: "Category name must be at least 2 characters"
                },
                maxLength: {
                  value: 50,
                  message: "Category name must be less than 50 characters"
                }
              })}
              className="form-style w-full"
            />
            {errors.name && (
              <span className="ml-2 text-xs tracking-wide text-pink-200">
                {errors.name.message}
              </span>
            )}
          </div>

          {/* Category Description */}
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-richblack-5" htmlFor="description">
              Description (Optional)
            </label>
            <textarea
              id="description"
              disabled={loading}
              placeholder="Enter category description"
              {...register("description", {
                maxLength: {
                  value: 200,
                  message: "Description must be less than 200 characters"
                }
              })}
              className="form-style resize-none min-h-[100px] w-full"
            />
            {errors.description && (
              <span className="ml-2 text-xs tracking-wide text-pink-200">
                {errors.description.message}
              </span>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-md bg-richblack-600 px-4 py-2 text-sm font-medium text-richblack-300 hover:bg-richblack-500"
            >
              Cancel
            </button>
            <IconBtn
              disabled={loading}
              text={loading ? "Saving..." : (category ? "Update Category" : "Create Category")}
            />
          </div>
        </form>
      </div>
    </div>
  );
}
