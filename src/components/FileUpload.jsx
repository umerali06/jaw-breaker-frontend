import { useState } from "react";
import LoadingSpinner from "./LoadingSpinner";

const API_URL = "http://localhost:5000/api";

const FileUpload = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [fileId, setFileId] = useState(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    // Reset states
    setUploadError(null);
    setUploadSuccess(false);
    setFileId(null);

    // Check file type
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];

    if (!allowedTypes.includes(file.type)) {
      setUploadError("Please upload a PDF, DOCX, or TXT file");
      return;
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError("File size should be less than 10MB");
      return;
    }

    setFile(file);
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);
    setUploadError(null);
    setUploadSuccess(false);

    try {
      const formData = new FormData();
      formData.append("file", file);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 300);

      // Upload file to server
      const response = await fetch(`${API_URL}/upload`, {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error uploading file");
      }

      const data = await response.json();

      setUploadProgress(100);
      setUploadSuccess(true);
      setFileId(data.file.id);

      setTimeout(() => {
        setIsUploading(false);
      }, 500);
    } catch (error) {
      console.error("Error uploading file:", error);
      setUploadError(error.message || "Error uploading file");
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center ${
          isDragging
            ? "border-primary-custom bg-primary-custom/5"
            : "border-gray-300"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {!file ? (
          <>
            <svg
              className="w-16 h-16 mx-auto text-primary-custom mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <h3 className="text-lg font-medium mb-2">
              Drag and drop your file here
            </h3>
            <p className="text-gray-500 mb-4">or</p>
            <div>
              <label htmlFor="file-upload" className="cursor-pointer">
                <button className="btn-custom btn-primary-custom">
                  Browse Files
                </button>
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  accept=".pdf,.docx,.doc,.txt"
                  onChange={handleFileInput}
                />
              </label>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              Supported formats: PDF, DOCX, TXT
            </p>
            {uploadError && <p className="text-red-500 mt-4">{uploadError}</p>}
          </>
        ) : (
          <div>
            {uploadSuccess ? (
              <svg
                className="w-16 h-16 mx-auto text-green-500 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            ) : (
              <svg
                className="w-16 h-16 mx-auto text-primary-custom mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            )}
            <h3 className="text-lg font-medium mb-2">
              {uploadSuccess ? "Upload Complete!" : "File selected"}
            </h3>
            <p className="text-gray-700 mb-4">{file.name}</p>

            {isUploading ? (
              <div className="w-full">
                <div className="h-2 bg-gray-200 rounded-full mb-4">
                  <div
                    className="h-full bg-primary-custom rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <div className="flex items-center justify-center">
                  <LoadingSpinner size="sm" color="primary" />
                  <span className="ml-2">Uploading... {uploadProgress}%</span>
                </div>
              </div>
            ) : uploadSuccess ? (
              <div className="text-center">
                <p className="text-green-600 mb-4">
                  File uploaded successfully! Processing document...
                </p>
                <button
                  className="btn-custom btn-primary-custom"
                  onClick={() => {
                    setFile(null);
                    setUploadSuccess(false);
                    setFileId(null);
                  }}
                >
                  Upload Another File
                </button>
              </div>
            ) : (
              <div className="flex justify-center gap-4">
                <button
                  className="btn-custom btn-primary-custom"
                  onClick={handleUpload}
                >
                  Upload File
                </button>
                <button
                  className="btn-custom btn-outline-custom"
                  onClick={() => setFile(null)}
                >
                  Change File
                </button>
              </div>
            )}

            {uploadError && <p className="text-red-500 mt-4">{uploadError}</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
