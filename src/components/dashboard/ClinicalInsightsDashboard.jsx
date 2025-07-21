import { useState, useEffect } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import { API_ENDPOINTS } from "../../config/api";

const ClinicalInsightsDashboard = ({ files }) => {
  const { isDarkMode } = useTheme();
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [selectedType, setSelectedType] = useState("all");

  useEffect(() => {
    if (files && files.length > 0) {
      aggregateInsights();
    }
  }, [files]);

  const aggregateInsights = async () => {
    setLoading(true);
    const allInsights = [];

    try {
      const token = localStorage.getItem("authToken");

      // Get insights from all analyzed files
      for (const file of files) {
        if (file.processingStatus === "completed" && file.clinicalInsights) {
          const fileInsights = file.clinicalInsights.map((insight) => ({
            ...insight,
            fileName: file.originalname,
            fileId: file._id,
            patientName: file.patientName,
            uploadDate: file.createdAt,
          }));
          allInsights.push(...fileInsights);
        }
      }

      // Sort by priority and date
      allInsights.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        }
        return new Date(b.uploadDate) - new Date(a.uploadDate);
      });

      setInsights(allInsights);
    } catch (error) {
      console.error("Error aggregating insights:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredInsights = insights.filter((insight) => {
    const priorityMatch =
      selectedPriority === "all" || insight.priority === selectedPriority;
    const typeMatch = selectedType === "all" || insight.type === selectedType;
    return priorityMatch && typeMatch;
  });

  const getInsightIcon = (type) => {
    switch (type) {
      case "risk":
        return "⚠️";
      case "improvement":
        return "✅";
      case "alert":
        return "🚨";
      case "recommendation":
        return "💡";
      default:
        return "📋";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return isDarkMode
          ? "bg-red-900 text-red-200 border-red-700"
          : "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return isDarkMode
          ? "bg-yellow-900 text-yellow-200 border-yellow-700"
          : "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return isDarkMode
          ? "bg-blue-900 text-blue-200 border-blue-700"
          : "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return isDarkMode
          ? "bg-gray-700 text-gray-300 border-gray-600"
          : "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "risk":
        return isDarkMode
          ? "bg-red-900 bg-opacity-30 border-l-red-400"
          : "bg-red-50 border-l-red-400";
      case "improvement":
        return isDarkMode
          ? "bg-green-900 bg-opacity-30 border-l-green-400"
          : "bg-green-50 border-l-green-400";
      case "alert":
        return isDarkMode
          ? "bg-orange-900 bg-opacity-30 border-l-orange-400"
          : "bg-orange-50 border-l-orange-400";
      case "recommendation":
        return isDarkMode
          ? "bg-blue-900 bg-opacity-30 border-l-blue-400"
          : "bg-blue-50 border-l-blue-400";
      default:
        return isDarkMode
          ? "bg-gray-800 border-l-gray-400"
          : "bg-gray-50 border-l-gray-400";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div
        className={`${
          isDarkMode
            ? "bg-gray-800 border-gray-700"
            : "bg-white border-gray-200"
        } rounded-lg border p-6`}
      >
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-custom"></div>
          <span
            className={`ml-3 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}
          >
            Analyzing clinical insights...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${
        isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
      } rounded-lg border`}
    >
      {/* Header */}
      <div
        className={`p-6 border-b ${
          isDarkMode ? "border-gray-700" : "border-gray-200"
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3
              className={`text-lg font-semibold ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Clinical Insights Dashboard
            </h3>
            <p
              className={`text-sm ${
                isDarkMode ? "text-gray-300" : "text-gray-600"
              } mt-1`}
            >
              AI-generated clinical insights from patient documentation
            </p>
          </div>
          <div className="flex items-center space-x-4">
            {/* Priority Filter */}
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className={`text-sm border ${
                isDarkMode
                  ? "border-gray-600 bg-gray-700 text-white"
                  : "border-gray-300"
              } rounded-lg px-3 py-1 focus:ring-2 focus:ring-primary-custom focus:border-transparent`}
            >
              <option value="all">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>

            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className={`text-sm border ${
                isDarkMode
                  ? "border-gray-600 bg-gray-700 text-white"
                  : "border-gray-300"
              } rounded-lg px-3 py-1 focus:ring-2 focus:ring-primary-custom focus:border-transparent`}
            >
              <option value="all">All Types</option>
              <option value="risk">Risk Factors</option>
              <option value="improvement">Improvements</option>
              <option value="alert">Alerts</option>
              <option value="recommendation">Recommendations</option>
            </select>
          </div>
        </div>
      </div>

      {/* Insights Summary Cards */}
      <div
        className={`p-6 border-b ${
          isDarkMode ? "border-gray-700" : "border-gray-200"
        }`}
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {["high", "medium", "low"].map((priority) => {
            const count = insights.filter(
              (i) => i.priority === priority
            ).length;
            return (
              <div
                key={priority}
                className={`p-4 rounded-lg border ${getPriorityColor(
                  priority
                )}`}
              >
                <div className="text-2xl font-bold">{count}</div>
                <div className="text-sm font-medium capitalize">
                  {priority} Priority
                </div>
              </div>
            );
          })}
          <div
            className={`p-4 rounded-lg border ${
              isDarkMode
                ? "bg-gray-700 text-gray-300 border-gray-600"
                : "bg-gray-100 text-gray-800 border-gray-200"
            }`}
          >
            <div className="text-2xl font-bold">{insights.length}</div>
            <div className="text-sm font-medium">Total Insights</div>
          </div>
        </div>
      </div>

      {/* Insights List */}
      <div className="p-6">
        {filteredInsights.length === 0 ? (
          <div className="text-center py-8">
            <div
              className={`${
                isDarkMode ? "text-gray-500" : "text-gray-400"
              } text-4xl mb-4`}
            >
              🔍
            </div>
            <p className={`${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
              No clinical insights found
            </p>
            <p
              className={`text-sm ${
                isDarkMode ? "text-gray-500" : "text-gray-400"
              } mt-1`}
            >
              Upload and analyze patient documents to generate insights
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredInsights.map((insight, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-l-4 ${getTypeColor(
                  insight.type
                )}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <span className="text-lg mr-2">
                        {getInsightIcon(insight.type)}
                      </span>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(
                          insight.priority
                        )}`}
                      >
                        {insight.priority.toUpperCase()}
                      </span>
                      <span
                        className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${
                          isDarkMode
                            ? "bg-gray-700 text-gray-300"
                            : "bg-gray-100 text-gray-700"
                        } capitalize`}
                      >
                        {insight.type}
                      </span>
                    </div>

                    <p
                      className={`${
                        isDarkMode ? "text-white" : "text-gray-900"
                      } font-medium mb-2`}
                    >
                      {insight.message}
                    </p>

                    <div
                      className={`flex items-center text-sm ${
                        isDarkMode ? "text-gray-400" : "text-gray-600"
                      } space-x-4`}
                    >
                      <span>📄 {insight.fileName}</span>
                      {insight.patientName && (
                        <span>👤 {insight.patientName}</span>
                      )}
                      <span>📅 {formatDate(insight.uploadDate)}</span>
                    </div>
                  </div>

                  <div className="ml-4">
                    <button
                      onClick={() => {
                        // Navigate to file detail view
                        window.location.href = `/dashboard/files/${insight.fileId}`;
                      }}
                      className="text-primary-custom hover:text-primary-custom/80 text-sm font-medium"
                    >
                      View Details →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClinicalInsightsDashboard;
