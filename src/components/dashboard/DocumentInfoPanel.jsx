import React from "react";
import { useTheme } from "../../contexts/ThemeContext";

// Document type icons mapping
const documentIcons = {
  "application/pdf": (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
      <path d="M9 2a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V6.414A2 2 0 0016.414 5L14 2.586A2 2 0 0012.586 2H9z" />
      <path d="M3 8a2 2 0 012-2h2a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
    </svg>
  ),
  "image/jpeg": (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
        clipRule="evenodd"
      />
    </svg>
  ),
  "image/png": (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
        clipRule="evenodd"
      />
    </svg>
  ),
  "text/plain": (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
        clipRule="evenodd"
      />
    </svg>
  ),
  default: (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
        clipRule="evenodd"
      />
    </svg>
  ),
};

const DocumentInfoPanel = ({ document, onClose }) => {
  const { isDarkMode } = useTheme();

  if (!document) return null;

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return "Unknown";
    if (bytes < 1024) return bytes + " B";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    else return (bytes / 1048576).toFixed(1) + " MB";
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "Unknown";
    const date = new Date(dateString);
    return (
      date.toLocaleDateString() +
      " " +
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  };

  // Get document icon based on mimetype
  const getDocumentIcon = (mimetype) => {
    return documentIcons[mimetype] || documentIcons.default;
  };

  return (
    <div
      className={`p-4 rounded-lg shadow-md ${
        isDarkMode ? "bg-gray-800 text-gray-200" : "bg-white text-gray-800"
      } border ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}
    >
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-sm flex items-center">
          <span
            className={`mr-2 ${isDarkMode ? "text-blue-400" : "text-blue-600"}`}
          >
            {getDocumentIcon(document.mimetype)}
          </span>
          Document Information
        </h3>
        <button
          onClick={onClose}
          className={`p-1 rounded-full hover:bg-opacity-80 ${
            isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
          }`}
        >
          <svg
            className="w-4 h-4"
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
        </button>
      </div>

      <div className="space-y-2 text-xs">
        <div className="flex flex-col">
          <span
            className={`font-medium ${
              isDarkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            Name:
          </span>
          <span className="break-words">
            {document.originalname || document.filename}
          </span>
        </div>

        <div className="flex flex-col">
          <span
            className={`font-medium ${
              isDarkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            Type:
          </span>
          <span>{document.mimetype || "Unknown"}</span>
        </div>

        <div className="flex flex-col">
          <span
            className={`font-medium ${
              isDarkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            Size:
          </span>
          <span>{formatFileSize(document.size)}</span>
        </div>

        <div className="flex flex-col">
          <span
            className={`font-medium ${
              isDarkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            Uploaded:
          </span>
          <span>{formatDate(document.createdAt || document.uploadedAt)}</span>
        </div>

        {document.patientName && (
          <div className="flex flex-col">
            <span
              className={`font-medium ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Patient:
            </span>
            <span>{document.patientName}</span>
          </div>
        )}

        {document.processingStatus && (
          <div className="flex flex-col">
            <span
              className={`font-medium ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Status:
            </span>
            <span
              className={`
              ${
                document.processingStatus === "completed"
                  ? isDarkMode
                    ? "text-green-400"
                    : "text-green-600"
                  : ""
              }
              ${
                document.processingStatus === "processing"
                  ? isDarkMode
                    ? "text-yellow-400"
                    : "text-yellow-600"
                  : ""
              }
              ${
                document.processingStatus === "failed"
                  ? isDarkMode
                    ? "text-red-400"
                    : "text-red-600"
                  : ""
              }
              ${
                !["completed", "processing", "failed"].includes(
                  document.processingStatus
                )
                  ? isDarkMode
                    ? "text-gray-400"
                    : "text-gray-600"
                  : ""
              }
            `}
            >
              {typeof document.processingStatus === "string"
                ? document.processingStatus.charAt(0).toUpperCase() +
                  document.processingStatus.slice(1)
                : "Unknown"}
            </span>
          </div>
        )}

        {document.analysis && document.analysis.summary && (
          <div className="flex flex-col mt-2">
            <span
              className={`font-medium ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Summary:
            </span>
            <p
              className={`mt-1 p-2 rounded text-xs ${
                isDarkMode ? "bg-gray-700" : "bg-gray-50"
              }`}
            >
              {document.analysis.summary}
            </p>
          </div>
        )}

        {/* Show AI summary if available in aiSummary instead of analysis */}
        {!document.analysis && document.aiSummary && (
          <div className="flex flex-col mt-2">
            <span
              className={`font-medium ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Summary:
            </span>
            <p
              className={`mt-1 p-2 rounded text-xs ${
                isDarkMode ? "bg-gray-700" : "bg-gray-50"
              }`}
            >
              {typeof document.aiSummary === "string"
                ? document.aiSummary
                : document.aiSummary.summary || "No summary available"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentInfoPanel;
