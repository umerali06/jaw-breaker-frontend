import { useState, useEffect } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import { API_ENDPOINTS } from "../../config/api";

const SOAPNoteGenerator = ({ file, analysis, onUpdate }) => {
  const { isDarkMode } = useTheme();
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

  const renderSOAPNote = () => {
    // Check both the local state and the props to ensure we're showing the latest data
    const currentNote = soapNote || analysis?.soapNote || file?.soapNote;

    if (!currentNote) {
      return (
        <div className="text-center py-8">
          <svg
            className="w-12 h-12 mx-auto mb-4"
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
          <p className="font-bold mb-4" style={secondaryTextStyles}>
            No SOAP note has been generated yet
          </p>
          <button
            onClick={handleGenerateSOAP}
            disabled={loading}
            className={`mt-4 px-4 py-2 rounded-lg text-sm font-bold hover:opacity-90 transition-opacity ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            style={{
              backgroundColor: primaryBlue,
              color: "white",
            }}
          >
            {loading ? (
              <>
                <span className="inline-block animate-spin mr-2">⟳</span>
                Generating...
              </>
            ) : (
              "Generate SOAP Note"
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
        <div className="flex items-center gap-2 mb-2">
          <button
            className="px-3 py-1 rounded bg-[#2596be] text-white text-xs font-bold hover:bg-[#1d7a9c]"
            onClick={() =>
              copyToClipboard(JSON.stringify(currentNote, null, 2))
            }
          >
            Copy JSON
          </button>
          <button
            className="px-3 py-1 rounded bg-[#96be25] text-white text-xs font-bold hover:bg-[#7a9c1d]"
            onClick={() =>
              exportToJson(currentNote, `${file.originalname}-soap.json`)
            }
          >
            Export JSON
          </button>
          <button
            className="px-3 py-1 rounded bg-[#2596be] text-white text-xs font-bold hover:bg-[#1d7a9c]"
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
            Copy Text
          </button>
          <button
            className="px-3 py-1 rounded bg-[#96be25] text-white text-xs font-bold hover:bg-[#7a9c1d]"
            onClick={() =>
              exportToText(currentNote, `${file.originalname}-soap.txt`)
            }
          >
            Export Text
          </button>
          <button
            className="px-3 py-1 rounded bg-[#e74c3c] text-white text-xs font-bold hover:bg-[#c0392b] flex items-center"
            onClick={handleGenerateSOAP}
            disabled={loading}
          >
            {loading ? (
              <span className="inline-block animate-spin mr-1">⟳</span>
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
            Regenerate
          </button>
        </div>

        <div className="space-y-4">
          {/* Subjective */}
          <div className="border-l-4 pl-4" style={{ borderColor: primaryBlue }}>
            <h4 className="font-bold mb-2 flex items-center" style={textStyles}>
              Subjective
              <span
                className="ml-2 text-xs text-gray-400"
                title="Patient's perspective, symptoms, and concerns."
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
            </h4>
            <div className="max-w-none">
              {currentNote.subjective &&
                currentNote.subjective.split("\n").map((paragraph, i) => (
                  <p key={i} className="mb-2 font-bold" style={textStyles}>
                    {paragraph}
                  </p>
                ))}
            </div>
          </div>

          {/* Objective */}
          <div className="border-l-4 pl-4" style={{ borderColor: accentGreen }}>
            <h4 className="font-bold mb-2 flex items-center" style={textStyles}>
              Objective
              <span
                className="ml-2 text-xs text-gray-400"
                title="Clinician's observations, measurements, and findings."
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
            </h4>
            <div className="max-w-none">
              {currentNote.objective &&
                currentNote.objective.split("\n").map((paragraph, i) => (
                  <p key={i} className="mb-2 font-bold" style={textStyles}>
                    {paragraph}
                  </p>
                ))}
            </div>
          </div>

          {/* Assessment */}
          <div className="border-l-4 pl-4" style={{ borderColor: "#f59e0b" }}>
            <h4 className="font-bold mb-2 flex items-center" style={textStyles}>
              Assessment
              <span
                className="ml-2 text-xs text-gray-400"
                title="Clinical judgment, diagnoses, and progress."
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
            </h4>
            <div className="max-w-none">
              {currentNote.assessment &&
                currentNote.assessment.split("\n").map((paragraph, i) => (
                  <p key={i} className="mb-2 font-bold" style={textStyles}>
                    {paragraph}
                  </p>
                ))}
            </div>
          </div>

          {/* Plan */}
          <div className="border-l-4 pl-4" style={{ borderColor: "#8b5cf6" }}>
            <h4 className="font-bold mb-2 flex items-center" style={textStyles}>
              Plan
              <span
                className="ml-2 text-xs text-gray-400"
                title="Treatment plan, interventions, and follow-up."
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
            </h4>
            <div className="max-w-none">
              {currentNote.plan &&
                currentNote.plan.split("\n").map((paragraph, i) => (
                  <p key={i} className="mb-2 font-bold" style={textStyles}>
                    {paragraph}
                  </p>
                ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 rounded-lg text-sm font-bold hover:opacity-90 transition-opacity"
            style={{
              backgroundColor: isDarkMode ? "#4a5568" : "#f8fafc",
              color: textStyles.color,
              border: `1px solid ${isDarkMode ? "#4a5568" : "#e2e8f0"}`,
            }}
          >
            Print
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="rounded-lg border p-6 font-sans" style={containerStyles}>
      {/* Error Message */}
      {error && (
        <div
          className="mb-4 p-3 rounded-lg border font-bold"
          style={{
            backgroundColor: isDarkMode ? "#4a5568" : "#fef2f2",
            borderColor: isDarkMode ? "#4a5568" : "#fecaca",
            color: "#b91c1c",
          }}
        >
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* SOAP Note Content */}
      {renderSOAPNote()}
    </div>
  );
};

export default SOAPNoteGenerator;
