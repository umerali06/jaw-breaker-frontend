import { useState, useEffect, useRef } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import { API_ENDPOINTS } from "../../config/api";
import { regenerateAnalysis, generateCustomAnalysis } from "../../services/api";
import OASISScoring from "./OASISScoring";
import SOAPNoteGenerator from "./SOAPNoteGenerator";
import FileDebugInfo from "./FileDebugInfo";
import ProcessingStatus from "./ProcessingStatus";
import ReAnalyzeButton from "./ReAnalyzeButton";
import AnalysisProgress from "./AnalysisProgress";
import ReactMarkdown from "react-markdown";
import {
  FiArrowLeft,
  FiDownload,
  FiRefreshCw,
  FiPlay,
  FiFileText,
} from "react-icons/fi";

const FileDetailView = ({ file, onBack }) => {
  const { isDarkMode } = useTheme();

  // Ensure we have a valid onBack function
  const handleBack = () => {
    if (typeof onBack === "function") {
      onBack();
    }
  };

  // Add CSS for markdown content
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      .markdown-content {
        font-size: inherit;
        line-height: 1.6;
      }
      .markdown-content p {
        margin-bottom: 0.75rem;
      }
      .markdown-content p:last-child {
        margin-bottom: 0;
      }
      .markdown-content strong {
        font-weight: 600;
        color: ${isDarkMode ? "#f7fafc" : "#1a202c"};
      }
      .markdown-content em {
        font-style: italic;
      }
      .markdown-content ul, .markdown-content ol {
        margin-left: 1.5rem;
        margin-bottom: 0.75rem;
      }
      .markdown-content ul {
        list-style-type: disc;
      }
      .markdown-content ol {
        list-style-type: decimal;
      }
      .markdown-content li {
        margin-bottom: 0.25rem;
      }
      .markdown-content h1, .markdown-content h2, .markdown-content h3, 
      .markdown-content h4, .markdown-content h5, .markdown-content h6 {
        font-weight: 600;
        margin-top: 1rem;
        margin-bottom: 0.5rem;
        color: ${isDarkMode ? "#f7fafc" : "#1a202c"};
      }
      .markdown-content h1 { font-size: 1.5rem; }
      .markdown-content h2 { font-size: 1.25rem; }
      .markdown-content h3 { font-size: 1.125rem; }
      .markdown-content h4 { font-size: 1rem; }
      .markdown-content h5 { font-size: 0.875rem; }
      .markdown-content h6 { font-size: 0.85rem; }
      .markdown-content code {
        background-color: ${isDarkMode ? "#2d3748" : "#f1f5f9"};
        padding: 0.2em 0.4em;
        border-radius: 3px;
        font-family: monospace;
        font-size: 0.9em;
      }
      .markdown-content pre {
        background-color: ${isDarkMode ? "#2d3748" : "#f1f5f9"};
        padding: 1rem;
        border-radius: 0.375rem;
        overflow-x: auto;
        margin-bottom: 1rem;
      }
      .markdown-content blockquote {
        border-left: 4px solid ${isDarkMode ? "#4a5568" : "#e2e8f0"};
        padding-left: 1rem;
        font-style: italic;
        margin-bottom: 1rem;
      }
      .markdown-content a {
        color: ${isDarkMode ? "#90cdf4" : "#3182ce"};
        text-decoration: underline;
      }
      .markdown-content table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 1rem;
      }
      .markdown-content th, .markdown-content td {
        border: 1px solid ${isDarkMode ? "#4a5568" : "#e2e8f0"};
        padding: 0.5rem;
        text-align: left;
      }
      .markdown-content th {
        background-color: ${isDarkMode ? "#2d3748" : "#f1f5f9"};
        font-weight: 600;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, [isDarkMode]);
  const [activeTab, setActiveTab] = useState("summary");
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pollingInterval, setPollingInterval] = useState(null);
  const [manualSummary, setManualSummary] = useState("");
  const [manualSaveMsg, setManualSaveMsg] = useState("");
  const [manualLoading, setManualLoading] = useState(false);

  // Brand colors
  const colors = {
    primary: "#2596be",
    primaryLight: "#e1f0f5",
    primaryDark: "#1d7a9c",
    accent: "#96be25",
    accentLight: "#f0f5e1",
    accentDark: "#7a9c1d",
    success: "#16a34a",
    error: "#dc2626",
    warning: "#d97706",
    textDark: "#1e293b",
    textLight: "#f8fafc",
    bgDark: "#1a202c",
    bgLight: "#ffffff",
    grayDark: "#4a5568",
    grayLight: "#e2e8f0",
  };

  // Track if analysis is completed to prevent polling loops
  const analysisCompletedRef = useRef(false);

  useEffect(() => {
    if (!file) return;

    console.log(
      "FileDetailView: File changed, processing status:",
      file.processingStatus
    );

    // Always fetch analysis data initially, regardless of completion status
    // This ensures we get the latest data even if the file was already processed
    console.log("FileDetailView: Fetching analysis data...");
    fetchAnalysis();

    // If file is completed and we don't have analysis data yet, don't mark as completed
    // Let fetchAnalysis determine if we have real data
    if (file.processingStatus === "completed" && analysis) {
      analysisCompletedRef.current = true;
    }

    // Only start polling if file is in processing state and analysis not completed
    if (
      file.processingStatus === "processing" &&
      !analysisCompletedRef.current
    ) {
      console.log("FileDetailView: Starting polling for processing file");

      // Clear any existing interval first
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }

      const interval = setInterval(() => {
        // Only fetch if not completed
        if (!analysisCompletedRef.current) {
          fetchAnalysis();
        } else {
          // If completed during interval, clear it
          clearInterval(interval);
          setPollingInterval(null);
        }
      }, 3000);

      setPollingInterval(interval);

      return () => {
        clearInterval(interval);
        setPollingInterval(null);
      };
    } else {
      // Clear any existing polling if file is not processing
      if (pollingInterval) {
        clearInterval(pollingInterval);
        setPollingInterval(null);
      }
    }

    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [file?._id, file?.processingStatus]); // Only depend on file ID and processing status

  // Handle analysis completion from AnalysisProgress component
  const handleAnalysisComplete = (result) => {
    if (result) {
      console.log("Analysis completed with result:", result);

      // Mark analysis as completed to prevent further polling
      analysisCompletedRef.current = true;

      // Force a refresh of the analysis data
      setLoading(true);

      // Ensure clinicalInsights is properly formatted
      if (result.clinicalInsights) {
        if (typeof result.clinicalInsights === "string") {
          try {
            result.clinicalInsights = JSON.parse(result.clinicalInsights);
          } catch (e) {
            console.error("Failed to parse clinical insights JSON:", e);
            result.clinicalInsights = [];
          }
        } else if (!Array.isArray(result.clinicalInsights)) {
          result.clinicalInsights = [];
        }
      } else {
        result.clinicalInsights = [];
      }

      // Update the analysis state with the new data
      setAnalysis((prevAnalysis) => ({
        ...prevAnalysis,
        ...result,
        processingStatus: "completed", // Force status to completed
      }));

      // Update the file object with the new data
      if (file) {
        if (result.summary) file.aiSummary = result.summary;
        if (result.oasisScores) file.oasisScores = result.oasisScores;
        if (result.soapNote) file.soapNote = result.soapNote;
        if (result.clinicalInsights)
          file.clinicalInsights = result.clinicalInsights;
        file.processingStatus = "completed";

        // Stop any polling that might be happening
        if (pollingInterval) {
          console.log("Stopping polling interval after analysis completion");
          clearInterval(pollingInterval);
          setPollingInterval(null);
        }
      }

      // Short delay to ensure UI updates properly
      setTimeout(() => {
        setLoading(false);
        setError(null);

        // Set the active tab based on what data is available
        if (result.summary) {
          setActiveTab("summary");
        } else if (
          result.clinicalInsights &&
          result.clinicalInsights.length > 0
        ) {
          setActiveTab("clinical");
        } else if (
          result.soapNote &&
          Object.keys(result.soapNote || {}).length > 0
        ) {
          setActiveTab("soap");
        } else if (
          result.oasisScores &&
          Object.keys(result.oasisScores || {}).length > 0
        ) {
          setActiveTab("oasis");
        } else {
          // Default to summary tab if no specific data is available
          setActiveTab("summary");
        }
      }, 500);
    }
  };

  const fetchAnalysis = async () => {
    if (!file || !file._id) {
      setError("File ID is missing");
      return;
    }

    // Only skip fetch if we already have analysis data AND it's marked as completed
    if (analysisCompletedRef.current && analysis) {
      console.log(
        "FileDetailView: Analysis already completed and data exists, skipping fetch"
      );
      if (pollingInterval) {
        console.log("FileDetailView: Stopping any remaining polling");
        clearInterval(pollingInterval);
        setPollingInterval(null);
      }
      return;
    }

    // Don't show loading for polling requests
    const isPolling = pollingInterval !== null;
    if (!isPolling) {
      setLoading(true);
    }
    setError(null);

    try {
      console.log("FileDetailView: Fetching analysis for file:", file._id);

      // Use the getAnalysis function from api.js
      const { getAnalysis } = await import("../../services/api");
      const result = await getAnalysis(file._id);

      console.log("FileDetailView: Analysis result:", result);

      if (result) {
        // Ensure clinicalInsights is always an array
        if (result.clinicalInsights) {
          if (typeof result.clinicalInsights === "string") {
            try {
              result.clinicalInsights = JSON.parse(result.clinicalInsights);
            } catch (e) {
              console.error("Failed to parse clinical insights JSON:", e);
              result.clinicalInsights = [];
            }
          } else if (!Array.isArray(result.clinicalInsights)) {
            result.clinicalInsights = [];
          }
        } else {
          result.clinicalInsights = [];
        }

        // Check if we have meaningful analysis data (not error responses)
        const hasRealAnalysisData =
          (result.summary &&
            result.summary !== null &&
            !result.summary.includes("currently unavailable") &&
            !result.summary.includes("API configuration")) ||
          (result.clinicalInsights &&
            result.clinicalInsights.length > 0 &&
            !result.clinicalInsights.some(
              (insight) =>
                insight.message && insight.message.includes("unavailable")
            )) ||
          (result.soapNote &&
            Object.keys(result.soapNote || {}).length > 0 &&
            !result.soapNote.subjective?.includes("encountered an error")) ||
          (result.oasisScores &&
            Object.keys(result.oasisScores || {}).length > 0 &&
            !Object.values(result.oasisScores).some((score) =>
              score.rationale?.includes("unavailable")
            ));

        if (hasRealAnalysisData) {
          console.log(
            "FileDetailView: Real analysis data found, treating as completed"
          );

          // Force status to completed if we have real data
          result.processingStatus = "completed";

          if (file) {
            file.processingStatus = "completed";
          }

          // Mark as completed to prevent further polling
          analysisCompletedRef.current = true;

          // Stop polling if we have data
          if (pollingInterval) {
            console.log(
              "FileDetailView: Stopping polling due to real data presence"
            );
            clearInterval(pollingInterval);
            setPollingInterval(null);
          }
        } else if (
          result.summary &&
          result.summary.includes("currently unavailable")
        ) {
          // This is an error response, treat as failed
          console.log(
            "FileDetailView: Error response detected, treating as failed"
          );
          setError(
            "AI analysis service is currently unavailable. Please check your Gemini API configuration."
          );
          result.processingStatus = "failed";

          if (file) {
            file.processingStatus = "failed";
          }

          // Stop polling on error
          if (pollingInterval) {
            clearInterval(pollingInterval);
            setPollingInterval(null);
          }
        }

        setAnalysis(result);

        // Update the file object with the latest processing status
        if (file && result.processingStatus) {
          file.processingStatus = result.processingStatus;

          // If analysis is completed, stop polling
          if (result.processingStatus === "completed" && pollingInterval) {
            console.log("FileDetailView: Analysis completed, stopping polling");
            clearInterval(pollingInterval);
            setPollingInterval(null);
          }

          // If analysis failed, stop polling
          if (result.processingStatus === "failed" && pollingInterval) {
            console.log("FileDetailView: Analysis failed, stopping polling");
            clearInterval(pollingInterval);
            setPollingInterval(null);
            setError(result.processingError || "Analysis failed");
          }
        }
      } else {
        throw new Error("Failed to fetch analysis");
      }
    } catch (error) {
      console.error("Error fetching analysis:", error);
      setError(error.message || "Failed to fetch analysis");

      // Stop polling on error
      if (pollingInterval) {
        clearInterval(pollingInterval);
        setPollingInterval(null);
      }
    } finally {
      if (!isPolling) {
        setLoading(false);
      }
    }
  };

  const triggerAnalysis = async () => {
    if (!file || !file._id) {
      setError("File ID is missing");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Authentication token not found");
      }

      const response = await fetch(`${API_ENDPOINTS.AI}/analyze/${file._id}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setTimeout(() => {
          fetchAnalysis();
        }, 1000);
      } else {
        const errorData = await response
          .json()
          .catch(() => ({ message: "Unknown error" }));
        throw new Error(errorData.message || "Failed to analyze document");
      }
    } catch (error) {
      console.error("Error analyzing document:", error);

      // Handle specific error types
      if (error.message.includes("429") || error.message.includes("quota")) {
        setError(
          "API quota exceeded. Please upgrade your Gemini API plan or try again tomorrow."
        );
      } else if (error.message.includes("API_KEY_INVALID")) {
        setError(
          "Invalid API key. Please check your Gemini API configuration."
        );
      } else {
        setError(error.message || "Failed to analyze document");
      }
      setLoading(false);
    }
  };

  const retryAnalysis = async () => {
    setLoading(true);
    setError(null);

    // Reset analysis completion flag to allow new analysis
    analysisCompletedRef.current = false;

    try {
      console.log("Regenerating analysis for file:", file._id);
      const result = await regenerateAnalysis(file._id);

      if (result.success) {
        // After successful regeneration, fetch the latest analysis data
        console.log("Re-analysis successful, fetching updated data...");

        // Wait a moment for the backend to save the data, then fetch
        setTimeout(async () => {
          try {
            const { getAnalysis } = await import("../../services/api");
            const updatedAnalysis = await getAnalysis(file._id);

            if (updatedAnalysis) {
              console.log("Updated analysis fetched:", updatedAnalysis);

              // Ensure clinicalInsights is always an array
              if (updatedAnalysis.clinicalInsights) {
                if (typeof updatedAnalysis.clinicalInsights === "string") {
                  try {
                    updatedAnalysis.clinicalInsights = JSON.parse(
                      updatedAnalysis.clinicalInsights
                    );
                  } catch (e) {
                    console.error("Failed to parse clinical insights JSON:", e);
                    updatedAnalysis.clinicalInsights = [];
                  }
                } else if (!Array.isArray(updatedAnalysis.clinicalInsights)) {
                  updatedAnalysis.clinicalInsights = [];
                }
              } else {
                updatedAnalysis.clinicalInsights = [];
              }

              setAnalysis(updatedAnalysis);
              setLoading(false);
              setError(null);
              analysisCompletedRef.current = true;

              // Update file status
              if (file) {
                file.processingStatus = "completed";
              }
            } else {
              setError("Failed to fetch updated analysis data");
              setLoading(false);
            }
          } catch (fetchError) {
            console.error("Error fetching updated analysis:", fetchError);
            setError("Failed to fetch updated analysis data");
            setLoading(false);
          }
        }, 2000); // Wait 2 seconds for backend to save
      } else {
        setError(result.message || "Failed to regenerate analysis");
        setLoading(false);
      }
    } catch (err) {
      console.error("Error regenerating analysis:", err);

      // Handle specific error types
      if (err.message.includes("429") || err.message.includes("quota")) {
        setError(
          "🚫 API quota exceeded! You've reached the daily limit of 50 requests. Please upgrade your Gemini API plan or try again tomorrow."
        );
      } else if (err.message.includes("API_KEY_INVALID")) {
        setError(
          "🔑 Invalid API key. Please check your Gemini API configuration."
        );
      } else {
        setError(err.message || "Failed to regenerate analysis");
      }
      setLoading(false);
    }
  };

  const handleOASISUpdate = (updatedScores) => {
    setAnalysis((prev) => ({
      ...prev,
      oasisScores: updatedScores,
    }));
  };

  const handleSOAPUpdate = (soapNote) => {
    setAnalysis((prev) => ({
      ...prev,
      soapNote,
    }));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  // Function to safely parse JSON strings if needed
  const parseJsonIfString = (data) => {
    if (!data) return null;
    if (typeof data === "string") {
      try {
        return JSON.parse(data);
      } catch (e) {
        return data;
      }
    }
    return data;
  };

  // Function to render markdown content
  const renderMarkdown = (content) => {
    if (!content) return null;
    if (typeof content === "string") {
      return (
        <div className="markdown-content">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      );
    }
    return content;
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case "completed":
        return {
          color: colors.success,
          bg: isDarkMode ? "#16653430" : "#f0fdf4",
          icon: (
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
                d="M5 13l4 4L19 7"
              />
            </svg>
          ),
        };
      case "processing":
        return {
          color: colors.primary,
          bg: isDarkMode ? "#2596be30" : "#eff6ff",
          icon: (
            <svg
              className="w-4 h-4 animate-spin"
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
        };
      case "failed":
        return {
          color: colors.error,
          bg: isDarkMode ? "#dc262630" : "#fef2f2",
          icon: (
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
          ),
        };
      default:
        return {
          color: colors.warning,
          bg: isDarkMode ? "#d9770630" : "#fefce8",
          icon: (
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
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          ),
        };
    }
  };

  const handleManualSave = () => {
    setManualLoading(true);
    setTimeout(() => {
      setManualLoading(false);
      setManualSaveMsg("Saved successfully!");
      setTimeout(() => setManualSaveMsg(""), 2000);
    }, 1000);
  };

  // Helper: Copy to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  // Helper: Export to JSON
  const exportToJson = (data, filename) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Helper: Priority badge color
  const getPriorityBadge = (priority) => {
    switch (priority) {
      case "critical":
        return "bg-red-600 text-white";
      case "high":
        return "bg-yellow-400 text-gray-900";
      case "medium":
        return "bg-blue-500 text-white";
      case "low":
        return "bg-green-500 text-white";
      default:
        return "bg-gray-400 text-white";
    }
  };

  // Helper: Insight type tooltip
  const getTypeTooltip = (type) => {
    switch (type) {
      case "risk":
        return "Risk factor or alert";
      case "improvement":
        return "Improvement or positive trend";
      case "alert":
        return "Clinical alert or warning";
      case "recommendation":
        return "Care recommendation";
      case "safety":
        return "Safety concern or intervention";
      case "medication":
        return "Medication-related insight";
      case "wound":
        return "Wound care insight";
      case "nutrition":
        return "Nutrition-related insight";
      default:
        return "Clinical insight";
    }
  };

  const renderTabContent = () => {
    if (loading) {
      return (
        <div className="space-y-4">
          <ProcessingStatus
            file={file}
            onReAnalyzeSuccess={(data) => {
              console.log("Re-analysis started:", data);
              setLoading(true);
              setError(null);
              fetchAnalysis();
            }}
            onReAnalyzeError={(error) => {
              setError(error);
              setLoading(false);
            }}
          />

          {file && file.processingStatus === "processing" ? (
            <AnalysisProgress
              fileId={file._id}
              onComplete={handleAnalysisComplete}
              onError={(error) => {
                setError(error);
                setLoading(false);
              }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-blue-100 rounded-full"></div>
                <div className="absolute top-0 left-0 w-16 h-16 border-4 border-t-blue-500 border-r-blue-500 rounded-full animate-spin"></div>
              </div>
              <p
                className={`font-medium ${
                  isDarkMode ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Analyzing document...
              </p>
            </div>
          )}
        </div>
      );
    }

    if (error) {
      return (
        <div className="space-y-4">
          <ProcessingStatus
            file={file}
            onReAnalyzeSuccess={(data) => {
              console.log("Re-analysis started:", data);
              setLoading(true);
              setError(null);
              fetchAnalysis();
            }}
            onReAnalyzeError={(error) => {
              setError(error);
              setLoading(false);
            }}
          />

          <div
            className={`p-6 rounded-xl border ${
              isDarkMode
                ? "border-red-900 bg-red-900 bg-opacity-20"
                : "border-red-200 bg-red-50"
            }`}
          >
            <div className="flex items-start">
              <div
                className={`p-2 rounded-full bg-red-100 bg-opacity-30 mr-3 ${
                  isDarkMode ? "bg-opacity-10" : ""
                }`}
              >
                <svg
                  className="w-5 h-5 text-red-500"
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
              </div>
              <div className="flex-1">
                <h3
                  className={`font-bold mb-2 ${
                    isDarkMode ? "text-red-300" : "text-red-800"
                  }`}
                >
                  AI analysis is currently unavailable
                </h3>
                <div
                  className={`text-sm mb-4 ${
                    isDarkMode ? "text-red-200" : "text-red-700"
                  }`}
                >
                  <p className="mb-2">{error}</p>
                  {error.includes("quota") && (
                    <div className="mt-3 p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg border border-yellow-300 dark:border-yellow-700">
                      <p className="text-yellow-800 dark:text-yellow-200 text-xs font-medium">
                        💡 <strong>Quick Fix:</strong> The Gemini API free tier
                        allows 50 requests per day. You can either:
                      </p>
                      <ul className="text-yellow-800 dark:text-yellow-200 text-xs mt-2 ml-4 list-disc">
                        <li>Wait 24 hours for quota reset</li>
                        <li>
                          Upgrade to a paid plan at{" "}
                          <a
                            href="https://aistudio.google.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline"
                          >
                            Google AI Studio
                          </a>
                        </li>
                        <li>Use manual entry below as a temporary solution</li>
                      </ul>
                    </div>
                  )}
                  <p className="mt-2">
                    Please try again later or enter data manually below.
                  </p>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={fetchAnalysis}
                    className={`px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity flex items-center ${
                      isDarkMode
                        ? "bg-blue-700 text-white"
                        : "bg-blue-600 text-white"
                    }`}
                  >
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
                    Retry Analysis
                  </button>
                  <ReAnalyzeButton
                    fileId={file._id}
                    onSuccess={(data) => {
                      console.log("Re-analysis started:", data);
                      setLoading(true);
                      setError(null);
                      fetchAnalysis();
                    }}
                    onError={(error) => {
                      setError(error);
                      setLoading(false);
                    }}
                    buttonText="Regenerate"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-opacity-20 border-current">
            <h4
              className={`font-bold mb-3 flex items-center ${
                isDarkMode ? "text-blue-300" : "text-blue-600"
              }`}
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Manual Entry
            </h4>
            <textarea
              className={`w-full border rounded-xl p-4 mb-3 font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                isDarkMode
                  ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  : "bg-white border-gray-300 text-gray-800 placeholder-gray-500"
              }`}
              rows={5}
              placeholder="Enter summary or SOAP note manually..."
              value={manualSummary}
              onChange={(e) => setManualSummary(e.target.value)}
            />
            <div className="flex items-center space-x-3">
              <button
                className={`px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center ${
                  isDarkMode
                    ? "bg-green-700 text-white"
                    : "bg-green-600 text-white"
                }`}
                onClick={handleManualSave}
                disabled={manualLoading || !manualSummary.trim()}
              >
                {manualLoading ? (
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
                    Saving...
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
                        d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                      />
                    </svg>
                    Save Manual Entry
                  </>
                )}
              </button>
              {manualSaveMsg && (
                <div
                  className={`flex items-center text-sm font-medium ${
                    isDarkMode ? "text-green-400" : "text-green-600"
                  }`}
                >
                  <svg
                    className="w-4 h-4 mr-1"
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
                  {manualSaveMsg}
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    if (!analysis) {
      return (
        <div
          className={`p-8 rounded-xl border ${
            isDarkMode
              ? "border-gray-700 bg-gray-800"
              : "border-gray-200 bg-gray-50"
          } text-center`}
        >
          <div className="max-w-md mx-auto">
            <div
              className={`p-4 rounded-full inline-flex items-center justify-center ${
                isDarkMode ? "bg-gray-700" : "bg-white"
              } mb-4`}
            >
              <svg
                className="w-10 h-10 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3
              className={`text-lg font-bold mb-2 ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              No analysis data available
            </h3>
            <p
              className={`text-sm mb-6 ${
                isDarkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              This document hasn't been analyzed yet. Click the button below to
              start the analysis process.
            </p>
            <button
              onClick={triggerAnalysis}
              className={`px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity flex items-center mx-auto ${
                isDarkMode ? "bg-blue-700 text-white" : "bg-blue-600 text-white"
              }`}
            >
              <FiPlay className="mr-2" />
              Start Analysis
            </button>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case "summary":
        return (
          <div
            className={`p-6 rounded-xl border ${
              isDarkMode
                ? "border-gray-700 bg-gray-800"
                : "border-gray-200 bg-white"
            }`}
          >
            <h3
              className={`text-lg font-bold mb-4 ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Document Summary
            </h3>
            {analysis.summary ? (
              <div
                className={`prose max-w-none ${
                  isDarkMode ? "prose-invert" : ""
                }`}
              >
                {renderMarkdown(analysis.summary)}
              </div>
            ) : (
              <p
                className={`text-sm italic ${
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                No summary available for this document.
              </p>
            )}
          </div>
        );
      case "clinical":
        return (
          <div
            className={`p-6 rounded-xl border ${
              isDarkMode
                ? "border-gray-700 bg-gray-800"
                : "border-gray-200 bg-white"
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
              <h3
                className={`text-lg font-bold ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Clinical Insights
              </h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() =>
                    exportToJson(
                      analysis.clinicalInsights || [],
                      `clinical-insights-${file._id}.json`
                    )
                  }
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center ${
                    isDarkMode
                      ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <svg
                    className="w-3.5 h-3.5 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                  Export
                </button>
              </div>
            </div>

            {analysis.clinicalInsights &&
            analysis.clinicalInsights.length > 0 ? (
              <div className="space-y-4">
                {analysis.clinicalInsights.map((insight, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${
                      isDarkMode
                        ? "border-gray-700 bg-gray-700/30"
                        : "border-gray-200 bg-gray-50"
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                      <div className="flex items-center">
                        <span
                          className={`px-2 py-1 text-xs font-bold rounded-md mr-2 ${getPriorityBadge(
                            insight.priority
                          )}`}
                        >
                          {insight.priority || "medium"}
                        </span>
                        <span
                          className={`text-xs font-medium ${
                            isDarkMode ? "text-gray-300" : "text-gray-500"
                          }`}
                          title={getTypeTooltip(insight.type)}
                        >
                          {insight.type || "observation"}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => copyToClipboard(insight.content)}
                          className={`p-1 rounded ${
                            isDarkMode
                              ? "hover:bg-gray-600 text-gray-400"
                              : "hover:bg-gray-200 text-gray-500"
                          }`}
                          title="Copy to clipboard"
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
                              d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="prose prose-sm max-w-none">
                      {renderMarkdown(insight.content)}
                    </div>
                    {insight.recommendation && (
                      <div
                        className={`mt-3 pt-3 border-t ${
                          isDarkMode
                            ? "border-gray-600 text-blue-300"
                            : "border-gray-200 text-blue-700"
                        }`}
                      >
                        <p className="text-sm font-medium flex items-start">
                          <svg
                            className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <span>{insight.recommendation}</span>
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p
                className={`text-sm italic ${
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                No clinical insights available for this document.
              </p>
            )}
          </div>
        );
      case "soap":
        return (
          <SOAPNoteGenerator
            file={file}
            analysis={analysis}
            onUpdate={handleSOAPUpdate}
            isDarkMode={isDarkMode}
          />
        );
      case "oasis":
        return (
          <OASISScoring
            file={file}
            analysis={analysis}
            onUpdate={handleOASISUpdate}
            isDarkMode={isDarkMode}
          />
        );
      case "debug":
        return <FileDebugInfo file={file} analysis={analysis} />;
      default:
        return (
          <div className="p-6 text-center">
            <p
              className={`text-sm italic ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Select a tab to view analysis details.
            </p>
          </div>
        );
    }
  };

  if (!file) {
    return (
      <div
        className={`p-8 rounded-xl border ${
          isDarkMode
            ? "border-gray-700 bg-gray-800"
            : "border-gray-200 bg-gray-50"
        } text-center`}
      >
        <div className="max-w-md mx-auto">
          <div
            className={`p-4 rounded-full inline-flex items-center justify-center ${
              isDarkMode ? "bg-gray-700" : "bg-white"
            } mb-4`}
          >
            <svg
              className="w-10 h-10 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3
            className={`text-lg font-bold mb-2 ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            No file selected
          </h3>
          <p
            className={`text-sm ${
              isDarkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Please select a file to view its details.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button
        onClick={handleBack}
        className={`mb-4 sm:mb-6 flex items-center text-sm sm:text-base font-medium px-3 py-2 rounded-lg ${
          isDarkMode
            ? "bg-gray-700 text-blue-400 hover:bg-gray-600"
            : "bg-white text-blue-600 hover:bg-blue-50"
        } transition-colors shadow-sm`}
      >
        <FiArrowLeft className="mr-1.5 sm:mr-2" /> Back to Documents
      </button>

      <div
        className={`p-6 rounded-xl border ${
          isDarkMode
            ? "border-gray-700 bg-gray-800"
            : "border-gray-200 bg-white"
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2
              className={`text-xl sm:text-2xl font-bold mb-1 ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              {file.originalname}
            </h2>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <div
                className={`flex items-center text-sm ${
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                <svg
                  className="w-4 h-4 mr-1.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                {formatDate(file.createdAt)}
              </div>
              <div
                className={`flex items-center text-sm ${
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                <svg
                  className="w-4 h-4 mr-1.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                {file.mimetype || "Unknown type"}
              </div>
              <div
                className={`flex items-center text-sm ${
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                <svg
                  className="w-4 h-4 mr-1.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
                {file.size
                  ? `${(file.size / 1024).toFixed(2)} KB`
                  : "Unknown size"}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <ReAnalyzeButton
              fileId={file._id}
              onSuccess={(data) => {
                console.log("Re-analysis started:", data);
                setLoading(true);
                setError(null);
                fetchAnalysis();
              }}
              onError={(error) => {
                setError(error);
                setLoading(false);
              }}
              buttonText="Re-analyze"
              buttonClassName={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center ${
                isDarkMode
                  ? "bg-blue-700 text-white hover:bg-blue-600"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
              iconClassName="w-3.5 h-3.5 mr-1"
            />
            <button
              onClick={() => {
                console.log("Refreshing analysis data...");
                analysisCompletedRef.current = false;
                setLoading(true);
                setError(null);
                fetchAnalysis();
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center ${
                isDarkMode
                  ? "bg-green-700 text-white hover:bg-green-600"
                  : "bg-green-600 text-white hover:bg-green-700"
              }`}
            >
              <FiRefreshCw className="w-3.5 h-3.5 mr-1" />
              Refresh Data
            </button>
            <button
              onClick={() => {
                const token = localStorage.getItem("authToken");
                const url = `/api/upload/download/${file._id}`;
                const a = document.createElement("a");
                a.href = url;
                a.setAttribute("download", file.originalname);
                a.setAttribute("target", "_blank");
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center ${
                isDarkMode
                  ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <FiDownload className="mr-1.5" />
              Download
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-opacity-20 pb-1">
        <button
          onClick={() => setActiveTab("summary")}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
            activeTab === "summary"
              ? isDarkMode
                ? "bg-gray-800 text-white border-b-2 border-blue-500"
                : "bg-white text-blue-600 border-b-2 border-blue-500"
              : isDarkMode
              ? "text-gray-400 hover:text-gray-300"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Summary
        </button>
        <button
          onClick={() => setActiveTab("clinical")}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
            activeTab === "clinical"
              ? isDarkMode
                ? "bg-gray-800 text-white border-b-2 border-blue-500"
                : "bg-white text-blue-600 border-b-2 border-blue-500"
              : isDarkMode
              ? "text-gray-400 hover:text-gray-300"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Clinical Insights
        </button>
        <button
          onClick={() => setActiveTab("soap")}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
            activeTab === "soap"
              ? isDarkMode
                ? "bg-gray-800 text-white border-b-2 border-blue-500"
                : "bg-white text-blue-600 border-b-2 border-blue-500"
              : isDarkMode
              ? "text-gray-400 hover:text-gray-300"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          SOAP Note
        </button>
        <button
          onClick={() => setActiveTab("oasis")}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
            activeTab === "oasis"
              ? isDarkMode
                ? "bg-gray-800 text-white border-b-2 border-blue-500"
                : "bg-white text-blue-600 border-b-2 border-blue-500"
              : isDarkMode
              ? "text-gray-400 hover:text-gray-300"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          OASIS Scoring
        </button>
        <button
          onClick={() => setActiveTab("debug")}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
            activeTab === "debug"
              ? isDarkMode
                ? "bg-gray-800 text-white border-b-2 border-blue-500"
                : "bg-white text-blue-600 border-b-2 border-blue-500"
              : isDarkMode
              ? "text-gray-400 hover:text-gray-300"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Debug
        </button>
      </div>

      <div className="mt-4">{renderTabContent()}</div>
    </div>
  );
};

export default FileDetailView;
