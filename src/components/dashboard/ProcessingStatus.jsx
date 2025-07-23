import React from "react";
import { useTheme } from "../../contexts/ThemeContext";
import ReAnalyzeButton from "./ReAnalyzeButton";

const ProcessingStatus = ({ file, onReAnalyzeSuccess, onReAnalyzeError }) => {
  const { isDarkMode } = useTheme();

  if (!file) return null;

  const getStatusConfig = (status) => {
    switch (status) {
      case "completed":
        return {
          color: isDarkMode ? "#10b981" : "#059669",
          bgColor: isDarkMode ? "rgba(16, 185, 129, 0.2)" : "#f0fdf4",
          borderColor: isDarkMode ? "rgba(16, 185, 129, 0.3)" : "#d1fae5",
          icon: (
            <svg
              className="w-5 h-5"
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
          ),
          text: "Analysis completed successfully",
          showReAnalyze: false,
        };
      case "processing":
        return {
          color: isDarkMode ? "#3b82f6" : "#2563eb",
          bgColor: isDarkMode ? "rgba(59, 130, 246, 0.2)" : "#eff6ff",
          borderColor: isDarkMode ? "rgba(59, 130, 246, 0.3)" : "#dbeafe",
          icon: (
            <svg
              className="w-5 h-5 animate-spin"
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
          ),
          text: "Analysis in progress...",
          showReAnalyze: false,
        };
      case "failed":
        return {
          color: isDarkMode ? "#ef4444" : "#dc2626",
          bgColor: isDarkMode ? "rgba(239, 68, 68, 0.2)" : "#fef2f2",
          borderColor: isDarkMode ? "rgba(239, 68, 68, 0.3)" : "#fee2e2",
          icon: (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ),
          text: "Analysis failed",
          showReAnalyze: true,
        };
      default:
        return {
          color: isDarkMode ? "#f59e0b" : "#d97706",
          bgColor: isDarkMode ? "rgba(245, 158, 11, 0.2)" : "#fffbeb",
          borderColor: isDarkMode ? "rgba(245, 158, 11, 0.3)" : "#fef3c7",
          icon: (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          ),
          text: "Pending analysis",
          showReAnalyze: true,
        };
    }
  };

  const statusConfig = getStatusConfig(file.processingStatus);

  return (
    <div
      className="flex items-center justify-between p-4 rounded-lg mb-4"
      style={{
        backgroundColor: statusConfig.bgColor,
        borderColor: statusConfig.borderColor,
        color: statusConfig.color,
        border: `1px solid ${statusConfig.borderColor}`,
      }}
    >
      <div className="flex items-center">
        <div className="mr-3">{statusConfig.icon}</div>
        <div>
          <p className="font-medium">{statusConfig.text}</p>
          {file.processingError && (
            <p className="text-sm mt-1 opacity-80">{file.processingError}</p>
          )}
        </div>
      </div>

      {statusConfig.showReAnalyze && (
        <ReAnalyzeButton
          fileId={file._id}
          onSuccess={onReAnalyzeSuccess}
          onError={onReAnalyzeError}
        />
      )}
    </div>
  );
};

export default ProcessingStatus;
