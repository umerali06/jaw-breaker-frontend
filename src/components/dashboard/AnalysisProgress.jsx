import React, { useState, useEffect } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import { API_ENDPOINTS } from "../../config/api";

const AnalysisProgress = ({ fileId, onComplete, onError }) => {
  const { isDarkMode } = useTheme();
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("initializing");
  const [pollingInterval, setPollingInterval] = useState(null);

  useEffect(() => {
    if (!fileId) return;

    // Start polling for status
    const interval = setInterval(checkStatus, 2000);
    setPollingInterval(interval);

    // Initial check
    checkStatus();

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [fileId]);

  const checkStatus = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Authentication token not found");
      }

      const response = await fetch(
        `${API_ENDPOINTS.AI}/analysis/${fileId}/status`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();

        setStatus(data.status);
        setProgress(data.progress || 0);

        if (data.status === "completed") {
          if (pollingInterval) clearInterval(pollingInterval);
          onComplete && onComplete(data.result);
        } else if (data.status === "failed") {
          if (pollingInterval) clearInterval(pollingInterval);
          onError && onError(data.error || "Analysis failed");
        }
      } else {
        const errorData = await response
          .json()
          .catch(() => ({ message: "Unknown error" }));
        throw new Error(errorData.message || "Failed to check analysis status");
      }
    } catch (error) {
      console.error("Error checking analysis status:", error);
      // Don't stop polling on error, just log it
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "initializing":
        return "Initializing analysis...";
      case "extracting":
        return "Extracting text from document...";
      case "analyzing":
        return "Analyzing document content...";
      case "generating":
        return "Generating clinical insights...";
      case "completed":
        return "Analysis completed successfully";
      case "failed":
        return "Analysis failed";
      default:
        return "Processing...";
    }
  };

  return (
    <div
      className={`p-4 rounded-lg border ${
        isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
      }`}
    >
      <div className="flex items-center mb-2">
        <svg
          className="w-5 h-5 mr-2 animate-spin text-blue-500"
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
        <p
          className={`font-medium ${
            isDarkMode ? "text-gray-200" : "text-gray-700"
          }`}
        >
          {getStatusText()}
        </p>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
        <div
          className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      <p
        className={`text-xs mt-1 text-right ${
          isDarkMode ? "text-gray-400" : "text-gray-500"
        }`}
      >
        {Math.round(progress)}% complete
      </p>
    </div>
  );
};

export default AnalysisProgress;
