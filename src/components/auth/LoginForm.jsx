import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";

const LoginForm = ({ onSuccess, onError, loading, setLoading }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [validationErrors, setValidationErrors] = useState({});
  const { login } = useAuth();

  const validateForm = () => {
    const errors = {};

    // Email validation
    if (!formData.email) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!formData.password) {
      errors.password = "Password is required";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const result = await login(formData.email, formData.password);

      if (result.success) {
        onSuccess();
      } else {
        onError(result.error || "Login failed. Please try again.");
      }
    } catch (error) {
      onError("Network error. Please check your connection and try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
      {/* Email Field */}
      <div>
        <label
          htmlFor="email"
          className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2"
        >
          Email address
        </label>
        <div>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={formData.email}
            onChange={handleChange}
            className={`appearance-none block w-full px-3 py-2 sm:py-3 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-custom focus:border-primary-custom text-sm sm:text-base transition-colors duration-200 ${
              validationErrors.email
                ? "border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500"
                : "border-gray-300 hover:border-gray-400"
            }`}
            placeholder="Enter your email"
            disabled={loading}
          />
          {validationErrors.email && (
            <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-red-600">
              {validationErrors.email}
            </p>
          )}
        </div>
      </div>

      {/* Password Field */}
      <div>
        <label
          htmlFor="password"
          className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2"
        >
          Password
        </label>
        <div>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={formData.password}
            onChange={handleChange}
            className={`appearance-none block w-full px-3 py-2 sm:py-3 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-custom focus:border-primary-custom text-sm sm:text-base transition-colors duration-200 ${
              validationErrors.password
                ? "border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500"
                : "border-gray-300 hover:border-gray-400"
            }`}
            placeholder="Enter your password"
            disabled={loading}
          />
          {validationErrors.password && (
            <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-red-600">
              {validationErrors.password}
            </p>
          )}
        </div>
      </div>

      {/* Forgot Password Link */}
      <div className="flex items-center justify-end">
        <div className="text-xs sm:text-sm">
          <a
            href="#"
            className="font-medium text-primary-custom hover:text-opacity-80 transition-colors duration-200"
            onClick={(e) => {
              e.preventDefault();
              // TODO: Implement forgot password functionality
              alert("Forgot password functionality will be implemented soon.");
            }}
          >
            Forgot your password?
          </a>
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={loading}
          className={`group relative w-full flex justify-center py-2.5 sm:py-3 px-4 border border-transparent text-sm sm:text-base font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-custom transition-all duration-200 ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-primary-custom hover:bg-opacity-90 active:transform active:scale-[0.98]"
          }`}
        >
          {loading ? (
            <div className="flex items-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-4 w-4 sm:h-5 sm:w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span className="text-sm sm:text-base">Signing in...</span>
            </div>
          ) : (
            <span className="text-sm sm:text-base">Sign in</span>
          )}
        </button>
      </div>
    </form>
  );
};

export default LoginForm;
