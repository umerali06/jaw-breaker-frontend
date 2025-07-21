import { useState } from "react";
import { usePatientData } from "../../../contexts/PatientDataContext";
import { useTheme } from "../../../contexts/ThemeContext";
import { analyzeFile } from "../../../services/api";
import FileDetailView from "../FileDetailView";

const DocumentsView = ({ selectedPatient, viewMode: propViewMode }) => {
  const { files, loading, deleteFile, fetchFiles } = usePatientData();
  const { isDarkMode } = useTheme();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [localViewMode, setLocalViewMode] = useState("grid");
  const [selectedFile, setSelectedFile] = useState(null);

  // Use prop viewMode if provided, otherwise use local state
  const viewMode = propViewMode || localViewMode;

  const filteredFiles = files.filter((file) => {
    const matchesSearch = file.originalname
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || file.processingStatus === filterStatus;
    const matchesPatient =
      !selectedPatient ||
      selectedPatient.files.some((pf) => pf._id === file._id);
    return matchesSearch && matchesStatus && matchesPatient;
  });

  const sortedFiles = [...filteredFiles].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.createdAt) - new Date(a.createdAt);
      case "oldest":
        return new Date(a.createdAt) - new Date(b.createdAt);
      case "name":
        return a.originalname.localeCompare(b.originalname);
      case "size":
        return b.size - a.size;
      default:
        return 0;
    }
  });

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return isDarkMode
          ? "bg-gray-700 text-gray-300"
          : "bg-gray-100 text-gray-800";
    }
  };

  const getFileIcon = (mimetype) => {
    if (mimetype.includes("pdf")) {
      return (
        <svg
          className="w-8 h-8 text-red-500"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
        </svg>
      );
    } else if (mimetype.includes("word")) {
      return (
        <svg
          className="w-8 h-8 text-blue-500"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
        </svg>
      );
    } else if (mimetype.includes("image")) {
      return (
        <svg
          className="w-8 h-8 text-green-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      );
    } else {
      return (
        <svg
          className={`w-8 h-8 ${
            isDarkMode ? "text-gray-400" : "text-gray-500"
          }`}
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
      );
    }
  };

  const handleDeleteFile = async (fileId, fileName) => {
    if (window.confirm(`Are you sure you want to delete "${fileName}"?`)) {
      const result = await deleteFile(fileId);
      if (!result.success) {
        alert("Failed to delete file. Please try again.");
      }
    }
  };

  const handleDownloadFile = async (file) => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`/api/upload/download/${file._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = file.originalname;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert("Failed to download file");
      }
    } catch (error) {
      console.error("Error downloading file:", error);
      alert("Error downloading file");
    }
  };

  const handleAnalyzeFile = async (fileId) => {
    try {
      console.log("Starting analysis for file:", fileId);

      // Call the analyze API
      const result = await analyzeFile(fileId);
      console.log("Analysis result:", result);

      if (result.success) {
        // Refresh the files list to get updated status
        setTimeout(() => {
          fetchFiles();
        }, 1000);

        // Show success message
        alert("Analysis started successfully!");
      } else {
        console.error("Analysis failed:", result);
        alert(`Failed to start analysis: ${result.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error analyzing file:", error);
      alert(`Error starting analysis: ${error.message || "Please try again."}`);
    }
  };

  const DocumentCard = ({ file }) => (
    <div
      className={`${
        isDarkMode
          ? "bg-gray-800 border-gray-700 text-white"
          : "bg-white border-gray-200"
      } rounded-lg border p-4 hover:shadow-md transition-shadow h-full flex flex-col`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center min-w-0 flex-1">
          <div className="flex-shrink-0">{getFileIcon(file.mimetype)}</div>
          <div className="ml-3 min-w-0 flex-1">
            <h3
              className={`text-sm font-medium ${
                isDarkMode ? "text-white" : "text-gray-900"
              } truncate`}
              title={file.originalname}
            >
              <a
                href={`/api/upload/view/${file._id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary-custom hover:underline transition-colors cursor-pointer"
              >
                {file.originalname}
              </a>
            </h3>
            <p
              className={`text-xs ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              {formatFileSize(file.size)}
            </p>
          </div>
        </div>
        <div className="flex-shrink-0 ml-2">
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${getStatusColor(
              file.processingStatus
            )}`}
          >
            {file.processingStatus}
          </span>
        </div>
      </div>

      <div className="mb-4 flex-1">
        <p
          className={`text-xs ${
            isDarkMode ? "text-gray-400" : "text-gray-500"
          }`}
        >
          Uploaded {new Date(file.createdAt).toLocaleDateString()}
        </p>
        {file.aiSummary && (
          <p className="text-xs text-green-600 mt-1">✓ AI Analysis Complete</p>
        )}
      </div>

      <div className="flex gap-2 mt-auto">
        <button
          onClick={() => setSelectedFile(file)}
          className="flex-1 bg-primary-custom text-white px-3 py-2 rounded text-xs font-medium hover:bg-opacity-90 transition-colors"
        >
          View
        </button>

        {/* Analyze button for pending files */}
        {file.processingStatus === "pending" && (
          <button
            onClick={() => handleAnalyzeFile(file._id)}
            className="px-3 py-2 bg-blue-500 text-white rounded text-xs font-medium hover:bg-blue-600 transition-colors"
          >
            Analyze
          </button>
        )}

        {/* Retry button for failed files */}
        {file.processingStatus === "failed" && (
          <button
            onClick={() => handleAnalyzeFile(file._id)}
            className="px-3 py-2 bg-red-500 text-white rounded text-xs font-medium hover:bg-red-600 transition-colors"
          >
            Retry
          </button>
        )}

        <button
          onClick={() => handleDownloadFile(file)}
          className={`px-3 py-2 border ${
            isDarkMode
              ? "border-gray-600 text-gray-300 hover:bg-gray-700"
              : "border-gray-300 text-gray-700 hover:bg-gray-50"
          } rounded text-xs font-medium transition-colors`}
        >
          Download
        </button>
        <button
          onClick={() => handleDeleteFile(file._id, file.originalname)}
          className="px-3 py-2 text-red-600 hover:text-red-800 transition-colors"
          title="Delete"
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
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>
    </div>
  );

  const DocumentRow = ({ file }) => (
    <tr className={`${isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"}`}>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          {getFileIcon(file.mimetype)}
          <div className="ml-4">
            <div
              className={`text-sm font-medium ${
                isDarkMode ? "text-white" : "text-gray-900"
              } max-w-xs truncate`}
              title={file.originalname}
            >
              {file.originalname}
            </div>
            <div
              className={`text-sm ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              {(file.mimetype || "application/unknown")
                .split("/")[1]
                ?.toUpperCase()}
            </div>
          </div>
        </div>
      </td>
      <td
        className={`px-6 py-4 whitespace-nowrap text-sm ${
          isDarkMode ? "text-white" : "text-gray-900"
        }`}
      >
        {formatFileSize(file.size)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
            file.processingStatus
          )}`}
        >
          {file.processingStatus}
        </span>
      </td>
      <td
        className={`px-6 py-4 whitespace-nowrap text-sm ${
          isDarkMode ? "text-gray-300" : "text-gray-500"
        }`}
      >
        {new Date(file.createdAt).toLocaleDateString()}
      </td>
      <td
        className={`px-6 py-4 whitespace-nowrap text-sm ${
          isDarkMode ? "text-gray-300" : "text-gray-500"
        }`}
      >
        {file.aiSummary ? (
          <span className="text-green-600">✓ Complete</span>
        ) : (
          <span className={`${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
            Pending
          </span>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex space-x-2">
          <button
            onClick={() => setSelectedFile(file)}
            className="text-primary-custom hover:text-opacity-80"
          >
            View
          </button>
          <button
            onClick={() => handleDownloadFile(file)}
            className={`${
              isDarkMode
                ? "text-gray-400 hover:text-gray-300"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Download
          </button>
          <button
            onClick={() => handleDeleteFile(file._id, file.originalname)}
            className="text-red-600 hover:text-red-800"
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="p-4 sm:p-6 overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 border ${
                    isDarkMode
                      ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400"
                      : "border-gray-300"
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-custom focus:border-transparent`}
                />
                <svg
                  className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className={`px-3 py-2 border ${
                  isDarkMode
                    ? "border-gray-600 bg-gray-700 text-white"
                    : "border-gray-300"
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-custom`}
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="processing">Processing</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={`px-3 py-2 border ${
                  isDarkMode
                    ? "border-gray-600 bg-gray-700 text-white"
                    : "border-gray-300"
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-custom`}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="name">Name A-Z</option>
                <option value="size">Size (Largest)</option>
              </select>

              {!propViewMode && (
                <div
                  className={`flex border ${
                    isDarkMode ? "border-gray-600" : "border-gray-300"
                  } rounded-lg`}
                >
                  <button
                    onClick={() => setLocalViewMode("grid")}
                    className={`p-2 ${
                      viewMode === "grid"
                        ? "bg-primary-custom text-white"
                        : isDarkMode
                        ? "text-gray-400 hover:text-gray-300"
                        : "text-gray-500 hover:text-gray-700"
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
                        d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => setLocalViewMode("list")}
                    className={`p-2 ${
                      viewMode === "list"
                        ? "bg-primary-custom text-white"
                        : isDarkMode
                        ? "text-gray-400 hover:text-gray-300"
                        : "text-gray-500 hover:text-gray-700"
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
                        d="M4 6h16M4 10h16M4 14h16M4 18h16"
                      />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-custom"></div>
          </div>
        ) : sortedFiles.length === 0 ? (
          <div className="text-center py-12">
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
            <h3
              className={`text-lg font-medium ${
                isDarkMode ? "text-white" : "text-gray-900"
              } mb-2`}
            >
              No documents found
            </h3>
            <p
              className={`${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              } mb-4`}
            >
              {searchTerm
                ? "Try adjusting your search terms"
                : "Upload your first document to get started"}
            </p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 auto-rows-fr">
            {sortedFiles.map((file) => (
              <DocumentCard key={file._id} file={file} />
            ))}
          </div>
        ) : (
          <div
            className={`${
              isDarkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            } rounded-lg border overflow-hidden`}
          >
            <table
              className={`min-w-full divide-y ${
                isDarkMode ? "divide-gray-700" : "divide-gray-200"
              }`}
            >
              <thead className={`${isDarkMode ? "bg-gray-700" : "bg-gray-50"}`}>
                <tr>
                  <th
                    className={`px-6 py-3 text-left text-xs font-medium ${
                      isDarkMode ? "text-gray-300" : "text-gray-500"
                    } uppercase tracking-wider`}
                  >
                    Document
                  </th>
                  <th
                    className={`px-6 py-3 text-left text-xs font-medium ${
                      isDarkMode ? "text-gray-300" : "text-gray-500"
                    } uppercase tracking-wider`}
                  >
                    Size
                  </th>
                  <th
                    className={`px-6 py-3 text-left text-xs font-medium ${
                      isDarkMode ? "text-gray-300" : "text-gray-500"
                    } uppercase tracking-wider`}
                  >
                    Status
                  </th>
                  <th
                    className={`px-6 py-3 text-left text-xs font-medium ${
                      isDarkMode ? "text-gray-300" : "text-gray-500"
                    } uppercase tracking-wider`}
                  >
                    Uploaded
                  </th>
                  <th
                    className={`px-6 py-3 text-left text-xs font-medium ${
                      isDarkMode ? "text-gray-300" : "text-gray-500"
                    } uppercase tracking-wider`}
                  >
                    AI Analysis
                  </th>
                  <th
                    className={`px-6 py-3 text-right text-xs font-medium ${
                      isDarkMode ? "text-gray-300" : "text-gray-500"
                    } uppercase tracking-wider`}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody
                className={`${
                  isDarkMode
                    ? "bg-gray-800 divide-gray-700"
                    : "bg-white divide-gray-200"
                } divide-y`}
              >
                {sortedFiles.map((file) => (
                  <DocumentRow key={file._id} file={file} />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* File Detail Modal */}
        {selectedFile && (
          <FileDetailView
            file={selectedFile}
            onClose={() => setSelectedFile(null)}
          />
        )}
      </div>
    </div>
  );
};

export default DocumentsView;
