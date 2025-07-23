import React from "react";
import { useTheme } from "../../contexts/ThemeContext";

const FileDebugInfo = ({ file, isDarkMode = false }) => {
  // Branding colors
  const primaryBlue = "#2596be";
  const accentGreen = "#96be25";

  // Dynamic styles
  const containerStyles = {
    backgroundColor: isDarkMode ? "#2d3748" : "#f8fafc",
    borderColor: isDarkMode ? "#4a5568" : "#e2e8f0",
  };

  const textStyles = {
    color: isDarkMode ? "#e2e8f0" : "#4a5568",
  };

  const errorStyles = {
    backgroundColor: isDarkMode ? "#4a5568" : "#fef2f2",
    borderColor: isDarkMode ? "#4a5568" : "#fecaca",
    color: "#b91c1c",
  };

  if (!file) {
    return (
      <div className="rounded-lg border p-4 mb-4 font-bold" style={errorStyles}>
        <h3 className="text-sm">Debug: No file provided</h3>
      </div>
    );
  }

  return (
    <div
      className="rounded-lg border p-4 mb-4 font-sans"
      style={containerStyles}
    >
      <h3 className="font-bold mb-2 text-sm" style={{ color: primaryBlue }}>
        Debug Information
      </h3>
      <div className="space-y-1 text-sm font-bold">
        <p style={textStyles}>
          <strong style={{ color: isDarkMode ? accentGreen : primaryBlue }}>
            File ID:
          </strong>{" "}
          {file._id || "undefined"}
        </p>
        <p style={textStyles}>
          <strong style={{ color: isDarkMode ? accentGreen : primaryBlue }}>
            Original Name:
          </strong>{" "}
          {file.originalname || "undefined"}
        </p>
        <p style={textStyles}>
          <strong style={{ color: isDarkMode ? accentGreen : primaryBlue }}>
            Processing Status:
          </strong>{" "}
          {file.processingStatus || "undefined"}
        </p>
        <p style={textStyles}>
          <strong style={{ color: isDarkMode ? accentGreen : primaryBlue }}>
            Has AI Summary:
          </strong>{" "}
          {file.aiSummary ? "Yes" : "No"}
        </p>
        <p style={textStyles}>
          <strong style={{ color: isDarkMode ? accentGreen : primaryBlue }}>
            Has Clinical Insights:
          </strong>{" "}
          {file.clinicalInsights?.length > 0 ? "Yes" : "No"}
        </p>
        <p style={textStyles}>
          <strong style={{ color: isDarkMode ? accentGreen : primaryBlue }}>
            Has OASIS Scores:
          </strong>{" "}
          {file.oasisScores && Object.keys(file.oasisScores).length > 0
            ? "Yes"
            : "No"}
        </p>
        <p style={textStyles}>
          <strong style={{ color: isDarkMode ? accentGreen : primaryBlue }}>
            Has SOAP Note:
          </strong>{" "}
          {file.soapNote ? "Yes" : "No"}
        </p>
        <p style={textStyles}>
          <strong style={{ color: isDarkMode ? accentGreen : primaryBlue }}>
            Patient Name:
          </strong>{" "}
          {file.patientName || "undefined"}
        </p>
        <p style={textStyles}>
          <strong style={{ color: isDarkMode ? accentGreen : primaryBlue }}>
            Patient ID:
          </strong>{" "}
          {file.patientId || "undefined"}
        </p>
      </div>
    </div>
  );
};

export default FileDebugInfo;
