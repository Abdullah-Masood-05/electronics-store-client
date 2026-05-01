import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// In-memory token reference — NEVER stored in localStorage
let authToken = null;

/**
 * Set the auth token for all subsequent requests.
 * Called by AuthContext after Firebase login.
 */
export const setAxiosToken = (token) => {
  authToken = token;
};

/**
 * Clear the auth token (on logout).
 */
export const clearAxiosToken = () => {
  authToken = null;
};

// Request interceptor — attach token automatically
api.interceptors.request.use(
  (config) => {
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401 globally
let logoutCallback = null;

export const setLogoutCallback = (callback) => {
  logoutCallback = callback;
};

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;
    
    // If it's a 401 and NOT from the logout or session endpoint itself, trigger logout
    if (
      error.response?.status === 401 && 
      originalRequest && 
      !originalRequest.url.includes("/auth/logout") &&
      !originalRequest.url.includes("/auth/session") &&
      !originalRequest.skipAuthLogout
    ) {
      clearAxiosToken();
      if (logoutCallback) {
        logoutCallback();
      }
    }
    return Promise.reject(error);
  }
);

export default api;
