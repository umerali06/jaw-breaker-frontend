import { useState } from "react";
import { usePatientData } from "../../../contexts/PatientDataContext";
import { useTheme } from "../../../contexts/ThemeContext";
import { analyzeFile } from "../../../services/api";
import FileDetailView from "../FileDetailView";
import React from "react";

const DocumentsView = ({ selectedPatient, viewMode: propViewMode }) => {
  const { files, loading, deleteFile, fetchFiles } = usePatientData();
  const { isDarkMode } = useTheme();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [localViewMode, setLocalViewMode] = useState("grid");
  const [selectedFile, setSelectedFile] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [fileToDownload, setFileToDownload] = useState(null);
  const [toast, setToast] = useState({ type: "", message: "" });
  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast({ type: "", message: "" }), 2000);
  };

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
        return "bg-[#96be25] text-white";
      case "processing":
        return "bg-[#2596be] text-white";
      case "failed":
        return "bg-red-500 text-white";
      case "pending":
        return "bg-amber-400 text-white";
      default:
        return isDarkMode
          ? "bg-gray-600 text-white"
          : "bg-gray-200 text-gray-800";
    }
  };

  const getFileIcon = (mimetype) => {
    if (mimetype.includes("pdf")) {
      return (
        <div className="p-2 rounded-lg bg-red-100/20">
          <svg
            className="w-6 h-6 text-red-500"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
          </svg>
        </div>
      );
    } else if (mimetype.includes("word")) {
      return (
        <div className="p-2 rounded-lg bg-blue-100/20">
          <svg
            className="w-6 h-6 text-blue-500"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
          </svg>
        </div>
      );
    } else if (mimetype.includes("image")) {
      return (
        <div className="p-2 rounded-lg bg-green-100/20">
          <svg
            className="w-6 h-6 text-green-500"
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
        </div>
      );
    } else {
      return (
        <div
          className={`p-2 rounded-lg ${
            isDarkMode ? "bg-gray-700" : "bg-gray-100"
          }`}
        >
          <svg
            className="w-6 h-6 text-gray-500"
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
        </div>
      );
    }
  };

  const handleDeleteFile = (fileId, fileName) => {
    setFileToDelete({ id: fileId, name: fileName });
    setShowDeleteModal(true);
  };

  const confirmDeleteFile = async () => {
    if (fileToDelete) {
      const result = await deleteFile(fileToDelete.id);
      if (result.success) {
        showToast("success", "File deleted successfully!");
      } else {
        showToast("error", "Failed to delete file. Please try again.");
      }
      setShowDeleteModal(false);
      setFileToDelete(null);
    }
  };

  const handleDownloadFile = (file) => {
    setFileToDownload(file);
    setShowDownloadModal(true);
  };

  const confirmDownloadFile = async () => {
    if (!fileToDownload) return;
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(
        `/api/upload/download/${fileToDownload._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileToDownload.originalname;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        showToast("success", "File downloaded!");
      } else {
        showToast("error", "Failed to download file");
      }
    } catch (error) {
      showToast("error", "Error downloading file");
    }
    setShowDownloadModal(false);
    setFileToDownload(null);
  };

  const handleAnalyzeFile = async (fileId) => {
    try {
      const result = await analyzeFile(fileId);
      if (result.success) {
        setTimeout(() => {
          fetchFiles();
        }, 1000);
        showToast("success", "Analysis started successfully!");
      } else {
        showToast(
          "error",
          `Failed to start analysis: ${result.message || "Unknown error"}`
        );
      }
    } catch (error) {
      showToast(
        "error",
        `Error starting analysis: ${error.message || "Please try again."}`
      );
    }
  };

  const DocumentCard = ({ file }) => (
    <div
      className={`rounded-3xl shadow-xl p-6 border-2 border-[#96be25] hover:shadow-2xl hover:border-[#2596be] transition-all flex flex-col h-full max-w-sm w-full ${
        isDarkMode ? "bg-[#232b36]" : "bg-[#f6fcf3]"
      }`}
      style={{ boxShadow: "0 4px 24px 0 rgba(150,190,37,0.08)" }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="p-2 rounded-full bg-[#2596be] flex items-center justify-center">
            {getFileIcon(file.mimetype)}
          </div>
          <div className="ml-3 min-w-0 flex-1">
            <h3
              className={`text-base font-bold truncate ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
              title={file.originalname}
            >
              {file.originalname}
            </h3>
            <p
              className={`text-xs font-medium ${
                isDarkMode ? "text-gray-300" : "text-gray-500"
              }`}
            >
              {formatFileSize(file.size)}
            </p>
          </div>
        </div>
        <span
          className="px-3 py-1 text-xs font-bold rounded-full bg-[#96be25] text-white shadow ml-2"
          style={{ minWidth: 60, textAlign: "center" }}
        >
          {file.processingStatus.charAt(0).toUpperCase() +
            file.processingStatus.slice(1)}
        </span>
      </div>

      <div className="mb-4 flex-1">
        <p
          className={`text-xs font-medium ${
            isDarkMode ? "text-gray-400" : "text-gray-500"
          }`}
        >
          Uploaded {new Date(file.createdAt).toLocaleDateString()}
        </p>
        {file.aiSummary && (
          <p className="text-xs font-bold text-[#96be25] mt-1">
            ✓ AI Analysis Complete
          </p>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mt-4">
        <button
          onClick={() => setSelectedFile(file)}
          className="flex-1 bg-[#2596be] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#1d7a9c] focus:outline-none focus:ring-2 focus:ring-[#2596be] transition-all shadow-md"
        >
          View Details
        </button>
        <button
          onClick={() => handleDownloadFile(file)}
          className="flex-1 border border-[#e2e8f0] text-[#2596be] bg-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#f6fcf3] focus:outline-none focus:ring-2 focus:ring-[#96be25] transition-all shadow-md"
        >
          Download
        </button>
      </div>
    </div>
  );

  const DocumentRow = ({ file }) => (
    <tr
      className={`${
        isDarkMode ? "hover:bg-gray-700/50" : "hover:bg-[#f0f7ff]"
      }`}
    >
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          {getFileIcon(file.mimetype)}
          <div className="ml-4">
            <div
              className={`text-sm font-bold ${
                isDarkMode ? "text-white" : "text-gray-900"
              } max-w-xs truncate`}
              title={file.originalname}
            >
              {file.originalname}
            </div>
            <div
              className={`text-xs font-medium ${
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
        className={`px-6 py-4 whitespace-nowrap text-sm font-bold ${
          isDarkMode ? "text-white" : "text-gray-900"
        }`}
      >
        {formatFileSize(file.size)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span
          className={`px-3 py-1 text-xs font-bold rounded-full ${getStatusColor(
            file.processingStatus
          )}`}
        >
          {file.processingStatus}
        </span>
      </td>
      <td
        className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
          isDarkMode ? "text-gray-300" : "text-gray-500"
        }`}
      >
        {new Date(file.createdAt).toLocaleDateString()}
      </td>
      <td
        className={`px-6 py-4 whitespace-nowrap text-sm font-bold ${
          isDarkMode ? "text-gray-300" : "text-gray-500"
        }`}
      >
        {file.aiSummary ? (
          <span className="text-[#96be25]">✓ Complete</span>
        ) : (
          <span className={`${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
            Pending
          </span>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold">
        <div className="flex space-x-3">
          <button
            onClick={() => setSelectedFile(file)}
            className="text-[#2596be] hover:text-[#1d7a9c]"
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
    <div
      className="p-6 overflow-y-auto min-h-screen"
      style={{ background: isDarkMode ? "#18212f" : "#f6fcf3" }}
    >
      {/* Toast Notification */}
      {toast.message && (
        <div
          className={`fixed top-6 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg z-50 font-bold text-center animate-fade-in ${
            toast.type === "success"
              ? "bg-green-500 text-white"
              : "bg-red-500 text-white"
          }`}
        >
          {toast.message}
        </div>
      )}
      <div className="max-w-7xl mx-auto space-y-6">
        {selectedFile ? (
          <div className="p-4">
            <FileDetailView
              file={selectedFile}
              onBack={() => setSelectedFile(null)}
            />
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="mb-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div>
                  <h1
                    className={`text-2xl font-bold ${
                      isDarkMode
                        ? "text-white"
                        : "text-[var(--color-text-dark)]"
                    } mb-1`}
                  >
                    Medical Documents
                  </h1>
                  <p
                    className={`text-sm font-medium ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    {filteredFiles.length} documents found
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1 min-w-[250px]">
                    <input
                      type="text"
                      placeholder="Search documents..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={`w-full ${
                        isDarkMode
                          ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                          : "bg-white border-[var(--color-border)] text-[var(--color-text-dark)] placeholder-gray-500"
                      } pl-10 pr-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#2596be] focus:border-transparent font-bold shadow-sm`}
                    />
                    <svg
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
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
                  <div className="flex gap-2">
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className={`${
                        isDarkMode
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "bg-white border-[var(--color-border)] text-[var(--color-text-dark)]"
                      } px-3 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#2596be] focus:border-transparent font-bold shadow-sm`}
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
                      className={`${
                        isDarkMode
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "bg-white border-[var(--color-border)] text-[var(--color-text-dark)]"
                      } px-3 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#2596be] focus:border-transparent font-bold shadow-sm`}
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="name">Name A-Z</option>
                      <option value="size">Size (Largest)</option>
                    </select>
                    {!propViewMode && (
                      <div
                        className={`flex border ${
                          isDarkMode
                            ? "border-gray-600"
                            : "border-[var(--color-border)]"
                        } rounded-xl`}
                      >
                        <button
                          onClick={() => setLocalViewMode("grid")}
                          className={`p-2 ${
                            viewMode === "grid"
                              ? "bg-[#2596be] text-white"
                              : isDarkMode
                              ? "text-gray-400 hover:text-gray-300"
                              : "text-gray-500 hover:text-gray-700"
                          } rounded-l-xl`}
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
                              ? "bg-[#2596be] text-white"
                              : isDarkMode
                              ? "text-gray-400 hover:text-gray-300"
                              : "text-gray-500 hover:text-gray-700"
                          } rounded-r-xl`}
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
            </div>
            {/* Content */}
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#2596be]"></div>
              </div>
            ) : sortedFiles.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl border border-[var(--color-border)] shadow-sm">
                <svg
                  className="mx-auto h-16 w-16 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3
                  className={`mt-4 text-lg font-bold ${
                    isDarkMode ? "text-white" : "text-[var(--color-text-dark)]"
                  }`}
                >
                  No documents found
                </h3>
                <p
                  className={`mt-2 text-sm font-medium ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  {searchTerm
                    ? "Try adjusting your search terms"
                    : "Upload your first document to get started"}
                </p>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="mt-4 bg-[#2596be] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#1d7a9c] transition-colors shadow-md"
                  >
                    Clear Search
                  </button>
                )}
              </div>
            ) : viewMode === "grid" ? (
              <div
                className="grid gap-2 sm:gap-4"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(310px, 1fr))",
                  gridAutoRows: "1fr",
                  alignItems: "stretch",
                }}
              >
                {sortedFiles.map((file) => (
                  <div
                    key={file._id}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      height: "100%",
                    }}
                  >
                    <DocumentCard file={file} />
                  </div>
                ))}
              </div>
            ) : (
              <div
                className={`rounded-xl border ${
                  isDarkMode
                    ? "bg-gray-800 border-gray-700"
                    : "bg-white border-[var(--color-border)]"
                } shadow-sm overflow-hidden`}
              >
                <table
                  className={`min-w-full divide-y ${
                    isDarkMode ? "divide-gray-700" : "divide-gray-200"
                  }`}
                >
                  <thead
                    className={`${isDarkMode ? "bg-gray-700" : "bg-gray-50"}`}
                  >
                    <tr>
                      <th
                        className={`px-6 py-3 text-left text-xs font-bold ${
                          isDarkMode ? "text-gray-300" : "text-gray-500"
                        } uppercase tracking-wider`}
                      >
                        Document
                      </th>
                      <th
                        className={`px-6 py-3 text-left text-xs font-bold ${
                          isDarkMode ? "text-gray-300" : "text-gray-500"
                        } uppercase tracking-wider`}
                      >
                        Size
                      </th>
                      <th
                        className={`px-6 py-3 text-left text-xs font-bold ${
                          isDarkMode ? "text-gray-300" : "text-gray-500"
                        } uppercase tracking-wider`}
                      >
                        Status
                      </th>
                      <th
                        className={`px-6 py-3 text-left text-xs font-bold ${
                          isDarkMode ? "text-gray-300" : "text-gray-500"
                        } uppercase tracking-wider`}
                      >
                        Uploaded
                      </th>
                      <th
                        className={`px-6 py-3 text-left text-xs font-bold ${
                          isDarkMode ? "text-gray-300" : "text-gray-500"
                        } uppercase tracking-wider`}
                      >
                        AI Analysis
                      </th>
                      <th
                        className={`px-6 py-3 text-right text-xs font-bold ${
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
          </>
        )}
      </div>
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div
            className={`bg-white rounded-xl shadow-lg p-6 max-w-sm w-full ${
              isDarkMode ? "bg-gray-800 text-white" : ""
            }`}
          >
            <h3 className="font-bold text-lg mb-2">Delete File</h3>
            <p className="mb-4">
              Are you sure you want to delete{" "}
              <span className="font-semibold">{fileToDelete?.name}</span>?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setFileToDelete(null);
                }}
                className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteFile}
                className="px-4 py-2 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Download Preview Modal */}
      {showDownloadModal && fileToDownload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div
            className={`bg-white rounded-xl shadow-lg p-6 max-w-sm w-full ${
              isDarkMode ? "bg-gray-800 text-white" : ""
            }`}
          >
            <h3 className="font-bold text-lg mb-2">Download Preview</h3>
            <p className="mb-4">
              You are about to download{" "}
              <span className="font-semibold">
                {fileToDownload.originalname}
              </span>
              .
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowDownloadModal(false);
                  setFileToDownload(null);
                }}
                className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={confirmDownloadFile}
                className="px-4 py-2 rounded-lg bg-[#2596be] text-white font-semibold hover:bg-[#1d7a9c]"
              >
                Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentsView;
