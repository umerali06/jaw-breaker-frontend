import React, { useState, useEffect, useRef } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import { API_ENDPOINTS } from "../../config/api";

const AnalysisProgress = ({ fileId, onComplete, onError }) => {
  const { isDarkMode } = useTheme();
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("initializing");
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const intervalRef = useRef(null);
  const maxRetries = 3;

  // Track if we've already completed to avoid polling loops
  const completedRef = useRef(false);

  useEffect(() => {
    if (!fileId) return;

    // If already completed, don't start polling again
    if (completedRef.current) {
      console.log("AnalysisProgress: Already completed, not starting polling");
      return;
    }

    console.log("Starting analysis progress tracking for file:", fileId);

    // Start polling for status
    startPolling();

    return () => {
      stopPolling();
    };
  }, [fileId]);

  const startPolling = () => {
    // Clear any existing interval
    stopPolling();

    // Initial check
    checkStatus();

    // Start polling every 2 seconds
    intervalRef.current = setInterval(checkStatus, 2000);
  };

  const stopPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const checkStatus = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Authentication token not found");
      }

      console.log("Checking analysis status for file:", fileId);

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

        console.log("Analysis status response:", data);

        setStatus(data.status);
        setProgress(data.progress || 0);
        setError(null);
        setRetryCount(0); // Reset retry count on successful response

        // If already completed, don't process further
        if (completedRef.current) {
          console.log(
            "AnalysisProgress: Already completed, ignoring status update"
          );
          stopPolling();
          return;
        }

        // Check if we have meaningful result data regardless of status
        const hasUsefulData =
          data.result &&
          ((data.result.summary && data.result.summary !== null) ||
            (data.result.clinicalInsights &&
              data.result.clinicalInsights.length > 0) ||
            (data.result.soapNote &&
              Object.keys(data.result.soapNote || {}).length > 0) ||
            (data.result.oasisScores &&
              Object.keys(data.result.oasisScores || {}).length > 0));

        if (hasUsefulData) {
          console.log(
            "Meaningful analysis data received, treating as completed:",
            data.result
          );
          completedRef.current = true;
          stopPolling();
          onComplete && onComplete(data.result);
          return;
        }

        // Check if there's a validation error but we still have some data
        if (
          data.error &&
          data.error.includes("validation failed") &&
          data.result
        ) {
          // Only complete if we have at least some useful data
          const hasAnyData =
            data.result &&
            (data.result.summary ||
              (data.result.clinicalInsights &&
                data.result.clinicalInsights.length > 0) ||
              data.result.soapNote ||
              (data.result.oasisScores &&
                Object.keys(data.result.oasisScores || {}).length > 0));

          if (hasAnyData) {
            console.log(
              "Validation error but we have useful data, treating as completed:",
              data.result
            );
            completedRef.current = true;
            stopPolling();
            onComplete && onComplete(data.result);
            return;
          } else {
            console.log(
              "Validation error with no useful data, continuing to poll"
            );
          }
        }

        // Check if there's a validation error but we still have data
        if (
          data.error &&
          data.error.includes("File validation failed") &&
          data.result
        ) {
          console.log(
            "Validation error but we have data, treating as completed:",
            data.result
          );
          stopPolling();
          onComplete && onComplete(data.result);
          return;
        }

        // Otherwise check status
        if (data.status === "completed") {
          console.log("Analysis completed, stopping polling");
          completedRef.current = true;
          stopPolling();
          onComplete && onComplete(data.result);
        } else if (data.status === "failed") {
          console.log("Analysis failed:", data.error);
          completedRef.current = true; // Mark as completed to stop polling
          stopPolling();
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

      setRetryCount((prev) => prev + 1);

      // If we've exceeded max retries, stop polling and report error
      if (retryCount >= maxRetries) {
        console.error("Max retries exceeded, stopping polling");
        stopPolling();
        setError(error.message);
        onError && onError(`Failed to check analysis status: ${error.message}`);
      } else {
        console.log(`Retry ${retryCount + 1}/${maxRetries} for status check`);
        setError(`Connection issue (retry ${retryCount + 1}/${maxRetries})`);
      }
    }
  };

  const getStatusText = () => {
    if (error) {
      return error;
    }

    switch (status) {
      case "pending":
        return "Preparing document for analysis...";
      case "initializing":
        return "Initializing analysis...";
      case "extracting":
        return "Extracting text from document...";
      case "analyzing":
        return "Analyzing document content...";
      case "generating":
        return "Generating clinical insights...";
      case "processing":
        return "Processing document with AI...";
      case "completed":
        return "Analysis completed successfully";
      case "failed":
        return "Analysis failed";
      default:
        return "Processing...";
    }
  };

  const getStatusIcon = () => {
    if (status === "failed" || error) {
      return (
        <svg
          className="w-5 h-5 mr-2 text-red-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      );
    }

    if (status === "completed") {
      return (
        <svg
          className="w-5 h-5 mr-2 text-green-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      );
    }

    return (
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
    );
  };

  return (
    <div
      className={`p-4 rounded-lg border ${
        isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
      }`}
    >
      <div className="flex items-center mb-2">
        {getStatusIcon()}
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
          className={`h-2.5 rounded-full transition-all duration-500 ${
            status === "failed" || error
              ? "bg-red-500"
              : status === "completed"
              ? "bg-green-500"
              : "bg-blue-600"
          }`}
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      <div className="flex justify-between items-center mt-1">
        <p
          className={`text-xs ${
            isDarkMode ? "text-gray-400" : "text-gray-500"
          }`}
        >
          {status === "failed" || error
            ? "Failed"
            : `${Math.round(progress)}% complete`}
        </p>
        {retryCount > 0 && (
          <p
            className={`text-xs ${
              isDarkMode ? "text-yellow-400" : "text-yellow-600"
            }`}
          >
            Retry {retryCount}/{maxRetries}
          </p>
        )}
      </div>
    </div>
  );
};

export default AnalysisProgress;
