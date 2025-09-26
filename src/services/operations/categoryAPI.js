import { apiConnector } from "../apiconnector";
import { categories } from "../apis";

const {
  CATEGORIES_API,
  CREATE_CATEGORY_API,
  GET_USER_CATEGORIES_API,
  UPDATE_CATEGORY_API,
  DELETE_CATEGORY_API,
} = categories;

// Get all categories
export const getAllCategories = async () => {
  try {
    const response = await apiConnector("GET", CATEGORIES_API);
    return response.data;
  } catch (error) {
    console.error("GET_ALL_CATEGORIES_API ERROR:", error);
    throw error;
  }
};

// Create category
export const createCategory = async (data, token) => {
  try {
    const response = await apiConnector("POST", CREATE_CATEGORY_API, data, {
      Authorization: `Bearer ${token}`,
    });
    return response.data;
  } catch (error) {
    console.error("CREATE_CATEGORY_API ERROR:", error);
    throw error;
  }
};

// Get user's categories
export const getUserCategories = async (token) => {
  try {
    const response = await apiConnector("GET", GET_USER_CATEGORIES_API, null, {
      Authorization: `Bearer ${token}`,
    });
    return response.data;
  } catch (error) {
    console.error("GET_USER_CATEGORIES_API ERROR:", error);
    throw error;
  }
};

// Update category
export const updateCategory = async (categoryId, data, token) => {
  try {
    const response = await apiConnector(
      "PUT",
      UPDATE_CATEGORY_API.replace(":categoryId", categoryId),
      data,
      {
        Authorization: `Bearer ${token}`,
      }
    );
    return response.data;
  } catch (error) {
    console.error("UPDATE_CATEGORY_API ERROR:", error);
    throw error;
  }
};

// Delete category
export const deleteCategory = async (categoryId, token) => {
  try {
    const response = await apiConnector(
      "DELETE",
      DELETE_CATEGORY_API.replace(":categoryId", categoryId),
      null,
      {
        Authorization: `Bearer ${token}`,
      }
    );
    return response.data;
  } catch (error) {
    console.error("DELETE_CATEGORY_API ERROR:", error);
    throw error;
  }
};
