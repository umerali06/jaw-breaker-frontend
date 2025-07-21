import React from "react";

const FileDebugInfo = ({ file }) => {
  if (!file) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
        <h3 className="text-red-800 font-medium">Debug: No file provided</h3>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
      <h3 className="text-gray-800 font-medium mb-2">Debug Information</h3>
      <div className="text-sm text-gray-600 space-y-1">
        <p>
          <strong>File ID:</strong> {file._id || "undefined"}
        </p>
        <p>
          <strong>Original Name:</strong> {file.originalname || "undefined"}
        </p>
        <p>
          <strong>Processing Status:</strong>{" "}
          {file.processingStatus || "undefined"}
        </p>
        <p>
          <strong>Has AI Summary:</strong> {file.aiSummary ? "Yes" : "No"}
        </p>
        <p>
          <strong>Has Clinical Insights:</strong>{" "}
          {file.clinicalInsights?.length > 0 ? "Yes" : "No"}
        </p>
        <p>
          <strong>Has OASIS Scores:</strong>{" "}
          {file.oasisScores && Object.keys(file.oasisScores).length > 0
            ? "Yes"
            : "No"}
        </p>
        <p>
          <strong>Has SOAP Note:</strong> {file.soapNote ? "Yes" : "No"}
        </p>
        <p>
          <strong>Patient Name:</strong> {file.patientName || "undefined"}
        </p>
        <p>
          <strong>Patient ID:</strong> {file.patientId || "undefined"}
        </p>
      </div>
    </div>
  );
};

export default FileDebugInfo;
