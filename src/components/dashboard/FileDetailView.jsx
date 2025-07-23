import { useState, useEffect } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import { API_ENDPOINTS } from "../../config/api";
import { regenerateAnalysis } from "../../services/api";
import OASISScoring from "./OASISScoring";
import SOAPNoteGenerator from "./SOAPNoteGenerator";
import FileDebugInfo from "./FileDebugInfo";
import ProcessingStatus from "./ProcessingStatus";
import ReAnalyzeButton from "./ReAnalyzeButton";
import AnalysisProgress from "./AnalysisProgress";
import {
  FiArrowLeft,
  FiDownload,
  FiRefreshCw,
  FiPlay,
  FiFileText,
} from "react-icons/fi";

const FileDetailView = ({ file, onBack }) => {
  const { isDarkMode } = useTheme();
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

  useEffect(() => {
    if (file) {
      fetchAnalysis();

      if (file.processingStatus === "processing") {
        const interval = setInterval(() => {
          fetchAnalysis();
        }, 3000);

        setPollingInterval(interval);

        return () => {
          clearInterval(interval);
          setPollingInterval(null);
        };
      } else if (pollingInterval) {
        clearInterval(pollingInterval);
        setPollingInterval(null);
      }
    }

    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [file, file?.processingStatus]);

  // Handle analysis completion from AnalysisProgress component
  const handleAnalysisComplete = (result) => {
    if (result) {
      // Update the analysis state with the new data
      setAnalysis((prevAnalysis) => ({
        ...prevAnalysis,
        ...result,
      }));

      // Update the file object with the new data
      if (file) {
        if (result.summary) file.aiSummary = result.summary;
        if (result.oasisScores) file.oasisScores = result.oasisScores;
        if (result.soapNote) file.soapNote = result.soapNote;
        if (result.clinicalInsights)
          file.clinicalInsights = result.clinicalInsights;
        file.processingStatus = "completed";
      }

      setLoading(false);
    }
  };

  const fetchAnalysis = async () => {
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

      const response = await fetch(`${API_ENDPOINTS.AI}/analysis/${file._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setAnalysis(await response.json());
      } else {
        const errorData = await response
          .json()
          .catch(() => ({ message: "Unknown error" }));
        throw new Error(errorData.message || "Failed to fetch analysis");
      }
    } catch (error) {
      console.error("Error fetching analysis:", error);
      setError(error.message || "Failed to fetch analysis");
    } finally {
      setLoading(false);
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
      setError(error.message || "Failed to analyze document");
      setLoading(false);
    }
  };

  const retryAnalysis = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log("Regenerating analysis for file:", file._id);
      const result = await regenerateAnalysis(file._id);

      if (result.success) {
        setTimeout(() => {
          fetchAnalysis();
        }, 2000);
      } else {
        setError(result.message || "Failed to regenerate analysis");
      }
    } catch (err) {
      console.error("Error regenerating analysis:", err);
      setError(err.message || "Failed to regenerate analysis");
    } finally {
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
                <p
                  className={`text-sm mb-4 ${
                    isDarkMode ? "text-red-200" : "text-red-700"
                  }`}
                >
                  {error}. Please try again later or enter data manually below.
                </p>
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
                className="w-10 h-10"
                fill="none"
                stroke={isDarkMode ? colors.primaryLight : colors.primary}
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
              className={`text-lg font-bold mb-3 ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              No analysis available for this document
            </h3>
            <p
              className={`text-sm mb-6 ${
                isDarkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Click the button below to analyze this document and extract
              clinical insights automatically.
            </p>
            <button
              onClick={triggerAnalysis}
              disabled={loading}
              className={`px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              } ${
                isDarkMode ? "bg-blue-600 text-white" : "bg-blue-500 text-white"
              } flex items-center mx-auto`}
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
                  Analyzing...
                </>
              ) : (
                <>
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
                      d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                    />
                  </svg>
                  Analyze Document
                </>
              )}
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {activeTab === "summary" && (
          <div
            className={`p-6 rounded-xl border ${
              isDarkMode
                ? "border-gray-700 bg-gray-800"
                : "border-gray-200 bg-white"
            }`}
          >
            <div className="flex items-center mb-4">
              <div
                className={`p-2 rounded-lg ${
                  isDarkMode ? "bg-blue-900 bg-opacity-30" : "bg-blue-100"
                } mr-3`}
              >
                <svg
                  className="w-5 h-5 text-blue-500"
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
                className={`text-lg font-bold ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Summary & Clinical Insights
              </h3>
            </div>

            {analysis.summary || file.aiSummary ? (
              <div
                className={`p-4 rounded-lg ${
                  isDarkMode ? "bg-gray-700" : "bg-gray-50"
                }`}
              >
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <button
                    className="px-2 sm:px-3 py-1 rounded bg-[#2596be] text-white text-xs font-bold hover:bg-[#1d7a9c] flex-shrink-0"
                    onClick={() =>
                      copyToClipboard(analysis.summary || file.aiSummary)
                    }
                  >
                    <span className="hidden sm:inline">Copy Summary</span>
                    <span className="sm:hidden">Copy</span>
                  </button>
                  <button
                    className="px-2 sm:px-3 py-1 rounded bg-[#96be25] text-white text-xs font-bold hover:bg-[#7a9c1d] flex-shrink-0"
                    onClick={() =>
                      exportToJson(
                        analysis.summary || file.aiSummary,
                        `${file.originalname}-summary.json`
                      )
                    }
                  >
                    <span className="hidden sm:inline">Export Summary</span>
                    <span className="sm:hidden">Export</span>
                  </button>
                  <button
                    className="px-2 sm:px-3 py-1 rounded bg-[#e74c3c] text-white text-xs font-bold hover:bg-[#c0392b] flex items-center flex-shrink-0"
                    onClick={async () => {
                      try {
                        setLoading(true);
                        const token = localStorage.getItem("authToken");
                        const response = await fetch(
                          `${API_ENDPOINTS.AI}/custom/${file._id}`,
                          {
                            method: "POST",
                            headers: {
                              "Content-Type": "application/json",
                              Authorization: `Bearer ${token}`,
                            },
                            body: JSON.stringify({
                              type: "summary",
                            }),
                          }
                        );

                        if (response.ok) {
                          const data = await response.json();
                          setAnalysis((prev) => ({
                            ...prev,
                            summary: data.result,
                          }));
                          if (file) {
                            file.aiSummary = data.result;
                          }
                        } else {
                          throw new Error("Failed to regenerate summary");
                        }
                      } catch (error) {
                        console.error("Error regenerating summary:", error);
                      } finally {
                        setLoading(false);
                      }
                    }}
                  >
                    <svg
                      className="w-3 h-3 mr-1"
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
                    <span className="hidden sm:inline">Regenerate</span>
                    <span className="sm:hidden">Regen</span>
                  </button>
                </div>
                <p
                  className={`whitespace-pre-wrap font-medium ${
                    isDarkMode ? "text-gray-200" : "text-gray-700"
                  }`}
                >
                  {analysis.summary || file.aiSummary}
                </p>
              </div>
            ) : (
              <div
                className={`p-8 text-center rounded-lg ${
                  isDarkMode ? "bg-gray-700" : "bg-gray-50"
                }`}
              >
                <p
                  className={`${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  } mb-4`}
                >
                  No summary available for this document
                </p>
                <button
                  className="px-4 py-2 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 flex items-center mx-auto"
                  onClick={async () => {
                    try {
                      setLoading(true);
                      const token = localStorage.getItem("authToken");
                      const response = await fetch(
                        `${API_ENDPOINTS.AI}/custom/${file._id}`,
                        {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                          },
                          body: JSON.stringify({
                            type: "summary",
                          }),
                        }
                      );

                      if (response.ok) {
                        const data = await response.json();
                        setAnalysis((prev) => ({
                          ...prev,
                          summary: data.result,
                        }));
                        if (file) {
                          file.aiSummary = data.result;
                        }
                      } else {
                        throw new Error("Failed to generate summary");
                      }
                    } catch (error) {
                      console.error("Error generating summary:", error);
                    } finally {
                      setLoading(false);
                    }
                  }}
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
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Generate Summary
                </button>
              </div>
            )}
            {/* Clinical Insights */}
            <div className="mt-6">
              <div className="flex flex-wrap items-center justify-between mb-2">
                <h4 className="font-bold text-base text-gray-700 flex items-center mb-2 sm:mb-0">
                  Clinical Insights
                </h4>

                <button
                  className="px-2 sm:px-3 py-1 rounded bg-[#e74c3c] text-white text-xs font-bold hover:bg-[#c0392b] flex items-center"
                  onClick={async () => {
                    try {
                      setLoading(true);
                      const token = localStorage.getItem("authToken");
                      const response = await fetch(
                        `${API_ENDPOINTS.AI}/custom/${file._id}`,
                        {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                          },
                          body: JSON.stringify({
                            type: "insights",
                          }),
                        }
                      );

                      if (response.ok) {
                        const data = await response.json();
                        setAnalysis((prev) => ({
                          ...prev,
                          clinicalInsights: data.result,
                        }));
                        if (file) {
                          file.clinicalInsights = data.result;
                        }
                      } else {
                        throw new Error("Failed to regenerate insights");
                      }
                    } catch (error) {
                      console.error("Error regenerating insights:", error);
                    } finally {
                      setLoading(false);
                    }
                  }}
                >
                  <svg
                    className="w-3 h-3 mr-1"
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
                  <span className="hidden sm:inline">Regenerate Insights</span>
                  <span className="sm:hidden">Regen</span>
                </button>
              </div>

              {Array.isArray(analysis.clinicalInsights) &&
              analysis.clinicalInsights.length > 0 ? (
                <>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <button
                      className="px-2 sm:px-3 py-1 rounded bg-[#2596be] text-white text-xs font-bold hover:bg-[#1d7a9c] flex-shrink-0"
                      onClick={() =>
                        copyToClipboard(
                          JSON.stringify(analysis.clinicalInsights, null, 2)
                        )
                      }
                    >
                      <span className="hidden sm:inline">Copy Insights</span>
                      <span className="sm:hidden">Copy</span>
                    </button>
                    <button
                      className="px-2 sm:px-3 py-1 rounded bg-[#96be25] text-white text-xs font-bold hover:bg-[#7a9c1d] flex-shrink-0"
                      onClick={() =>
                        exportToJson(
                          analysis.clinicalInsights,
                          `${file.originalname}-insights.json`
                        )
                      }
                    >
                      <span className="hidden sm:inline">Export Insights</span>
                      <span className="sm:hidden">Export</span>
                    </button>
                  </div>
                  <ul className="space-y-3">
                    {analysis.clinicalInsights.map((insight, idx) => (
                      <li
                        key={idx}
                        className="p-3 rounded-lg border border-gray-200 bg-white dark:bg-gray-700 flex flex-col gap-1"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-bold ${getPriorityBadge(
                              insight.priority
                            )}`}
                          >
                            {insight.priority || "info"}
                          </span>
                          <span
                            className="text-xs text-gray-500"
                            title={getTypeTooltip(insight.type)}
                          >
                            {insight.type}
                            <svg
                              className="inline ml-1 w-3 h-3 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <circle cx="12" cy="12" r="10" strokeWidth="2" />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M12 16v-4m0-4h.01"
                              />
                            </svg>
                          </span>
                        </div>
                        <div
                          className={`text-sm ${
                            isDarkMode ? "text-gray-200" : "text-gray-700"
                          }`}
                        >
                          {insight.message}
                        </div>
                        {insight.evidence && (
                          <div className="text-xs mt-1 text-gray-400">
                            Evidence: {insight.evidence}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <div className="p-8 text-center rounded-lg bg-gray-50 dark:bg-gray-700">
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    No clinical insights available for this document
                  </p>
                  <button
                    className="px-4 py-2 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 flex items-center mx-auto"
                    onClick={async () => {
                      try {
                        setLoading(true);
                        const token = localStorage.getItem("authToken");
                        const response = await fetch(
                          `${API_ENDPOINTS.AI}/custom/${file._id}`,
                          {
                            method: "POST",
                            headers: {
                              "Content-Type": "application/json",
                              Authorization: `Bearer ${token}`,
                            },
                            body: JSON.stringify({
                              type: "insights",
                            }),
                          }
                        );

                        if (response.ok) {
                          const data = await response.json();
                          setAnalysis((prev) => ({
                            ...prev,
                            clinicalInsights: data.result,
                          }));
                          if (file) {
                            file.clinicalInsights = data.result;
                          }
                        } else {
                          throw new Error("Failed to generate insights");
                        }
                      } catch (error) {
                        console.error("Error generating insights:", error);
                      } finally {
                        setLoading(false);
                      }
                    }}
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
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                    Generate Insights
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
        {activeTab === "oasis" && (
          <OASISScoring
            file={file}
            analysis={analysis}
            scores={analysis.oasisScores || {}}
            onUpdate={handleOASISUpdate}
            primaryColor={colors.primary}
            accentColor={colors.accent}
            isDarkMode={isDarkMode}
          />
        )}
        {activeTab === "soap" && (
          <SOAPNoteGenerator
            file={file}
            analysis={analysis}
            note={analysis.soapNote || ""}
            onUpdate={handleSOAPUpdate}
            primaryColor={colors.primary}
            accentColor={colors.accent}
            isDarkMode={isDarkMode}
          />
        )}
      </div>
    );
  };

  // Helper: file type icon/avatar
  const getFileAvatar = () => {
    let bg = colors.primary;
    let icon = <FiFileText size={22} color="#fff" />;
    if (file.mimetype?.includes("pdf")) {
      bg = "#e53e3e";
      icon = (
        <svg
          className="w-6 h-6 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"
          />
        </svg>
      );
    } else if (file.mimetype?.includes("image")) {
      bg = colors.accent;
      icon = (
        <svg
          className="w-6 h-6 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 19V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2zM8.5 13.5l2.5 3.5 3.5-4.5 4.5 6H5l3.5-5z"
          />
        </svg>
      );
    }
    return (
      <div
        className="flex items-center justify-center rounded-full shadow-md"
        style={{ background: bg, width: 48, height: 48 }}
      >
        {icon}
      </div>
    );
  };

  if (!file) return null;

  return (
    <div className="w-full p-2 sm:p-4 md:p-6">
      {/* Back Button */}
      <button
        onClick={onBack}
        className={`flex items-center mb-4 sm:mb-6 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-medium text-xs sm:text-sm shadow-sm border border-transparent ${
          isDarkMode
            ? "bg-gray-800 hover:bg-gray-700 text-blue-400"
            : "bg-white hover:bg-gray-50 text-[#2596be]"
        } focus:outline-none focus:ring-2 focus:ring-[#96be25]`}
        style={{ boxShadow: "0 1px 4px 0 rgba(37,150,190,0.08)" }}
      >
        <FiArrowLeft className="mr-1.5 sm:mr-2" /> Back to Documents
      </button>

      {/* Main File Card */}
      <div
        className={`rounded-xl sm:rounded-2xl md:rounded-3xl shadow-lg sm:shadow-xl p-3 sm:p-4 md:p-6 flex flex-col md:flex-row items-center md:items-start gap-3 sm:gap-4 md:gap-6 ${
          isDarkMode
            ? "bg-gray-800 border-2 border-gray-700"
            : "bg-[#f6fcf3] border-2 border-[#96be25]"
        } mb-4 sm:mb-6 md:mb-8`}
        style={{
          boxShadow: isDarkMode ? "none" : "0 4px 24px 0 rgba(150,190,37,0.08)",
        }}
      >
        {/* Avatar on top for mobile */}
        <div className="mb-2 sm:mb-3 md:mb-0 md:mr-4 flex-shrink-0 flex flex-col items-center w-full md:w-auto">
          {getFileAvatar()}
        </div>
        <div className="flex-1 w-full">
          {/* File Name & Metadata */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div className="min-w-0">
              <h2
                className={`text-base sm:text-lg md:text-xl font-bold flex items-center mb-1 sm:mb-2 truncate ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {file.originalname}
              </h2>
              <div className="flex flex-wrap gap-1 sm:gap-2 mt-1 text-[10px] sm:text-xs font-medium">
                <span
                  className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full border ${
                    isDarkMode
                      ? "border-gray-700 bg-gray-700 text-gray-300"
                      : "border-[#e2e8f0] bg-white text-gray-600"
                  }`}
                >
                  Type: {file.mimetype || "Unknown"}
                </span>
                <span
                  className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full border ${
                    isDarkMode
                      ? "border-gray-700 bg-gray-700 text-gray-300"
                      : "border-[#e2e8f0] bg-white text-gray-600"
                  }`}
                >
                  Size:{" "}
                  {file.size
                    ? `${(file.size / 1024 / 1024).toFixed(2)} MB`
                    : "-"}
                </span>
                <span
                  className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full border ${
                    isDarkMode
                      ? "border-gray-700 bg-gray-700 text-gray-300"
                      : "border-[#e2e8f0] bg-white text-gray-600"
                  }`}
                >
                  Uploaded: {formatDate(file.createdAt)}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2 md:mt-0">
              <span
                className="px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-medium rounded-full"
                style={{
                  backgroundColor: isDarkMode
                    ? `${getStatusConfig(file.processingStatus).color}30`
                    : getStatusConfig(file.processingStatus).bg,
                  color: getStatusConfig(file.processingStatus).color,
                }}
              >
                {getStatusConfig(file.processingStatus).icon}
                <span className="ml-1">
                  {file.processingStatus === "processing" && "Processing"}
                  {file.processingStatus === "pending" && "Pending"}
                  {file.processingStatus === "completed" && "Complete"}
                  {file.processingStatus === "failed" && "Failed"}
                </span>
              </span>
            </div>
          </div>

          {/* Quick Actions Section */}
          <div className="mt-3 sm:mt-4 md:mt-6">
            <h3
              className={`font-bold text-xs sm:text-sm mb-1.5 sm:mb-2 flex items-center ${
                isDarkMode ? "text-gray-300" : "text-gray-800"
              }`}
            >
              <FiFileText className="mr-1.5 sm:mr-2 text-[#2596be]" /> Quick
              Actions
            </h3>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                onClick={() => {
                  const token = localStorage.getItem("authToken");
                  const downloadUrl = `${API_ENDPOINTS.UPLOAD}/download/${file._id}`;

                  // Create a hidden form to submit the token with the request
                  const form = document.createElement("form");
                  form.method = "GET";
                  form.action = downloadUrl;
                  form.target = "_blank";

                  // Add the token as a hidden field
                  const tokenField = document.createElement("input");
                  tokenField.type = "hidden";
                  tokenField.name = "token";
                  tokenField.value = token;
                  form.appendChild(tokenField);

                  // Submit the form
                  document.body.appendChild(form);
                  form.submit();
                  document.body.removeChild(form);
                }}
                className="flex-1 flex items-center justify-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-[#2596be] text-white font-medium text-xs sm:text-sm shadow hover:bg-[#1d7a9c] focus:outline-none focus:ring-2 focus:ring-[#2596be] transition-all"
              >
                <FiDownload className="mr-1.5 sm:mr-2" /> Download
              </button>
              {file.processingStatus === "pending" && (
                <button
                  onClick={triggerAnalysis}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-[#96be25] text-white font-medium text-xs sm:text-sm shadow hover:bg-[#7a9c1d] focus:outline-none focus:ring-2 focus:ring-[#96be25] disabled:opacity-60 transition-all"
                >
                  <FiPlay className="mr-1.5 sm:mr-2" /> Analyze
                </button>
              )}
              {file.processingStatus === "failed" && (
                <button
                  onClick={retryAnalysis}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-red-500 text-white font-medium text-xs sm:text-sm shadow hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-60 transition-all"
                >
                  <FiRefreshCw className="mr-1.5 sm:mr-2" /> Retry
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div
        className={`rounded-xl sm:rounded-2xl ${
          isDarkMode
            ? "bg-gray-800 border border-gray-700"
            : "bg-[#f8fafc] border border-[#e2e8f0]"
        } shadow-lg mb-4 sm:mb-6 md:mb-8`}
      >
        <nav className="flex flex-wrap space-x-1 sm:space-x-2 md:space-x-4 px-2 sm:px-3 md:px-4 pt-2 sm:pt-3 md:pt-4 overflow-x-auto">
          {[
            { id: "summary", label: "Summary", icon: "📋" },
            { id: "oasis", label: "OASIS", icon: "📊" },
            { id: "soap", label: "SOAP", icon: "📝" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-1.5 sm:py-2 px-2 sm:px-3 rounded-lg font-medium text-xs sm:text-sm flex items-center transition-all duration-150 ${
                activeTab === tab.id
                  ? isDarkMode
                    ? "bg-gray-700 text-blue-400"
                    : "bg-white shadow text-[#2596be]"
                  : isDarkMode
                  ? "text-gray-400 hover:text-gray-300"
                  : "text-gray-500 hover:text-[#2596be]"
              } focus:outline-none focus:ring-2 focus:ring-[#2596be]`}
              style={{
                borderBottom:
                  activeTab === tab.id
                    ? `3px solid ${isDarkMode ? "#3b82f6" : "#2596be"}`
                    : "3px solid transparent",
              }}
            >
              <span className="mr-1 sm:mr-2">{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="inline sm:hidden">
                {tab.label.substring(0, 3)}
              </span>
            </button>
          ))}
        </nav>
        <div className="p-2 sm:p-3 md:p-4">
          {/* Section Heading */}
          <h4
            className={`font-bold text-sm sm:text-base mb-2 sm:mb-4 border-b pb-1 sm:pb-2 ${
              isDarkMode
                ? "text-gray-300 border-gray-700"
                : "text-gray-700 border-[#e2e8f0]"
            }`}
          >
            File Details
          </h4>
          <FileDebugInfo file={file} isDarkMode={isDarkMode} />
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default FileDetailView;
