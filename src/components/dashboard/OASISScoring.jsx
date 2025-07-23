import { useState } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import { API_ENDPOINTS } from "../../config/api";

const OASISScoring = ({ file, analysis, onUpdate }) => {
  const { isDarkMode } = useTheme();
  const [loading, setLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState([
    "M1830",
    "M1840",
    "M1850",
    "M1860",
  ]);
  const [error, setError] = useState(null);

  // Branding colors
  const primaryBlue = "#2596be";

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

  // OASIS items with descriptions
  const oasisItems = [
    {
      id: "M1830",
      name: "Bathing",
      description: "Current ability to wash entire body safely",
    },
    {
      id: "M1840",
      name: "Toilet Transferring",
      description: "Current ability to get to and from the toilet safely",
    },
    {
      id: "M1850",
      name: "Transferring",
      description:
        "Current ability to move safely from bed to chair/wheelchair",
    },
    {
      id: "M1860",
      name: "Ambulation",
      description: "Current ability to walk safely",
    },
    {
      id: "M1033",
      name: "Risk of Hospitalization",
      description: "Risk factors for hospitalization",
    },
    {
      id: "M1800",
      name: "Grooming",
      description: "Current ability to tend to personal hygiene needs",
    },
    {
      id: "M1810",
      name: "Upper Body Dressing",
      description: "Current ability to dress upper body",
    },
    {
      id: "M1820",
      name: "Lower Body Dressing",
      description: "Current ability to dress lower body",
    },
    {
      id: "M1845",
      name: "Toileting Hygiene",
      description: "Current ability to manage toileting hygiene",
    },
    {
      id: "M1870",
      name: "Feeding or Eating",
      description: "Current ability to feed self meals and snacks",
    },
  ];

  const handleItemToggle = (itemId) => {
    setSelectedItems((prev) => {
      if (prev.includes(itemId)) {
        return prev.filter((id) => id !== itemId);
      } else {
        return [...prev, itemId];
      }
    });
  };

  const handleScoreItems = async () => {
    if (selectedItems.length === 0) {
      setError("Please select at least one OASIS item to score");
      return;
    }

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
          type: "oasis",
          items: selectedItems,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("OASIS scoring response:", data);

        if (file && data.result) {
          file.oasisScores = data.result;
        }

        if (onUpdate) {
          onUpdate(data.result);
        }

        setSelectedItems([...selectedItems]);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to score OASIS items");
      }
    } catch (error) {
      console.error("Error scoring OASIS items:", error);
      setError(error.message || "Failed to score OASIS items");
    } finally {
      setLoading(false);
    }
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

  // Expand/collapse rationale
  const [expanded, setExpanded] = useState({});
  const toggleExpand = (itemId) => {
    setExpanded((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  const renderOASISScores = () => {
    const oasisScores = analysis?.oasisScores || file?.oasisScores || {};

    if (!oasisScores || Object.keys(oasisScores).length === 0) {
      return (
        <div className="text-center py-6">
          <p className="font-bold" style={secondaryTextStyles}>
            No OASIS scores available for this document
          </p>
          <p className="text-sm font-bold mt-1" style={secondaryTextStyles}>
            Select items below to generate scores
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <button
            className="px-3 py-1 rounded bg-[#2596be] text-white text-xs font-bold hover:bg-[#1d7a9c]"
            onClick={() =>
              copyToClipboard(JSON.stringify(oasisScores, null, 2))
            }
          >
            Copy Scores
          </button>
          <button
            className="px-3 py-1 rounded bg-[#96be25] text-white text-xs font-bold hover:bg-[#7a9c1d]"
            onClick={() =>
              exportToJson(oasisScores, `${file.originalname}-oasis.json`)
            }
          >
            Export Scores
          </button>
        </div>
        {Object.entries(oasisScores).map(([itemId, data]) => {
          const item = oasisItems.find((i) => i.id === itemId) || {
            name: itemId,
            description: "OASIS item",
          };

          return (
            <div
              key={itemId}
              className="rounded-lg p-4 font-bold"
              style={{
                backgroundColor: isDarkMode ? "#4a5568" : "#f8fafc",
                borderColor: isDarkMode ? "#4a5568" : "#e2e8f0",
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4
                    className="font-bold flex items-center"
                    style={{ color: primaryBlue }}
                  >
                    {itemId}: {item.name}
                    <span
                      className="ml-2 text-xs text-gray-400"
                      title={item.description}
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
                  <p className="text-sm" style={secondaryTextStyles}>
                    {item.description}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold" style={textStyles}>
                    {data.score}
                  </p>
                  <div className="flex items-center">
                    <span
                      className="text-xs mr-1"
                      style={secondaryTextStyles}
                      title="AI confidence in this score (0-100%)"
                    >
                      Confidence:
                    </span>
                    <div
                      className="w-16 rounded-full h-1.5"
                      style={{
                        backgroundColor: isDarkMode ? "#4a5568" : "#e2e8f0",
                      }}
                    >
                      <div
                        className="h-1.5 rounded-full"
                        style={{
                          width: `${(data.confidence || 0) * 100}%`,
                          backgroundColor: primaryBlue,
                        }}
                        title={`Confidence: ${(data.confidence * 100).toFixed(
                          0
                        )}%`}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-sm mt-2" style={textStyles}>
                <span className="font-bold">Rationale: </span>
                {data.rationale && data.rationale.length > 120 ? (
                  <>
                    {expanded[itemId]
                      ? data.rationale
                      : data.rationale.slice(0, 120) + "..."}
                    <button
                      className="ml-2 text-xs text-blue-500 underline"
                      onClick={() => toggleExpand(itemId)}
                    >
                      {expanded[itemId] ? "Show less" : "Show more"}
                    </button>
                  </>
                ) : (
                  data.rationale
                )}
                <span
                  className="ml-2 text-xs text-gray-400"
                  title="AI explanation for this score"
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
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="rounded-lg border p-6 font-sans" style={containerStyles}>
      <h3 className="text-lg font-bold mb-4" style={{ color: primaryBlue }}>
        OASIS Scoring
      </h3>

      {/* OASIS Scores Display */}
      {renderOASISScores()}

      {/* Item Selection */}
      <div className="mt-6">
        <h4 className="text-sm font-bold mb-2" style={secondaryTextStyles}>
          Select OASIS items to score:
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
          {oasisItems.map((item) => (
            <div
              key={item.id}
              onClick={() => handleItemToggle(item.id)}
              className={`p-2 border rounded-lg cursor-pointer text-center text-sm font-bold transition-all ${
                selectedItems.includes(item.id)
                  ? "text-white border-primary-custom"
                  : "border-gray-300 hover:opacity-90"
              }`}
              style={{
                backgroundColor: selectedItems.includes(item.id)
                  ? primaryBlue
                  : isDarkMode
                  ? "#4a5568"
                  : "#ffffff",
                color: selectedItems.includes(item.id)
                  ? "#ffffff"
                  : textStyles.color,
                borderColor: isDarkMode ? "#4a5568" : "#e2e8f0",
              }}
            >
              {item.id}
            </div>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div
          className="mt-4 p-3 rounded-lg border font-bold"
          style={{
            backgroundColor: isDarkMode ? "#4a5568" : "#fef2f2",
            borderColor: isDarkMode ? "#4a5568" : "#fecaca",
            color: "#b91c1c",
          }}
        >
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={handleScoreItems}
          disabled={loading || selectedItems.length === 0}
          className={`px-4 py-2 rounded-lg text-sm font-bold hover:opacity-90 transition-opacity ${
            loading || selectedItems.length === 0
              ? "opacity-50 cursor-not-allowed"
              : ""
          }`}
          style={{
            backgroundColor: selectedItems.length > 0 ? primaryBlue : "#e2e8f0",
            color:
              selectedItems.length > 0 ? "white" : secondaryTextStyles.color,
          }}
        >
          {loading ? (
            <>
              <span className="inline-block animate-spin mr-2">⟳</span>
              Scoring...
            </>
          ) : (
            "Score Selected Items"
          )}
        </button>
      </div>
    </div>
  );
};

export default OASISScoring;
