import { toast } from "react-hot-toast";

// Function to handle authentication errors
export const handleAuthError = (error) => {
  if (error.response?.status === 401) {
    // Clear invalid token and user data
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    
    // Show error message
    toast.error("Session expired. Please log in again.");
    
    // Redirect to login page if not already there
    if (window.location.pathname !== "/login") {
      window.location.href = "/login";
    }
    
    return true; // Indicates that the error was handled
  }
  return false; // Error was not handled
};

// Function to check if user is authenticated
export const isAuthenticated = () => {
  const token = localStorage.getItem("token");
  if (!token) return false;
  
  try {
    const parsedToken = JSON.parse(token);
    return !!parsedToken;
  } catch {
    return !!token;
  }
};

// Function to get the current token
export const getToken = () => {
  const stored = localStorage.getItem("token");
  if (!stored) return null;
  
  try {
    return JSON.parse(stored);
  } catch {
    return stored;
  }
};




