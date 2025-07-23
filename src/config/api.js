// API configuration
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_BASE_URL}/api/auth/login`,
    SIGNUP: `${API_BASE_URL}/api/auth/signup`,
    GOOGLE: `${API_BASE_URL}/api/auth/google`,
    GOOGLE_CALLBACK: `${API_BASE_URL}/api/auth/google/callback`,
    ME: `${API_BASE_URL}/api/auth/me`,
    LOGOUT: `${API_BASE_URL}/api/auth/logout`,
  },
  UPLOAD: `${API_BASE_URL}/api/upload`,
  FILES: `${API_BASE_URL}/api/upload`, // Alias for UPLOAD for better semantics
  AI: `${API_BASE_URL}/api/ai`,
  PATIENTS: `${API_BASE_URL}/api/patients`,
};

export default API_BASE_URL;
