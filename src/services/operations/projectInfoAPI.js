import { apiConnector } from '../apiconnector';
import { projectInfoEndpoints } from '../apis';
import { toast } from 'react-hot-toast';

const { PROJECT_INFO, ENHANCED_CHAT } = projectInfoEndpoints;

// Get project information
export const getProjectInfo = async (section = null) => {
  try {
    const url = section ? `${PROJECT_INFO}?section=${section}` : PROJECT_INFO;
    const response = await apiConnector("GET", url);
    return response.data;
  } catch (error) {
    console.error('PROJECT_INFO API ERROR:', error);
    throw error;
  }
};

// Enhanced chat with project navigation
export const sendMessageToBotEnhanced = async (message) => {
  try {
    const response = await apiConnector("POST", ENHANCED_CHAT, { message });
    return response.data;
  } catch (error) {
    console.error('ENHANCED_CHAT_API ERROR:', error);
    throw error;
  }
};

// Get dashboard links for navigation
export const getDashboardLinks = async (userType = 'student') => {
  try {
    const response = await getProjectInfo('dashboard');
    if (response.success) {
      return {
        success: true,
        data: response.data.content[userType] || response.data.content.student
      };
    }
    return response;
  } catch (error) {
    console.error('DASHBOARD_LINKS ERROR:', error);
    throw error;
  }
};

// Get platform features
export const getPlatformFeatures = async () => {
  try {
    const response = await getProjectInfo('features');
    if (response.success) {
      return {
        success: true,
        data: response.data.content
      };
    }
    return response;
  } catch (error) {
    console.error('PLATFORM_FEATURES ERROR:', error);
    throw error;
  }
};

// Get course categories
export const getCourseCategories = async () => {
  try {
    const response = await getProjectInfo('courseCategories');
    if (response.success) {
      return {
        success: true,
        data: response.data.content
      };
    }
    return response;
  } catch (error) {
    console.error('COURSE_CATEGORIES ERROR:', error);
    throw error;
  }
};

// Get main pages navigation
export const getMainPages = async () => {
  try {
    const response = await getProjectInfo('mainPages');
    if (response.success) {
      return {
        success: true,
        data: response.data.content
      };
    }
    return response;
  } catch (error) {
    console.error('MAIN_PAGES ERROR:', error);
    throw error;
  }
};
