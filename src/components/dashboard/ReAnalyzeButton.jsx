import React, { useState } from "react";
import { API_ENDPOINTS } from "../../config/api";
import { useTheme } from "../../contexts/ThemeContext";

const ReAnalyzeButton = ({
  fileId,
  onSuccess,
  onError,
  buttonText = "Re-Analyze",
  className = "",
}) => {
  const [loading, setLoading] = useState(false);
  const { isDarkMode } = useTheme();

  const handleReAnalyze = async () => {
    if (!fileId) {
      onError && onError("No file ID provided");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Authentication token not found");
      }

      // Import the analyzeFile function from api.js
      const { analyzeFile } = await import("../../services/api");
      const data = await analyzeFile(fileId);

      // If we get here, the analysis was successful
      onSuccess && onSuccess(data);
    } catch (error) {
      console.error("Error re-analyzing document:", error);
      onError && onError(error.message || "Failed to re-analyze document");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleReAnalyze}
      disabled={loading}
      className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center ${
        loading ? "opacity-70 cursor-not-allowed" : "hover:opacity-90"
      } ${
        isDarkMode ? "bg-red-700 text-white" : "bg-red-600 text-white"
      } ${className}`}
    >
      {loading ? (
        <>
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
          Processing...
        </>
      ) : (
        <>
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          {buttonText}
        </>
      )}
    </button>
  );
};

export default ReAnalyzeButton;
