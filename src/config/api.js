// API configuration
const isDevelopment =
  import.meta.env.VITE_ENV === "development" || import.meta.env.DEV;
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const FRONTEND_URL =
  import.meta.env.VITE_FRONTEND_URL ||
  (isDevelopment
    ? "http://localhost:5174"
    : "https://jaw-breaker-06.netlify.app");
const USE_REAL_API = import.meta.env.VITE_USE_REAL_API === "true";

// In development, we can use relative paths for API calls
// In production, we need to use the full URL
const getEndpoint = (path) => {
  // For development, we can use relative paths because of the proxy in vite.config.js
  if (isDevelopment) {
    // When running locally, use the proxy through the frontend server
    return path;
  }
  // For production, we need to use the full URL
  return `${API_BASE_URL}${path}`;
};

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: getEndpoint("/api/auth/login"),
    SIGNUP: getEndpoint("/api/auth/signup"),
    GOOGLE: getEndpoint("/api/auth/google"),
    GOOGLE_CALLBACK: getEndpoint("/api/auth/google/callback"),
    ME: getEndpoint("/api/auth/me"),
    LOGOUT: getEndpoint("/api/auth/logout"),
  },
  UPLOAD: getEndpoint("/api/upload"),
  FILES: getEndpoint("/api/upload"), // Alias for UPLOAD for better semantics
  AI: getEndpoint("/api/ai"),
  PATIENTS: getEndpoint("/api/patients"),
};

// For debugging
console.log(`Running in ${isDevelopment ? "development" : "production"} mode`);
console.log(`API Base URL: ${API_BASE_URL}`);
console.log(`Frontend URL: ${FRONTEND_URL}`);
console.log(`Using Real API: ${USE_REAL_API}`);

// Export configuration for use in other parts of the application
export const URLS = {
  API_BASE_URL,
  FRONTEND_URL,
  USE_REAL_API,
};

export default API_BASE_URL;
