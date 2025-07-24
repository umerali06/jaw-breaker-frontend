import { createContext, useContext, useState, useEffect } from "react";
import { API_ENDPOINTS } from "../config/api";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check for existing token on app initialization
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (token) {
        // Real API call to verify token
        const response = await fetch(API_ENDPOINTS.AUTH.ME, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem("authToken");
        }
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      localStorage.removeItem("authToken");
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      // Real API call for authentication
      const response = await fetch(API_ENDPOINTS.AUTH.LOGIN, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("authToken", data.token);
        setUser(data.user);
        setIsAuthenticated(true);
        return { success: true };
      } else {
        return {
          success: false,
          error: data.error?.message || data.error || "Login failed",
        };
      }
    } catch (error) {
      console.error("Login error:", error);

      // If in development mode, provide a fallback
      if (isDevEnvironment() || shouldUseSampleData()) {
        console.log("Using fallback login for development due to error");
        const mockUser = {
          id: "mock-user-id",
          name: email.split("@")[0], // Use part of email as name
          email,
        };
        const mockToken = "mock-auth-token-for-development";

        localStorage.setItem("authToken", mockToken);
        setUser(mockUser);
        setIsAuthenticated(true);
        return { success: true };
      }

      return { success: false, error: "Network error occurred" };
    }
  };

  // Detect environment
  const isDevEnvironment = () => {
    return import.meta.env.DEV || import.meta.env.VITE_ENV === "development";
  };

  const signup = async (email, password, name) => {
    try {
      // Real API call for production or when not using sample data
      const response = await fetch(API_ENDPOINTS.AUTH.SIGNUP, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("authToken", data.token);
        setUser(data.user);
        setIsAuthenticated(true);
        return { success: true };
      } else {
        return {
          success: false,
          error: data.error?.message || data.error || "Registration failed",
        };
      }
    } catch (error) {
      console.error("Signup error:", error);
      return { success: false, error: "Network error occurred" };
    }
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    setUser(null);
    setIsAuthenticated(false);
  };

  // Handle OAuth token from callback
  const handleOAuthToken = async (token) => {
    try {
      console.log("handleOAuthToken called with token:", token);
      localStorage.setItem("authToken", token);

      // Verify token and get user data
      console.log("Verifying token with API:", API_ENDPOINTS.AUTH.ME);
      const response = await fetch(API_ENDPOINTS.AUTH.ME, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Token verification response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("Token verification successful, user data:", data);
        setUser(data.user);
        setIsAuthenticated(true);
        return { success: true };
      } else {
        const errorData = await response.text();
        console.log("Token verification failed:", response.status, errorData);
        localStorage.removeItem("authToken");
        return { success: false, error: "Invalid token" };
      }
    } catch (error) {
      console.error("handleOAuthToken error:", error);
      localStorage.removeItem("authToken");
      return { success: false, error: "Failed to verify token" };
    }
  };

  // Token refresh functionality
  const refreshToken = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return false;

      const response = await fetch(API_ENDPOINTS.AUTH.ME, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setIsAuthenticated(true);
        return true;
      } else {
        // Token is invalid or expired
        logout();
        return false;
      }
    } catch (error) {
      console.error("Token refresh failed:", error);
      logout();
      return false;
    }
  };

  // Check token expiration periodically
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      refreshToken();
    }, 15 * 60 * 1000); // Check every 15 minutes

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    signup,
    logout,
    checkAuth,
    refreshToken,
    handleOAuthToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
