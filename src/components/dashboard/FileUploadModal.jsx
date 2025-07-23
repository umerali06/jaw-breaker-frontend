import { useState, useRef, useEffect } from "react";
import { usePatientData } from "../../contexts/PatientDataContext";
import { useTheme } from "../../contexts/ThemeContext";
import { useToast } from "../../contexts/ToastContext";

const FileUploadModal = ({ onClose, onUploadSuccess, selectedPatient }) => {
  const { uploadFile, loading, patients } = usePatientData();
  const { isDarkMode } = useTheme();
  const { showToast } = useToast();
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [uploadProgress, setUploadProgress] = useState({});
  const [autoAnalyze, setAutoAnalyze] = useState(true);
  const fileInputRef = useRef(null);

  // Auto-select the selectedPatient if provided, otherwise most recent
  useEffect(() => {
    if (patients && patients.length > 0) {
      if (selectedPatient && selectedPatient.id) {
        setSelectedPatientId(selectedPatient.id);
      } else {
        // Sort by createdAt descending, fallback to first
        const sorted = [...patients].sort(
          (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        );
        setSelectedPatientId(sorted[0].id);
      }
    }
  }, [patients, selectedPatient]);

  // Brand colors
  const colors = {
    primary: "#2596be",
    primaryLight: "#e1f0f5",
    primaryDark: "#1d7a9c",
    accent: "#96be25",
    accentLight: "#f0f5e1",
    accentDark: "#7a9c1d",
    textDark: "#2d3748",
    textLight: "#f8fafc",
    bgDark: "#1a202c",
    bgLight: "#ffffff",
    grayDark: "#4a5568",
    grayLight: "#e2e8f0",
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
  };

  const handleFiles = (files) => {
    const validFiles = files.filter((file) => {
      const validTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
        "image/jpeg",
        "image/png",
      ];
      return validTypes.includes(file.type) && file.size <= 10 * 1024 * 1024; // 10MB limit
    });

    setSelectedFiles((prev) => [...prev, ...validFiles]);
  };

  const removeFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0 || !selectedPatientId) return;
    const patient = patients.find((p) => p.id === selectedPatientId);
    if (!patient) {
      showToast("error", "Please select a valid patient.");
      return;
    }
    const results = [];
    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      setUploadProgress((prev) => ({ ...prev, [i]: 0 }));
      try {
        const uploadOptions = {
          name: patient.name,
          id: patient.id,
          analyze: autoAnalyze,
        };
        const result = await uploadFile(file, uploadOptions);
        results.push(result);
        setUploadProgress((prev) => ({ ...prev, [i]: 100 }));
      } catch (error) {
        console.error("Upload error:", error);
        results.push({ success: false, error: error.message });
      }
    }
    const allSuccessful = results.every((result) => result.success);
    if (allSuccessful) {
      showToast("success", "All files uploaded successfully!");
      onUploadSuccess();
    } else {
      const failedCount = results.filter((result) => !result.success).length;
      const successCount = results.filter((result) => result.success).length;
      if (successCount > 0) {
        showToast(
          "success",
          `${successCount} file(s) uploaded successfully, but ${failedCount} file(s) failed. Please try again for the failed files.`
        );
        onUploadSuccess();
      } else {
        showToast(
          "error",
          `All ${failedCount} file(s) failed to upload. Please check your files and try again.`
        );
      }
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 backdrop-blur-sm p-2 sm:p-4">
      <div
        className={`rounded-lg sm:rounded-xl shadow-lg sm:shadow-xl max-w-2xl w-full mx-auto max-h-[90vh] overflow-y-auto transition-all duration-300 transform ${
          isDarkMode ? "bg-gray-800" : "bg-white"
        } border ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}
        style={{
          boxShadow: isDarkMode
            ? "0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.2)"
            : "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        }}
      >
        {/* Header */}
        <div
          className={`p-3 sm:p-6 border-b ${
            isDarkMode ? "border-gray-700" : "border-gray-200"
          } flex items-center justify-between`}
        >
          <div>
            <h2
              className={`text-xl sm:text-2xl font-bold ${
                isDarkMode ? "text-white" : "text-gray-900"
              } mb-0.5 sm:mb-1`}
            >
              Upload Medical Documents
            </h2>
            <p
              className={`text-xs sm:text-sm ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Securely upload and analyze patient records
            </p>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 sm:p-2 rounded-lg  ${
              isDarkMode
                ? "hover:bg-gray-700 text-gray-300"
                : "hover:bg-gray-100 text-gray-500"
            } transition-colors`}
          >
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5"
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

        {/* Content */}
        <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
          {/* Auto-Analysis Option */}
          <div
            className={`p-3 sm:p-4 rounded-lg sm:rounded-xl border ${
              isDarkMode
                ? "border-gray-700 bg-gray-800"
                : "border-gray-200 bg-gray-50"
            }`}
          >
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  type="checkbox"
                  id="autoAnalyze"
                  checked={autoAnalyze}
                  onChange={(e) => setAutoAnalyze(e.target.checked)}
                  className={`h-4 w-4 rounded ${
                    isDarkMode
                      ? "text-primary-500 border-gray-600 bg-gray-700"
                      : "text-primary-500 border-gray-300 bg-white"
                  } focus:ring-${colors.primary} focus:ring-opacity-50`}
                />
              </div>
              <div className="ml-3 min-w-0">
                <label
                  htmlFor="autoAnalyze"
                  className={`font-bold text-sm sm:text-base ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  <span className="inline-flex items-center">
                    <svg
                      className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 text-blue-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                      />
                    </svg>
                    Enable AI Analysis
                  </span>
                </label>
                <p
                  className={`text-xs sm:text-sm mt-1 break-words ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Automatically extract clinical insights, generate SOAP notes,
                  and identify OASIS items
                </p>
              </div>
            </div>
          </div>

          {/* Patient Selection */}
          <div
            className={`p-3 sm:p-4 rounded-lg sm:rounded-xl border ${
              isDarkMode
                ? "border-gray-700 bg-gray-800"
                : "border-gray-200 bg-gray-50"
            }`}
          >
            <h3
              className={`text-base sm:text-lg font-bold mb-2 sm:mb-4 ${
                isDarkMode ? "text-white" : "text-gray-900"
              } flex items-center`}
            >
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2 text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              Select Patient (Required)
            </h3>
            {!patients || patients.length === 0 ? (
              <div className="text-red-500 font-bold text-xs sm:text-sm p-2">
                No patients found. Please create a patient before uploading
                documents.
              </div>
            ) : (
              <>
                <select
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-${
                    colors.primary
                  } focus:ring-opacity-50 ${
                    isDarkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  } text-sm`}
                >
                  <option value="">Select a patient...</option>
                  {(patients || []).map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (ID: {p.id})
                    </option>
                  ))}
                </select>
                {/* Show selected patient details */}
                {selectedPatientId &&
                  patients &&
                  patients.length > 0 &&
                  (() => {
                    const patient = (patients || []).find(
                      (p) => p.id === selectedPatientId
                    );
                    if (!patient) return null;
                    return (
                      <div
                        className={`mt-3 p-2 sm:p-3 rounded-lg border ${
                          isDarkMode
                            ? "border-gray-700 bg-gray-900"
                            : "border-gray-200 bg-gray-50"
                        }`}
                      >
                        <div className="font-bold text-xs sm:text-sm mb-1">
                          Selected Patient:
                        </div>
                        <div className="text-xs sm:text-sm">
                          <span className="font-bold">Name:</span>{" "}
                          <span className="break-words">{patient.name}</span>
                        </div>
                        <div className="text-xs sm:text-sm">
                          <span className="font-bold">ID:</span> {patient.id}
                        </div>
                        <div className="text-xs sm:text-sm">
                          <span className="font-bold">Status:</span>{" "}
                          {patient.status || "active"}
                        </div>
                      </div>
                    );
                  })()}
              </>
            )}
          </div>

          {/* File Upload Area */}
          <div>
            <h3
              className={`text-base sm:text-lg font-bold mb-2 sm:mb-4 ${
                isDarkMode ? "text-white" : "text-gray-900"
              } flex items-center`}
            >
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2 text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Upload Documents
            </h3>
            <div
              className={`border-2 border-dashed rounded-lg sm:rounded-xl p-4 sm:p-8 text-center transition-all duration-200 ${
                dragActive
                  ? `border-${colors.primary} bg-${colors.primary} bg-opacity-5`
                  : isDarkMode
                  ? "border-gray-600 hover:border-gray-500"
                  : "border-gray-300 hover:border-gray-400"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center justify-center space-y-2 sm:space-y-3">
                <div
                  className={`p-2 sm:p-3 rounded-full ${
                    dragActive
                      ? `bg-${colors.primary} bg-opacity-10`
                      : isDarkMode
                      ? "bg-gray-700"
                      : "bg-gray-100"
                  }`}
                >
                  <svg
                    className={`w-6 h-6 sm:w-8 sm:h-8 ${
                      dragActive
                        ? `text-${colors.primary}`
                        : isDarkMode
                        ? "text-gray-500"
                        : "text-gray-400"
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                </div>
                <div>
                  <p
                    className={`text-base sm:text-lg font-medium ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    } mb-0.5 sm:mb-1`}
                  >
                    {dragActive ? "Drop to upload" : "Drag & drop files here"}
                  </p>
                  <p
                    className={`text-xs sm:text-sm ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    } mb-3 sm:mb-4`}
                  >
                    PDF, DOC, DOCX, TXT, JPG, PNG (max 10MB each)
                  </p>
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg font-medium text-white bg-[#2596be] hover:bg-[#1d7a9c] transition-colors shadow-sm inline-flex items-center text-sm`}
                >
                  <svg
                    className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  Select Files
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          </div>

          {/* Selected Files */}
          {selectedFiles.length > 0 && (
            <div
              className={`p-3 sm:p-4 rounded-lg sm:rounded-xl border ${
                isDarkMode
                  ? "border-gray-700 bg-gray-800"
                  : "border-gray-200 bg-gray-50"
              }`}
            >
              <h4
                className={`text-sm sm:text-md font-bold mb-2 sm:mb-3 ${
                  isDarkMode ? "text-white" : "text-gray-900"
                } flex items-center`}
              >
                <svg
                  className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                Selected Files ({selectedFiles.length})
              </h4>
              <div className="space-y-2 sm:space-y-3 max-h-32 sm:max-h-40 overflow-y-auto">
                {selectedFiles.map((file, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-2 sm:p-3 rounded-lg ${
                      isDarkMode ? "bg-gray-700" : "bg-white"
                    } border ${
                      isDarkMode ? "border-gray-600" : "border-gray-200"
                    } shadow-xs`}
                  >
                    <div className="flex items-center min-w-0">
                      <div
                        className={`p-1.5 sm:p-2 rounded-md ${
                          isDarkMode ? "bg-gray-600" : "bg-gray-100"
                        } mr-2 sm:mr-3`}
                      >
                        <svg
                          className={`w-4 h-4 sm:w-5 sm:h-5 ${
                            isDarkMode ? "text-gray-400" : "text-gray-500"
                          }`}
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
                      <div className="min-w-0 flex-1">
                        <p
                          className={`text-xs sm:text-sm font-medium truncate ${
                            isDarkMode ? "text-white" : "text-gray-900"
                          }`}
                          title={file.name}
                        >
                          {file.name}
                        </p>
                        <p
                          className={`text-[10px] sm:text-xs ${
                            isDarkMode ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
                      {uploadProgress[index] !== undefined && (
                        <div className="w-16 sm:w-20">
                          <div className="h-1.5 rounded-full bg-gray-200 dark:bg-gray-600 overflow-hidden">
                            <div
                              className={`h-full bg-${colors.primary}`}
                              style={{ width: `${uploadProgress[index]}%` }}
                            ></div>
                          </div>
                          <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                            {uploadProgress[index]}%
                          </span>
                        </div>
                      )}
                      <button
                        onClick={() => removeFile(index)}
                        className={`p-1 rounded-full ${
                          isDarkMode
                            ? "text-gray-400 hover:text-gray-300 hover:bg-gray-600"
                            : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                        } transition-colors`}
                      >
                        <svg
                          className="w-3.5 h-3.5 sm:w-4 sm:h-4"
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
                ))}
              </div>
            </div>
          )}

          {/* Upload Benefits */}
          <div
            className={`p-3 sm:p-4 rounded-lg sm:rounded-xl border ${
              isDarkMode
                ? "border-blue-900 bg-blue-900 bg-opacity-20"
                : "border-blue-200 bg-blue-50"
            }`}
          >
            <h4
              className={`text-sm sm:text-base font-bold mb-2 sm:mb-3 text-${colors.primary} flex items-center`}
            >
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2"
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
              AI-Powered Document Processing
            </h4>
            <ul
              className={`text-xs sm:text-sm space-y-1.5 sm:space-y-2 ${
                isDarkMode ? "text-blue-100" : "text-blue-800"
              }`}
            >
              <li className="flex items-start">
                <span
                  className={`inline-flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-${colors.accent} bg-opacity-20 mr-1.5 sm:mr-2 flex-shrink-0 mt-0.5`}
                >
                  <svg
                    className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-green-500"
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
                </span>
                <span className="break-words">
                  Automatic SOAP note generation with clinical insights
                </span>
              </li>
              <li className="flex items-start">
                <span
                  className={`inline-flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-${colors.accent} bg-opacity-20 mr-1.5 sm:mr-2 flex-shrink-0 mt-0.5`}
                >
                  <svg
                    className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-green-500"
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
                </span>
                <span className="break-words">
                  OASIS item identification and scoring with 98% accuracy
                </span>
              </li>
              <li className="flex items-start">
                <span
                  className={`inline-flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-${colors.accent} bg-opacity-20 mr-1.5 sm:mr-2 flex-shrink-0 mt-0.5`}
                >
                  <svg
                    className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-green-500"
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
                </span>
                <span className="break-words">
                  Clinical data extraction and summarization in seconds
                </span>
              </li>
              <li className="flex items-start">
                <span
                  className={`inline-flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-${colors.accent} bg-opacity-20 mr-1.5 sm:mr-2 flex-shrink-0 mt-0.5`}
                >
                  <svg
                    className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-green-500"
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
                </span>
                <span className="break-words">
                  HIPAA-compliant processing with enterprise-grade security
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div
          className={`p-3 sm:p-6 border-t flex justify-end space-x-2 sm:space-x-3 ${
            isDarkMode ? "border-gray-700" : "border-gray-200"
          }`}
        >
          <button
            onClick={onClose}
            className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg border font-medium text-xs sm:text-sm ${
              isDarkMode
                ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                : "border-gray-300 text-gray-700 hover:bg-gray-50"
            } transition-colors`}
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={
              selectedFiles.length === 0 ||
              loading ||
              !selectedPatientId ||
              !patients ||
              patients.length === 0
            }
            className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg font-medium text-white text-xs sm:text-sm bg-[#2596be] hover:bg-[#1d7a9c] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md relative overflow-hidden`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-white"
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
              </span>
            ) : (
              <span className="flex items-center">
                <svg
                  className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19v-6m4 6v-6m4 6v-6"
                  />
                </svg>
                Upload {selectedFiles.length} File
                {selectedFiles.length !== 1 ? "s" : ""}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FileUploadModal;
