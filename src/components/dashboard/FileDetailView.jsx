import { useState, useEffect } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import { API_ENDPOINTS } from "../../config/api";
import { regenerateAnalysis } from "../../services/api";
import OASISScoring from "./OASISScoring";
import SOAPNoteGenerator from "./SOAPNoteGenerator";
import FileDebugInfo from "./FileDebugInfo";

const FileDetailView = ({ file, onClose }) => {
  const { isDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState("summary");
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pollingInterval, setPollingInterval] = useState(null);
  const [manualSummary, setManualSummary] = useState("");
  const [manualSaveMsg, setManualSaveMsg] = useState("");
  const [manualLoading, setManualLoading] = useState(false);

  useEffect(() => {
    if (file) {
      fetchAnalysis();

      // Set up polling for processing files
      if (file.processingStatus === "processing") {
        const interval = setInterval(() => {
          fetchAnalysis();
        }, 3000); // Poll every 3 seconds

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

    // Cleanup on unmount
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [file, file?.processingStatus]);

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
        // After analysis is complete, fetch the results
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
        // Wait a moment and then fetch the updated analysis
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

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  // Save manual data (simulate API call)
  const handleManualSave = () => {
    setManualLoading(true);
    setTimeout(() => {
      setManualLoading(false);
      setManualSaveMsg("Saved successfully!");
      setTimeout(() => setManualSaveMsg(""), 2000);
    }, 1000);
  };

  const renderTabContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-custom"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="p-6 bg-red-50 rounded-lg">
          <p className="text-red-800 font-semibold mb-2">
            AI analysis is currently unavailable. Please try again later or
            enter data manually below.
          </p>
          <button
            onClick={fetchAnalysis}
            className="mt-2 px-4 py-2 bg-primary-custom text-white rounded-lg text-sm font-medium hover:bg-primary-custom/90"
          >
            Retry
          </button>
          <div className="mt-6">
            <h4 className="font-bold mb-2">Manual Entry</h4>
            <textarea
              className="w-full border border-gray-300 rounded p-2 mb-2"
              rows={4}
              placeholder="Enter summary or SOAP note manually..."
              value={manualSummary}
              onChange={(e) => setManualSummary(e.target.value)}
            />
            <button
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              onClick={handleManualSave}
              disabled={manualLoading || !manualSummary.trim()}
            >
              {manualLoading ? "Saving..." : "Save Manual Entry"}
            </button>
            {manualSaveMsg && (
              <div className="text-green-700 mt-2">{manualSaveMsg}</div>
            )}
          </div>
        </div>
      );
    }

    if (!analysis) {
      return (
        <div className="text-center py-12">
          <div className="mb-4">
            <svg
              className="w-16 h-16 text-gray-400 mx-auto mb-4"
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
            <p className="text-gray-500 mb-4">
              No analysis available for this document
            </p>
            <button
              onClick={triggerAnalysis}
              disabled={loading}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                loading
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-primary-custom text-white hover:bg-opacity-90"
              }`}
            >
              {loading ? "Analyzing..." : "Analyze Document"}
            </button>
            <div className="mt-6">
              <h4 className="font-bold mb-2">Manual Entry</h4>
              <textarea
                className="w-full border border-gray-300 rounded p-2 mb-2"
                rows={4}
                placeholder="Enter summary or SOAP note manually..."
                value={manualSummary}
                onChange={(e) => setManualSummary(e.target.value)}
              />
              <button
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                onClick={handleManualSave}
                disabled={manualLoading || !manualSummary.trim()}
              >
                {manualLoading ? "Saving..." : "Save Manual Entry"}
              </button>
              {manualSaveMsg && (
                <div className="text-green-700 mt-2">{manualSaveMsg}</div>
              )}
            </div>
          </div>
        </div>
      );
    }

    // Add default return for when analysis exists
    return (
      <div>
        {activeTab === "summary" && (
          <div>
            {analysis.summary && (
              <div
                className={`${
                  isDarkMode ? "bg-gray-700" : "bg-gray-50"
                } p-4 rounded-lg mb-4`}
              >
                <h3
                  className={`font-bold mb-2 ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Summary
                </h3>
                <p
                  className={`whitespace-pre-wrap ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  {analysis.summary}
                </p>
              </div>
            )}
          </div>
        )}
        {activeTab === "oasis" && (
          <OASISScoring
            file={file}
            analysis={analysis}
            scores={analysis.oasisScores || {}}
            onUpdate={handleOASISUpdate}
          />
        )}
        {activeTab === "soap" && (
          <SOAPNoteGenerator
            file={file}
            analysis={analysis}
            note={analysis.soapNote || ""}
            onUpdate={handleSOAPUpdate}
          />
        )}
      </div>
    );
  };

  if (!file) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        className={`${
          isDarkMode ? "bg-gray-800" : "bg-white"
        } rounded-lg shadow-xl w-full max-w-6xl mx-4 max-h-[90vh] flex flex-col`}
      >
        {/* Header */}
        <div
          className={`p-6 border-b ${
            isDarkMode ? "border-gray-700" : "border-gray-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <h2
                className={`text-xl font-bold ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                <a
                  href={`/api/upload/view/${file._id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary-custom hover:underline transition-colors cursor-pointer flex items-center"
                >
                  {file.originalname}
                  <svg
                    className="w-4 h-4 ml-2 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </a>
              </h2>
              <div className="flex items-center mt-1">
                <span className="text-sm text-gray-500 mr-3">
                  Uploaded {formatDate(file.createdAt)}
                </span>
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(
                      file.processingStatus
                    )}`}
                  >
                    {file.processingStatus === "processing" && (
                      <span className="inline-flex items-center">
                        <svg
                          className="animate-spin -ml-1 mr-1 h-3 w-3 text-current"
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
                      </span>
                    )}
                    {file.processingStatus === "pending" && "Pending Analysis"}
                    {file.processingStatus === "completed" &&
                      "Analysis Complete"}
                    {file.processingStatus === "failed" && "Analysis Failed"}
                  </span>

                  {/* Action buttons based on status */}
                  {file.processingStatus === "pending" && (
                    <button
                      onClick={triggerAnalysis}
                      disabled={loading}
                      className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:opacity-50"
                    >
                      Start Analysis
                    </button>
                  )}

                  {file.processingStatus === "failed" && (
                    <button
                      onClick={retryAnalysis}
                      disabled={loading}
                      className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors disabled:opacity-50"
                    >
                      Retry Analysis
                    </button>
                  )}
                </div>
              </div>
            </div>
            <div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="w-6 h-6"
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
          </div>
        </div>

        {/* Processing Error Display */}
        {file.processingStatus === "failed" && file.processingError && (
          <div className="mx-6 mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <svg
                className="w-5 h-5 text-red-400 mt-0.5 mr-3"
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
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-800 mb-1">
                  Analysis Failed
                </h3>
                <p className="text-sm text-red-700 mb-3">
                  {file.processingError}
                </p>
                <button
                  onClick={retryAnalysis}
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {loading ? "Retrying..." : "Retry Analysis"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* General Error Display */}
        {error && (
          <div className="mx-6 mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <svg
                className="w-5 h-5 text-red-400 mt-0.5 mr-3"
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
              <div className="flex-1">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: "summary", label: "Summary & Insights", icon: "📋" },
              { id: "oasis", label: "OASIS Scoring", icon: "📊" },
              { id: "soap", label: "SOAP Notes", icon: "📝" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-primary-custom text-primary-custom"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <FileDebugInfo file={file} />
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default FileDetailView;
