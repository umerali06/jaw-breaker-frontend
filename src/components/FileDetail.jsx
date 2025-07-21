import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getFileById,
  analyzeFile,
  getAnalysis,
  generateCustomAnalysis,
} from "../services/api";
import LoadingSpinner from "./LoadingSpinner";

const FileDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("soap");
  const [customPrompt, setCustomPrompt] = useState("");
  const [customAnalysis, setCustomAnalysis] = useState(null);
  const [customAnalyzing, setCustomAnalyzing] = useState(false);

  useEffect(() => {
    fetchFileDetails();
  }, [id]);

  const fetchFileDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get file details
      const fileResponse = await getFileById(id);
      setFile(fileResponse.file);

      // Check if file has been analyzed
      if (fileResponse.file.processingStatus === "completed") {
        try {
          const analysisResponse = await getAnalysis(id);
          setAnalysis(analysisResponse.analysis);
        } catch (analysisError) {
          console.error("Error fetching analysis:", analysisError);
          // Don't set error here, just continue without analysis
        }
      }

      setLoading(false);
    } catch (error) {
      console.error("Error fetching file details:", error);
      setError("Error fetching file details. Please try again later.");
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    try {
      setAnalyzing(true);
      setError(null);

      const response = await analyzeFile(id);
      setAnalysis(response.analysis);

      // Update file status
      setFile((prevFile) => ({
        ...prevFile,
        processingStatus: "completed",
      }));

      setAnalyzing(false);
    } catch (error) {
      console.error("Error analyzing file:", error);
      setError("Error analyzing file. Please try again later.");
      setAnalyzing(false);
    }
  };

  const handleCustomAnalysis = async () => {
    if (!customPrompt.trim()) {
      setError("Please enter a prompt for custom analysis.");
      return;
    }

    try {
      setCustomAnalyzing(true);
      setError(null);

      const response = await generateCustomAnalysis(id, customPrompt);
      setCustomAnalysis(response.customAnalysis);

      setCustomAnalyzing(false);
    } catch (error) {
      console.error("Error generating custom analysis:", error);
      setError("Error generating custom analysis. Please try again later.");
      setCustomAnalyzing(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner size="lg" color="primary" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
        <button
          className="btn-custom btn-primary-custom"
          onClick={() => navigate("/dashboard")}
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (!file) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">File not found.</p>
          <button
            className="btn-custom btn-primary-custom mt-4"
            onClick={() => navigate("/dashboard")}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="flex flex-col md:flex-row justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">{file.originalname}</h1>
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <p>Uploaded: {formatDate(file.createdAt)}</p>
            <p>Size: {formatFileSize(file.size)}</p>
            <p>
              Type:{" "}
              {(file.mimetype || "application/unknown")
                .split("/")[1]
                ?.toUpperCase()}
            </p>
            <p>
              Status:
              <span
                className={`ml-2 px-2 py-1 rounded-full ${getStatusBadgeClass(
                  file.processingStatus
                )}`}
              >
                {file.processingStatus.charAt(0).toUpperCase() +
                  file.processingStatus.slice(1)}
              </span>
            </p>
          </div>
        </div>
        <div className="mt-4 md:mt-0">
          <button
            className="btn-custom btn-primary-custom"
            onClick={() => navigate("/dashboard")}
          >
            Back to Dashboard
          </button>
        </div>
      </div>

      {/* Analysis Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4">Document Analysis</h2>

        {file.processingStatus === "pending" && (
          <div className="mb-6">
            <p className="text-gray-600 mb-4">
              This document has not been analyzed yet. Click the button below to
              analyze it with AI.
            </p>
            <button
              className="btn-custom btn-primary-custom"
              onClick={handleAnalyze}
              disabled={analyzing}
            >
              {analyzing ? (
                <div className="flex items-center">
                  <LoadingSpinner size="sm" color="white" />
                  <span className="ml-2">Analyzing...</span>
                </div>
              ) : (
                "Analyze Document"
              )}
            </button>
          </div>
        )}

        {file.processingStatus === "processing" && (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" color="primary" />
            <span className="ml-4 text-lg">Analyzing document...</span>
          </div>
        )}

        {file.processingStatus === "failed" && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6">
            <strong className="font-bold">Analysis Failed!</strong>
            <span className="block sm:inline">
              {" "}
              There was an error analyzing this document. Please try again.
            </span>
            <button
              className="btn-custom btn-primary-custom mt-4"
              onClick={handleAnalyze}
              disabled={analyzing}
            >
              {analyzing ? (
                <div className="flex items-center">
                  <LoadingSpinner size="sm" color="white" />
                  <span className="ml-2">Analyzing...</span>
                </div>
              ) : (
                "Retry Analysis"
              )}
            </button>
          </div>
        )}

        {file.processingStatus === "completed" && analysis && (
          <div>
            <div className="border-b border-gray-200 mb-6">
              <nav className="flex space-x-8">
                <button
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "soap"
                      ? "border-primary-custom text-primary-custom"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                  onClick={() => setActiveTab("soap")}
                >
                  SOAP Note
                </button>
                <button
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "oasis"
                      ? "border-primary-custom text-primary-custom"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                  onClick={() => setActiveTab("oasis")}
                >
                  OASIS Scores
                </button>
                <button
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "care"
                      ? "border-primary-custom text-primary-custom"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                  onClick={() => setActiveTab("care")}
                >
                  Care Recommendations
                </button>
                <button
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "custom"
                      ? "border-primary-custom text-primary-custom"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                  onClick={() => setActiveTab("custom")}
                >
                  Custom Analysis
                </button>
              </nav>
            </div>

            <div className="prose max-w-none">
              {activeTab === "soap" && (
                <div className="whitespace-pre-line">{analysis.soapNote}</div>
              )}

              {activeTab === "oasis" && (
                <div className="whitespace-pre-line">
                  {analysis.oasisScores}
                </div>
              )}

              {activeTab === "care" && (
                <div className="whitespace-pre-line">
                  {analysis.careRecommendations}
                </div>
              )}

              {activeTab === "custom" && (
                <div>
                  <div className="mb-6">
                    <label
                      htmlFor="customPrompt"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Enter your custom analysis prompt:
                    </label>
                    <textarea
                      id="customPrompt"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-custom focus:border-primary-custom"
                      rows="4"
                      placeholder="E.g., Summarize the wound care instructions for this patient"
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                    ></textarea>
                    <button
                      className="btn-custom btn-primary-custom mt-2"
                      onClick={handleCustomAnalysis}
                      disabled={customAnalyzing}
                    >
                      {customAnalyzing ? (
                        <div className="flex items-center">
                          <LoadingSpinner size="sm" color="white" />
                          <span className="ml-2">Generating...</span>
                        </div>
                      ) : (
                        "Generate Analysis"
                      )}
                    </button>
                  </div>

                  {customAnalysis && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <h3 className="text-lg font-medium mb-2">
                        Custom Analysis Result:
                      </h3>
                      <div className="whitespace-pre-line">
                        {customAnalysis}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileDetail;
