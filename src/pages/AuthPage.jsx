import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { API_ENDPOINTS } from "../config/api";
import LoginForm from "../components/auth/LoginForm";
import SignupForm from "../components/auth/SignupForm";
import GoogleAuthButton from "../components/auth/GoogleAuthButton";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated, handleOAuthToken } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  // Handle OAuth callback
  useEffect(() => {
    const token = searchParams.get("token");
    const oauthError = searchParams.get("error");

    console.log("OAuth callback - token:", token);
    console.log("OAuth callback - error:", oauthError);
    console.log("Current URL:", window.location.href);

    if (token) {
      console.log("Processing OAuth token...");
      // Handle OAuth token and update authentication state
      handleOAuthToken(token)
        .then((result) => {
          console.log("OAuth token result:", result);
          if (result.success) {
            console.log("OAuth success, navigating to dashboard");
            navigate("/dashboard");
          } else {
            console.log("OAuth failed:", result.error);
            setError("Failed to authenticate with Google. Please try again.");
          }
        })
        .catch((error) => {
          console.error("OAuth token handling error:", error);
          setError("Failed to authenticate with Google. Please try again.");
        });
    } else if (oauthError) {
      console.log("OAuth error received:", oauthError);
      if (oauthError === "oauth_cancelled") {
        setError("Google authentication was cancelled");
      } else {
        setError("Google authentication failed. Please try again.");
      }
    } else {
      console.log("No OAuth token or error in URL");
    }
  }, [searchParams, handleOAuthToken, navigate]);

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError("");
  };

  const handleAuthSuccess = () => {
    navigate("/dashboard");
  };

  const handleAuthError = (errorMessage) => {
    setError(errorMessage);
    setLoading(false);
  };

  const handleGoogleAuth = () => {
    setLoading(true);
    setError("");
    // Redirect to Google OAuth endpoint on the backend server
    window.location.href = API_ENDPOINTS.AUTH.GOOGLE;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex flex-col justify-center px-4 py-6 sm:px-6 lg:px-8">
      <div className="w-full max-w-xs mx-auto sm:max-w-sm md:max-w-md lg:max-w-lg">
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center">
              <svg
                className="w-6 h-6 sm:w-8 sm:h-8 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            {isLogin ? "Welcome back" : "Get started"}
          </h2>
          <p className="text-sm sm:text-base text-gray-600 max-w-sm mx-auto">
            {isLogin
              ? "Sign in to access your AI-powered clinical dashboard"
              : "Create your account to start analyzing documents with AI"}
          </p>
        </div>
      </div>

      <div className="w-full max-w-xs mx-auto sm:max-w-sm md:max-w-md lg:max-w-lg">
        <div className="bg-white py-6 px-4 shadow-2xl rounded-2xl border border-gray-100 sm:py-8 sm:px-6 md:px-8 lg:px-10">
          {/* Error Display */}
          {error && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-4 w-4 sm:h-5 sm:w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-2 sm:ml-3">
                  <p className="text-xs sm:text-sm text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Auth Forms */}
          <div>
            {isLogin ? (
              <LoginForm
                onSuccess={handleAuthSuccess}
                onError={handleAuthError}
                loading={loading}
                setLoading={setLoading}
              />
            ) : (
              <SignupForm
                onSuccess={handleAuthSuccess}
                onError={handleAuthError}
                loading={loading}
                setLoading={setLoading}
              />
            )}
          </div>

          {/* Divider */}
          <div className="mt-6 sm:mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-xs sm:text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Or continue with
                </span>
              </div>
            </div>
          </div>

          {/* Google Auth Button */}
          <div className="mt-4 sm:mt-6">
            <GoogleAuthButton
              onAuth={handleGoogleAuth}
              loading={loading}
              disabled={loading}
            />
          </div>

          {/* Toggle Mode */}
          <div className="mt-4 sm:mt-6">
            <div className="text-center">
              <button
                type="button"
                onClick={toggleMode}
                className="text-xs sm:text-sm text-primary-custom hover:text-opacity-80 font-medium transition-colors duration-200"
                disabled={loading}
              >
                {isLogin
                  ? "Don't have an account? Sign up"
                  : "Already have an account? Sign in"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 sm:mt-8 text-center px-4">
        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
          By continuing, you agree to our{" "}
          <a
            href="/terms"
            className="text-primary-custom hover:text-opacity-80 underline"
          >
            Terms of Service
          </a>{" "}
          and{" "}
          <a
            href="/privacy"
            className="text-primary-custom hover:text-opacity-80 underline"
          >
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
