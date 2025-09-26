import { apiConnector } from "../apiconnector";
import { chatbotEndpoints } from "../apis";

const { CHAT_API } = chatbotEndpoints;

// Send message to chatbot
export const sendMessageToBot = async (message) => {
  try {
    const response = await apiConnector("POST", CHAT_API, { message });
    return response.data;
  } catch (error) {
    console.error("CHAT_API ERROR:", error);
    throw error;
  }
};
