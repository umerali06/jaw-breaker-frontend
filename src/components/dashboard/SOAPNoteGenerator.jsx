import { useState } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import { API_ENDPOINTS } from "../../config/api";

const SOAPNoteGenerator = ({ file, analysis, onNoteGenerated }) => {
  const { isDarkMode } = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [soapNote, setSoapNote] = useState(
    analysis?.soapNote || file?.soapNote || null
  );

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
        if (onNoteGenerated) {
          onNoteGenerated(data.result);
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

  const renderSOAPNote = () => {
    if (!soapNote) {
      return (
        <div className="text-center py-8">
          <svg
            className="w-12 h-12 text-gray-400 mx-auto mb-4"
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
          <p className="text-gray-500">No SOAP note has been generated yet</p>
          <button
            onClick={handleGenerateSOAP}
            disabled={loading}
            className={`mt-4 px-4 py-2 rounded-lg text-sm font-medium ${
              loading
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-primary-custom text-white hover:bg-opacity-90"
            }`}
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
          <h3 className="text-lg font-semibold text-gray-900">SOAP Note</h3>
          <div className="text-sm text-gray-500">
            Generated: {formatDate(soapNote.generated)}
          </div>
        </div>

        <div className="space-y-4">
          {/* Subjective */}
          <div className="border-l-4 border-blue-500 pl-4">
            <h4 className="font-medium text-gray-900 mb-2">Subjective</h4>
            <div className="prose prose-sm max-w-none text-gray-700">
              {soapNote.subjective &&
                soapNote.subjective.split("\n").map((paragraph, i) => (
                  <p key={i} className="mb-2">
                    {paragraph}
                  </p>
                ))}
            </div>
          </div>

          {/* Objective */}
          <div className="border-l-4 border-green-500 pl-4">
            <h4 className="font-medium text-gray-900 mb-2">Objective</h4>
            <div className="prose prose-sm max-w-none text-gray-700">
              {soapNote.objective &&
                soapNote.objective.split("\n").map((paragraph, i) => (
                  <p key={i} className="mb-2">
                    {paragraph}
                  </p>
                ))}
            </div>
          </div>

          {/* Assessment */}
          <div className="border-l-4 border-yellow-500 pl-4">
            <h4 className="font-medium text-gray-900 mb-2">Assessment</h4>
            <div className="prose prose-sm max-w-none text-gray-700">
              {soapNote.assessment &&
                soapNote.assessment.split("\n").map((paragraph, i) => (
                  <p key={i} className="mb-2">
                    {paragraph}
                  </p>
                ))}
            </div>
          </div>

          {/* Plan */}
          <div className="border-l-4 border-purple-500 pl-4">
            <h4 className="font-medium text-gray-900 mb-2">Plan</h4>
            <div className="prose prose-sm max-w-none text-gray-700">
              {soapNote.plan &&
                soapNote.plan.split("\n").map((paragraph, i) => (
                  <p key={i} className="mb-2">
                    {paragraph}
                  </p>
                ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Print
          </button>
          <button
            onClick={handleGenerateSOAP}
            disabled={loading}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              loading
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-primary-custom text-white hover:bg-opacity-90"
            }`}
          >
            {loading ? "Regenerating..." : "Regenerate"}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* SOAP Note Content */}
      {renderSOAPNote()}
    </div>
  );
};

export default SOAPNoteGenerator;
