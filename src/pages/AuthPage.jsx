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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col justify-center px-4 py-6 sm:px-6 sm:py-12 lg:px-8">
      <div className="w-full max-w-sm mx-auto sm:max-w-md lg:max-w-lg xl:max-w-xl">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-3">
            {isLogin ? "Sign in to your account" : "Create your account"}
          </h2>
          <p className="text-sm sm:text-base text-gray-600 px-2">
            {isLogin
              ? "Welcome back! Please sign in to continue."
              : "Join us to start processing your documents with AI."}
          </p>
        </div>
      </div>

      <div className="w-full max-w-sm mx-auto sm:max-w-md lg:max-w-lg xl:max-w-xl">
        <div className="bg-white py-6 px-4 shadow-xl rounded-lg sm:py-8 sm:px-6 lg:py-10 lg:px-8 xl:px-10">
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

          {/* Google Auth Button */}
          <GoogleAuthButton
            onAuth={handleGoogleAuth}
            loading={loading}
            disabled={loading}
          />

          {/* Divider */}
          <div className="mt-4 sm:mt-6">
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

          {/* Auth Forms */}
          <div className="mt-4 sm:mt-6">
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
