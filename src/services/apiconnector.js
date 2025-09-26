import axios from "axios"
import { handleAuthError } from "../utils/authErrorHandler"

export const axiosInstance = axios.create({});

// Attach Authorization header automatically if available
axiosInstance.interceptors.request.use((config) => {
    try {
        const stored = localStorage.getItem("token");
        let token = null;
        if (stored) {
            try { token = JSON.parse(stored); } catch { token = stored; }
        }
        if (token && !config.headers?.Authorization) {
            config.headers = { ...(config.headers || {}), Authorization: `Bearer ${token}` };
        }
    } catch (_) {}
    return config;
});

// Handle 401 errors globally
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle authentication errors
        if (handleAuthError(error)) {
            return Promise.reject(error);
        }
        return Promise.reject(error);
    }
);

export const apiConnector = (method, url, bodyData, headers, params) => {
    return axiosInstance({
        method:`${method}`,
        url:`${url}`,
        data: bodyData ? bodyData : null,
        headers: headers ? headers: null,
        params: params ? params : null,
    });
}