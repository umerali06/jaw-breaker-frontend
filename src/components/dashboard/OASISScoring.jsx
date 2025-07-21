import { useState } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import { API_ENDPOINTS } from "../../config/api";

const OASISScoring = ({ file, analysis, onScoreUpdate }) => {
  const { isDarkMode } = useTheme();
  const [loading, setLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState([
    "M1830",
    "M1840",
    "M1850",
    "M1860",
  ]);
  const [error, setError] = useState(null);

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

        // Update the file object with new scores
        if (file && data.result) {
          file.oasisScores = data.result;
        }

        if (onScoreUpdate) {
          onScoreUpdate(data.result);
        }

        // Force a re-render by updating state
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

  const renderOASISScores = () => {
    // Check multiple sources for OASIS scores
    const oasisScores = analysis?.oasisScores || file?.oasisScores || {};

    console.log("OASIS Scores Debug:", {
      analysisOasisScores: analysis?.oasisScores,
      fileOasisScores: file?.oasisScores,
      finalScores: oasisScores,
    });

    if (!oasisScores || Object.keys(oasisScores).length === 0) {
      return (
        <div className="text-center py-6">
          <p className="text-gray-500">
            No OASIS scores available for this document
          </p>
          <p className="text-sm text-gray-400 mt-1">
            Select items below to generate scores
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {Object.entries(oasisScores).map(([itemId, data]) => {
          const item = oasisItems.find((i) => i.id === itemId) || {
            name: itemId,
            description: "OASIS item",
          };

          return (
            <div key={itemId} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="font-medium text-gray-900">
                    {itemId}: {item.name}
                  </h4>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">
                    {data.score}
                  </p>
                  <div className="flex items-center">
                    <span className="text-xs text-gray-500 mr-1">
                      Confidence:
                    </span>
                    <div className="w-16 bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-primary-custom h-1.5 rounded-full"
                        style={{ width: `${(data.confidence || 0) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-700 mt-2">{data.rationale}</p>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div
      className={`${
        isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
      } rounded-lg border p-6`}
    >
      <h3
        className={`text-lg font-semibold ${
          isDarkMode ? "text-white" : "text-gray-900"
        } mb-4`}
      >
        OASIS Scoring
      </h3>

      {/* OASIS Scores Display */}
      {renderOASISScores()}

      {/* Item Selection */}
      <div className="mt-6">
        <h4 className="text-sm font-medium text-gray-700 mb-2">
          Select OASIS items to score:
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
          {oasisItems.map((item) => (
            <div
              key={item.id}
              onClick={() => handleItemToggle(item.id)}
              className={`p-2 border rounded-lg cursor-pointer text-center text-sm transition-colors ${
                selectedItems.includes(item.id)
                  ? "bg-primary-custom text-white border-primary-custom"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              {item.id}
            </div>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={handleScoreItems}
          disabled={loading || selectedItems.length === 0}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            loading || selectedItems.length === 0
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-primary-custom text-white hover:bg-opacity-90"
          }`}
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
