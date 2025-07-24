import { useState, useEffect } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import { API_ENDPOINTS } from "../../config/api";
import ReactMarkdown from "react-markdown";

const SOAPNoteGenerator = ({ file, analysis, onUpdate }) => {
  const { isDarkMode } = useTheme();

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
      .markdown-content h1 { font-size: 1.25rem; }
      .markdown-content h2 { font-size: 1.125rem; }
      .markdown-content h3 { font-size: 1rem; }
      .markdown-content h4 { font-size: 0.875rem; }
      .markdown-content h5 { font-size: 0.85rem; }
      .markdown-content h6 { font-size: 0.8rem; }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, [isDarkMode]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [soapNote, setSoapNote] = useState(() => {
    return analysis?.soapNote || file?.soapNote || null;
  });

  // Update SOAP note when analysis or file changes
  useEffect(() => {
    const newSoapNote = analysis?.soapNote || file?.soapNote;
    if (newSoapNote) {
      setSoapNote(newSoapNote);
    }
  }, [analysis?.soapNote, file?.soapNote]);

  // Branding colors
  const primaryBlue = "#2596be";
  const accentGreen = "#96be25";

  // Dynamic styles
  const containerStyles = {
    backgroundColor: isDarkMode ? "#2d3748" : "#ffffff",
    borderColor: isDarkMode ? "#4a5568" : "#e2e8f0",
  };

  const textStyles = {
    color: isDarkMode ? "#e2e8f0" : "#4a5568",
  };

  const secondaryTextStyles = {
    color: isDarkMode ? "#a0aec0" : "#718096",
  };

  const handleGenerateSOAP = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`${API_ENDPOINTS.AI}/custom/${file._id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          type: "soap",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSoapNote(data.result);
        if (onUpdate) {
          onUpdate(data.result);
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to generate SOAP note");
      }
    } catch (error) {
      console.error("Error generating SOAP note:", error);
      setError(
        error.message ||
          "Failed to generate SOAP note. Please check if the AI service is configured properly."
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not generated yet";
    return new Date(dateString).toLocaleString();
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

  // Helper: Export to plain text
  const exportToText = (soapNote, filename) => {
    let text = "";
    if (soapNote.subjective) text += `Subjective:\n${soapNote.subjective}\n\n`;
    if (soapNote.objective) text += `Objective:\n${soapNote.objective}\n\n`;
    if (soapNote.assessment) text += `Assessment:\n${soapNote.assessment}\n\n`;
    if (soapNote.plan) text += `Plan:\n${soapNote.plan}\n`;
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Function to render markdown content
  const renderMarkdown = (content) => {
    if (!content) return null;
    if (typeof content === "string") {
      return (
        <div className="markdown-content prose max-w-none">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      );
    }
    return content;
  };

  const renderSOAPNote = () => {
    // Check both the local state and the props to ensure we're showing the latest data
    const currentNote = soapNote || analysis?.soapNote || file?.soapNote;

    if (!currentNote) {
      return (
        <div className="text-center py-12">
          <div
            className={`p-4 rounded-full inline-flex items-center justify-center mb-6 ${
              isDarkMode ? "bg-gray-700" : "bg-gray-100"
            }`}
          >
            <svg
              className="w-8 h-8"
              fill="none"
              stroke={isDarkMode ? "#a0aec0" : "#718096"}
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
          <h3
            className={`text-lg font-bold mb-3 ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            No SOAP Note Available
          </h3>
          <p className="mb-6" style={secondaryTextStyles}>
            Generate a structured SOAP note from this document to organize
            clinical information
          </p>
          <button
            onClick={handleGenerateSOAP}
            disabled={loading}
            className={`px-6 py-3 rounded-lg text-sm font-bold hover:opacity-90 transition-opacity flex items-center mx-auto ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            style={{
              backgroundColor: primaryBlue,
              color: "white",
            }}
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4"
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
                Generating SOAP Note...
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
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                Generate SOAP Note
              </>
            )}
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3
            className="text-lg font-bold flex items-center"
            style={{ color: primaryBlue }}
          >
            SOAP Note
            <span
              className="ml-2 text-xs text-gray-400"
              title="Subjective, Objective, Assessment, Plan - a structured clinical note format."
            >
              <svg
                className="inline w-3 h-3"
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
          </h3>
          <div className="text-sm font-bold" style={secondaryTextStyles}>
            Generated: {formatDate(currentNote.generated)}
          </div>
        </div>

        {/* Copy/Export Buttons */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <button
            className="px-2 sm:px-3 py-1.5 rounded bg-[#2596be] text-white text-xs font-bold hover:bg-[#1d7a9c] flex-shrink-0 flex items-center"
            onClick={() =>
              copyToClipboard(JSON.stringify(currentNote, null, 2))
            }
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
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            <span className="hidden sm:inline">Copy JSON</span>
            <span className="sm:hidden">JSON</span>
          </button>
          <button
            className="px-2 sm:px-3 py-1.5 rounded bg-[#96be25] text-white text-xs font-bold hover:bg-[#7a9c1d] flex-shrink-0 flex items-center"
            onClick={() =>
              exportToJson(currentNote, `${file.originalname}-soap.json`)
            }
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
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <span className="hidden sm:inline">Export JSON</span>
            <span className="sm:hidden">Export</span>
          </button>
          <button
            className="px-2 sm:px-3 py-1.5 rounded bg-[#2596be] text-white text-xs font-bold hover:bg-[#1d7a9c] flex-shrink-0 flex items-center"
            onClick={() =>
              copyToClipboard(
                [
                  currentNote.subjective &&
                    `Subjective:\n${currentNote.subjective}`,
                  currentNote.objective &&
                    `Objective:\n${currentNote.objective}`,
                  currentNote.assessment &&
                    `Assessment:\n${currentNote.assessment}`,
                  currentNote.plan && `Plan:\n${currentNote.plan}`,
                ]
                  .filter(Boolean)
                  .join("\n\n")
              )
            }
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
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <span className="hidden sm:inline">Copy Text</span>
            <span className="sm:hidden">Text</span>
          </button>
          <button
            className="px-2 sm:px-3 py-1.5 rounded bg-[#96be25] text-white text-xs font-bold hover:bg-[#7a9c1d] flex-shrink-0 flex items-center"
            onClick={() =>
              exportToText(currentNote, `${file.originalname}-soap.txt`)
            }
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
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <span className="hidden sm:inline">Export Text</span>
            <span className="sm:hidden">TXT</span>
          </button>
          <button
            className="px-2 sm:px-3 py-1.5 rounded bg-[#e74c3c] text-white text-xs font-bold hover:bg-[#c0392b] flex items-center flex-shrink-0"
            onClick={handleGenerateSOAP}
            disabled={loading}
          >
            {loading ? (
              <svg
                className="animate-spin w-3 h-3 mr-1"
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
            ) : (
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
            )}
            <span className="hidden sm:inline">Regenerate</span>
            <span className="sm:hidden">Regen</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Subjective */}
          {currentNote.subjective && (
            <div
              className={`p-4 rounded-lg border-l-4 ${
                isDarkMode ? "bg-gray-700" : "bg-blue-50"
              }`}
              style={{ borderColor: primaryBlue }}
            >
              <h4
                className="font-bold mb-3 flex items-center"
                style={{ color: primaryBlue }}
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
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                Subjective
                <span
                  className="ml-2 text-xs text-gray-400 cursor-help"
                  title="Patient's perspective, symptoms, and concerns"
                >
                  ℹ️
                </span>
              </h4>
              <div
                className={`${isDarkMode ? "text-gray-200" : "text-gray-700"}`}
              >
                {renderMarkdown(currentNote.subjective)}
              </div>
            </div>
          )}

          {/* Objective */}
          {currentNote.objective && (
            <div
              className={`p-4 rounded-lg border-l-4 ${
                isDarkMode ? "bg-gray-700" : "bg-green-50"
              }`}
              style={{ borderColor: accentGreen }}
            >
              <h4
                className="font-bold mb-3 flex items-center"
                style={{ color: accentGreen }}
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
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                Objective
                <span
                  className="ml-2 text-xs text-gray-400 cursor-help"
                  title="Clinician's observations, measurements, and findings"
                >
                  ℹ️
                </span>
              </h4>
              <div
                className={`${isDarkMode ? "text-gray-200" : "text-gray-700"}`}
              >
                {renderMarkdown(currentNote.objective)}
              </div>
            </div>
          )}

          {/* Assessment */}
          {currentNote.assessment && (
            <div
              className={`p-4 rounded-lg border-l-4 ${
                isDarkMode ? "bg-gray-700" : "bg-yellow-50"
              }`}
              style={{ borderColor: "#f59e0b" }}
            >
              <h4
                className="font-bold mb-3 flex items-center"
                style={{ color: "#f59e0b" }}
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
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Assessment
                <span
                  className="ml-2 text-xs text-gray-400 cursor-help"
                  title="Clinical judgment, diagnoses, and progress"
                >
                  ℹ️
                </span>
              </h4>
              <div
                className={`${isDarkMode ? "text-gray-200" : "text-gray-700"}`}
              >
                {renderMarkdown(currentNote.assessment)}
              </div>
            </div>
          )}

          {/* Plan */}
          {currentNote.plan && (
            <div
              className={`p-4 rounded-lg border-l-4 ${
                isDarkMode ? "bg-gray-700" : "bg-purple-50"
              }`}
              style={{ borderColor: "#8b5cf6" }}
            >
              <h4
                className="font-bold mb-3 flex items-center"
                style={{ color: "#8b5cf6" }}
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
                    d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                  />
                </svg>
                Plan
                <span
                  className="ml-2 text-xs text-gray-400 cursor-help"
                  title="Treatment plan, interventions, and follow-up"
                >
                  ℹ️
                </span>
              </h4>
              <div
                className={`${isDarkMode ? "text-gray-200" : "text-gray-700"}`}
              >
                {renderMarkdown(currentNote.plan)}
              </div>
            </div>
          )}
        </div>

        <div
          className="flex justify-between items-center mt-6 pt-4 border-t"
          style={{ borderColor: isDarkMode ? "#4a5568" : "#e2e8f0" }}
        >
          <div className="text-sm" style={secondaryTextStyles}>
            <span className="font-medium">Patient:</span>{" "}
            {file.patientName || "Unknown"}
            {file.patientId && (
              <>
                <span className="mx-2">•</span>
                <span className="font-medium">ID:</span> {file.patientId}
              </>
            )}
          </div>
          <button
            onClick={() => window.print()}
            className="px-4 py-2 rounded-lg text-sm font-bold hover:opacity-90 transition-opacity flex items-center"
            style={{
              backgroundColor: isDarkMode ? "#4a5568" : "#f8fafc",
              color: textStyles.color,
              border: `1px solid ${isDarkMode ? "#4a5568" : "#e2e8f0"}`,
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
                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
              />
            </svg>
            Print SOAP Note
          </button>
        </div>
      </div>
    );
  };

  return (
    <div
      className={`rounded-xl border p-6 font-sans transition-all duration-300 ${
        isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
      }`}
      style={{
        boxShadow: isDarkMode
          ? "0 4px 6px rgba(0, 0, 0, 0.3)"
          : "0 4px 6px rgba(0, 0, 0, 0.1)",
      }}
    >
      {/* Error Message */}
      {error && (
        <div
          className={`mb-6 p-4 rounded-lg border-l-4 ${
            isDarkMode
              ? "bg-red-900 bg-opacity-20 border-red-500"
              : "bg-red-50 border-red-400"
          }`}
        >
          <div className="flex items-start">
            <svg
              className="w-5 h-5 text-red-500 mr-3 mt-0.5"
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
            <div>
              <h4
                className={`font-bold mb-1 ${
                  isDarkMode ? "text-red-300" : "text-red-800"
                }`}
              >
                Error Generating SOAP Note
              </h4>
              <p
                className={`text-sm ${
                  isDarkMode ? "text-red-200" : "text-red-700"
                }`}
              >
                {error}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SOAP Note Content */}
      {renderSOAPNote()}
    </div>
  );
};

export default SOAPNoteGenerator;
