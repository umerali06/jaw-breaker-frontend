import { useState, useEffect } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import { API_ENDPOINTS } from "../../config/api";

// Brand color definitions for consistent styling
const BRAND = {
  primary: "#1a73e8", // Professional blue
  primaryLight: "#e8f0fe",
  primaryDark: "#0d47a1",
  secondary: "#34a853", // Healthy green
  secondaryLight: "#e6f4ea",
  secondaryDark: "#0d652d",
  accent: "#fbbc04", // Attention yellow
  accentLight: "#fff8e1",
  danger: "#d32f2f", // Alert red
  dangerLight: "#ffebee",
  dark: "#202124", // Dark background
  light: "#f8f9fa", // Light background
  neutral: "#5f6368", // Neutral gray
  white: "#ffffff",
};

const ClinicalInsightsDashboard = ({ files }) => {
  const { isDarkMode } = useTheme();
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [stats, setStats] = useState({
    high: 0,
    medium: 0,
    low: 0,
    total: 0,
    byType: {
      risk: 0,
      improvement: 0,
      alert: 0,
      recommendation: 0,
      other: 0,
    },
  });

  useEffect(() => {
    if (files && files.length > 0) {
      aggregateInsights();
    }
  }, [files]);

  const aggregateInsights = async () => {
    setLoading(true);
    const allInsights = [];
    const stats = {
      high: 0,
      medium: 0,
      low: 0,
      total: 0,
      byType: {
        risk: 0,
        improvement: 0,
        alert: 0,
        recommendation: 0,
        other: 0,
      },
    };

    try {
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

          // Update stats
          fileInsights.forEach((insight) => {
            stats[insight.priority]++;
            stats.total++;
            stats.byType[insight.type] = (stats.byType[insight.type] || 0) + 1;
          });

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
      setStats(stats);
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

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return {
          bg: isDarkMode ? `${BRAND.danger}20` : `${BRAND.danger}10`,
          text: BRAND.danger,
          border: isDarkMode ? `${BRAND.danger}40` : `${BRAND.danger}20`,
        };
      case "medium":
        return {
          bg: isDarkMode ? `${BRAND.accent}20` : `${BRAND.accent}10`,
          text: BRAND.accentDark,
          border: isDarkMode ? `${BRAND.accent}40` : `${BRAND.accent}20`,
        };
      case "low":
        return {
          bg: isDarkMode ? `${BRAND.primary}20` : `${BRAND.primary}10`,
          text: BRAND.primary,
          border: isDarkMode ? `${BRAND.primary}40` : `${BRAND.primary}20`,
        };
      default:
        return {
          bg: isDarkMode ? `${BRAND.neutral}20` : `${BRAND.neutral}10`,
          text: isDarkMode ? BRAND.white : BRAND.dark,
          border: isDarkMode ? `${BRAND.neutral}40` : `${BRAND.neutral}20`,
        };
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "risk":
        return {
          bg: isDarkMode ? `${BRAND.danger}15` : `${BRAND.danger}08`,
          border: BRAND.danger,
          icon: "⚠️",
          iconBg: isDarkMode ? `${BRAND.danger}25` : `${BRAND.danger}15`,
        };
      case "improvement":
        return {
          bg: isDarkMode ? `${BRAND.secondary}15` : `${BRAND.secondary}08`,
          border: BRAND.secondary,
          icon: "✅",
          iconBg: isDarkMode ? `${BRAND.secondary}25` : `${BRAND.secondary}15`,
        };
      case "alert":
        return {
          bg: isDarkMode ? `${BRAND.accent}15` : `${BRAND.accent}08`,
          border: BRAND.accentDark,
          icon: "🚨",
          iconBg: isDarkMode ? `${BRAND.accent}25` : `${BRAND.accent}15`,
        };
      case "recommendation":
        return {
          bg: isDarkMode ? `${BRAND.primary}15` : `${BRAND.primary}08`,
          border: BRAND.primary,
          icon: "💡",
          iconBg: isDarkMode ? `${BRAND.primary}25` : `${BRAND.primary}15`,
        };
      default:
        return {
          bg: isDarkMode ? `${BRAND.neutral}15` : `${BRAND.neutral}08`,
          border: BRAND.neutral,
          icon: "📋",
          iconBg: isDarkMode ? `${BRAND.neutral}25` : `${BRAND.neutral}15`,
        };
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Copy/export helpers
  const copyInsights = () => {
    const text = filteredInsights
      .map(
        (insight) =>
          `${insight.priority.toUpperCase()} [${insight.type}] - ${
            insight.message
          } (File: ${insight.fileName}, Patient: ${
            insight.patientName || "N/A"
          }, Date: ${formatDate(insight.uploadDate)})`
      )
      .join("\n");
    navigator.clipboard.writeText(text);
  };

  const exportInsights = () => {
    const blob = new Blob([JSON.stringify(filteredInsights, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "clinical-insights.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div
        className={`rounded-xl border p-6 transition-all duration-300 ${
          isDarkMode
            ? "bg-gray-800 border-gray-700"
            : "bg-white border-gray-200"
        }`}
        style={{
          boxShadow: isDarkMode
            ? "0 4px 6px rgba(0, 0, 0, 0.3)"
            : "0 4px 6px rgba(0, 0, 0, 0.1)",
        }}
      >
        <div className="flex items-center justify-center py-8">
          <div
            className="animate-spin rounded-full h-8 w-8 border-b-2"
            style={{ borderBottomColor: BRAND.primary }}
          ></div>
          <span
            className={`ml-3 text-sm font-medium ${
              isDarkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            Analyzing clinical documents...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-xl border transition-all duration-300 ${
        isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
      }`}
      style={{
        boxShadow: isDarkMode
          ? "0 4px 6px rgba(0, 0, 0, 0.3)"
          : "0 4px 6px rgba(0, 0, 0, 0.1)",
      }}
    >
      {/* Header */}
      <div
        className={`p-4 sm:p-6 border-b ${
          isDarkMode ? "border-gray-700" : "border-gray-200"
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4">
          <div>
            <h3
              className={`text-lg sm:text-xl font-bold ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Clinical Insights Dashboard
            </h3>
            <p
              className={`text-xs sm:text-sm ${
                isDarkMode ? "text-gray-400" : "text-gray-600"
              } mt-0.5 sm:mt-1`}
            >
              AI-generated clinical findings from patient documentation
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            {/* Priority Filter */}
            <div className="relative">
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className={`appearance-none text-xs sm:text-sm border rounded-lg pl-2 sm:pl-3 pr-6 sm:pr-8 py-1.5 sm:py-2 focus:ring-2 focus:outline-none transition-all ${
                  isDarkMode
                    ? "border-gray-600 bg-gray-700 text-white focus:ring-primary-500 focus:border-transparent"
                    : "border-gray-300 focus:ring-primary-500 focus:border-transparent"
                }`}
              >
                <option value="all">All Priorities</option>
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>

            {/* Type Filter */}
            <div className="relative">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className={`appearance-none text-xs sm:text-sm border rounded-lg pl-2 sm:pl-3 pr-6 sm:pr-8 py-1.5 sm:py-2 focus:ring-2 focus:outline-none transition-all ${
                  isDarkMode
                    ? "border-gray-600 bg-gray-700 text-white focus:ring-primary-500 focus:border-transparent"
                    : "border-gray-300 focus:ring-primary-500 focus:border-transparent"
                }`}
              >
                <option value="all">All Types</option>
                <option value="risk">Risk Factors</option>
                <option value="improvement">Improvements</option>
                <option value="alert">Alerts</option>
                <option value="recommendation">Recommendations</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Insights Summary Cards */}
      <div
        className={`p-3 sm:p-6 border-b ${
          isDarkMode ? "border-gray-700" : "border-gray-200"
        }`}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-4">
          {/* High Priority Card */}
          <div
            className={`p-4 rounded-xl border transition-all duration-300 hover:shadow-md ${
              isDarkMode ? "hover:shadow-black/20" : "hover:shadow-gray-200/50"
            }`}
            style={{
              backgroundColor: isDarkMode
                ? `${BRAND.danger}15`
                : `${BRAND.danger}08`,
              borderColor: isDarkMode
                ? `${BRAND.danger}30`
                : `${BRAND.danger}20`,
            }}
            onClick={() => setSelectedPriority("high")}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={`text-sm font-medium ${
                    isDarkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  High Priority
                </p>
                <p
                  className="text-2xl font-bold mt-1"
                  style={{ color: BRAND.danger }}
                >
                  {stats.high}
                </p>
              </div>
              <div
                className="p-2 rounded-lg"
                style={{
                  backgroundColor: isDarkMode
                    ? `${BRAND.danger}25`
                    : `${BRAND.danger}15`,
                }}
              >
                <span style={{ color: BRAND.danger }}>⚠️</span>
              </div>
            </div>
            <div
              className={`mt-2 h-1 rounded-full ${
                isDarkMode ? "bg-gray-700" : "bg-gray-200"
              }`}
            >
              <div
                className="h-1 rounded-full"
                style={{
                  width: `${(stats.high / stats.total) * 100}%`,
                  backgroundColor: BRAND.danger,
                }}
              ></div>
            </div>
          </div>

          {/* Medium Priority Card */}
          <div
            className={`p-4 rounded-xl border transition-all duration-300 hover:shadow-md ${
              isDarkMode ? "hover:shadow-black/20" : "hover:shadow-gray-200/50"
            }`}
            style={{
              backgroundColor: isDarkMode
                ? `${BRAND.accent}15`
                : `${BRAND.accent}08`,
              borderColor: isDarkMode
                ? `${BRAND.accent}30`
                : `${BRAND.accent}20`,
            }}
            onClick={() => setSelectedPriority("medium")}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={`text-sm font-medium ${
                    isDarkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  Medium Priority
                </p>
                <p
                  className="text-2xl font-bold mt-1"
                  style={{ color: BRAND.accentDark }}
                >
                  {stats.medium}
                </p>
              </div>
              <div
                className="p-2 rounded-lg"
                style={{
                  backgroundColor: isDarkMode
                    ? `${BRAND.accent}25`
                    : `${BRAND.accent}15`,
                }}
              >
                <span style={{ color: BRAND.accentDark }}>🔔</span>
              </div>
            </div>
            <div
              className={`mt-2 h-1 rounded-full ${
                isDarkMode ? "bg-gray-700" : "bg-gray-200"
              }`}
            >
              <div
                className="h-1 rounded-full"
                style={{
                  width: `${(stats.medium / stats.total) * 100}%`,
                  backgroundColor: BRAND.accentDark,
                }}
              ></div>
            </div>
          </div>

          {/* Low Priority Card */}
          <div
            className={`p-4 rounded-xl border transition-all duration-300 hover:shadow-md ${
              isDarkMode ? "hover:shadow-black/20" : "hover:shadow-gray-200/50"
            }`}
            style={{
              backgroundColor: isDarkMode
                ? `${BRAND.primary}15`
                : `${BRAND.primary}08`,
              borderColor: isDarkMode
                ? `${BRAND.primary}30`
                : `${BRAND.primary}20`,
            }}
            onClick={() => setSelectedPriority("low")}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={`text-sm font-medium ${
                    isDarkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  Low Priority
                </p>
                <p
                  className="text-2xl font-bold mt-1"
                  style={{ color: BRAND.primary }}
                >
                  {stats.low}
                </p>
              </div>
              <div
                className="p-2 rounded-lg"
                style={{
                  backgroundColor: isDarkMode
                    ? `${BRAND.primary}25`
                    : `${BRAND.primary}15`,
                }}
              >
                <span style={{ color: BRAND.primary }}>ℹ️</span>
              </div>
            </div>
            <div
              className={`mt-2 h-1 rounded-full ${
                isDarkMode ? "bg-gray-700" : "bg-gray-200"
              }`}
            >
              <div
                className="h-1 rounded-full"
                style={{
                  width: `${(stats.low / stats.total) * 100}%`,
                  backgroundColor: BRAND.primary,
                }}
              ></div>
            </div>
          </div>

          {/* Total Insights Card */}
          <div
            className={`p-4 rounded-xl border transition-all duration-300 hover:shadow-md ${
              isDarkMode ? "hover:shadow-black/20" : "hover:shadow-gray-200/50"
            }`}
            style={{
              backgroundColor: isDarkMode
                ? `${BRAND.secondary}15`
                : `${BRAND.secondary}08`,
              borderColor: isDarkMode
                ? `${BRAND.secondary}30`
                : `${BRAND.secondary}20`,
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={`text-sm font-medium ${
                    isDarkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  Total Insights
                </p>
                <p
                  className="text-2xl font-bold mt-1"
                  style={{ color: BRAND.secondary }}
                >
                  {stats.total}
                </p>
              </div>
              <div
                className="p-2 rounded-lg"
                style={{
                  backgroundColor: isDarkMode
                    ? `${BRAND.secondary}25`
                    : `${BRAND.secondary}15`,
                }}
              >
                <span style={{ color: BRAND.secondary }}>📊</span>
              </div>
            </div>
            <div
              className={`mt-2 h-1 rounded-full ${
                isDarkMode ? "bg-gray-700" : "bg-gray-200"
              }`}
            >
              <div
                className="h-1 rounded-full"
                style={{
                  width: "100%",
                  backgroundColor: BRAND.secondary,
                }}
              ></div>
            </div>
          </div>

          {/* Critical Findings Card */}
          <div
            className={`p-4 rounded-xl border transition-all duration-300 hover:shadow-md ${
              isDarkMode ? "hover:shadow-black/20" : "hover:shadow-gray-200/50"
            }`}
            style={{
              backgroundColor: isDarkMode
                ? `${BRAND.danger}15`
                : `${BRAND.danger}08`,
              borderColor: isDarkMode
                ? `${BRAND.danger}30`
                : `${BRAND.danger}20`,
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={`text-sm font-medium ${
                    isDarkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  Critical Findings
                </p>
                <p
                  className="text-2xl font-bold mt-1"
                  style={{ color: BRAND.danger }}
                >
                  {insights.filter((i) => i.severity === "critical").length}
                </p>
              </div>
              <div
                className="p-2 rounded-lg"
                style={{
                  backgroundColor: isDarkMode
                    ? `${BRAND.danger}25`
                    : `${BRAND.danger}15`,
                }}
              >
                <span style={{ color: BRAND.danger }}>🚨</span>
              </div>
            </div>
            <div
              className={`mt-2 h-1 rounded-full ${
                isDarkMode ? "bg-gray-700" : "bg-gray-200"
              }`}
            >
              <div
                className="h-1 rounded-full"
                style={{
                  width: `${
                    (insights.filter((i) => i.severity === "critical").length /
                      stats.total) *
                    100
                  }%`,
                  backgroundColor: BRAND.danger,
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Insights List + Copy/Export */}
      <div className="p-3 sm:p-6">
        <div className="flex justify-end gap-1.5 sm:gap-2 mb-3 sm:mb-4">
          <button
            className="px-2 sm:px-3 py-1 rounded bg-[#2596be] text-white text-[10px] sm:text-xs font-bold hover:bg-[#1d7a9c]"
            onClick={copyInsights}
            title="Copy visible insights"
          >
            Copy Insights
          </button>
          <button
            className="px-2 sm:px-3 py-1 rounded bg-[#96be25] text-white text-[10px] sm:text-xs font-bold hover:bg-[#7a9c1d]"
            onClick={exportInsights}
            title="Export visible insights as JSON"
          >
            Export Insights
          </button>
        </div>
        {filteredInsights.length === 0 ? (
          <div
            className={`text-center py-8 sm:py-12 rounded-lg border-2 border-dashed ${
              isDarkMode ? "border-gray-700" : "border-gray-200"
            }`}
          >
            <div
              className={`text-4xl sm:text-5xl mb-3 sm:mb-4 ${
                isDarkMode ? "text-gray-600" : "text-gray-300"
              }`}
            >
              🔍
            </div>
            <h4
              className={`text-base sm:text-lg font-medium ${
                isDarkMode ? "text-gray-300" : "text-gray-500"
              }`}
            >
              No clinical insights found
            </h4>
            <p
              className={`text-xs sm:text-sm ${
                isDarkMode ? "text-gray-500" : "text-gray-400"
              } mt-1.5 sm:mt-2 max-w-md mx-auto px-4`}
            >
              {selectedPriority !== "all" || selectedType !== "all"
                ? "Try adjusting your filters to see more results"
                : "Upload and analyze patient documents to generate insights"}
            </p>
            <button
              className={`mt-3 sm:mt-4 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                isDarkMode
                  ? "bg-gray-700 hover:bg-gray-600 text-white"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-800"
              }`}
              onClick={() => {
                setSelectedPriority("all");
                setSelectedType("all");
              }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="space-y-2 sm:space-y-4">
            {filteredInsights.map((insight, index) => {
              const typeConfig = getTypeColor(insight.type);
              const priorityConfig = getPriorityColor(insight.priority);

              return (
                <div
                  key={index}
                  className={`p-3 sm:p-5 rounded-lg sm:rounded-xl border-l-4 transition-all duration-300 hover:shadow-sm overflow-hidden`}
                  style={{
                    backgroundColor: typeConfig.bg,
                    borderLeftColor: typeConfig.border,
                    borderTop: `1px solid ${
                      isDarkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"
                    }`,
                    borderRight: `1px solid ${
                      isDarkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"
                    }`,
                    borderBottom: `1px solid ${
                      isDarkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"
                    }`,
                  }}
                >
                  <div className="flex items-start gap-2 sm:gap-4">
                    <div
                      className="p-2 sm:p-3 rounded-lg flex-shrink-0"
                      style={{
                        backgroundColor: typeConfig.iconBg,
                      }}
                    >
                      <span className="text-lg sm:text-xl">
                        {typeConfig.icon}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0 overflow-hidden">
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                        <span
                          className={`px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium flex items-center`}
                          style={{
                            backgroundColor: priorityConfig.bg,
                            color: priorityConfig.text,
                            border: `1px solid ${priorityConfig.border}`,
                          }}
                          title={
                            insight.priority === "high"
                              ? "High: Requires urgent attention"
                              : insight.priority === "medium"
                              ? "Medium: Important but not urgent"
                              : insight.priority === "low"
                              ? "Low: For awareness"
                              : "Other priority"
                          }
                        >
                          {insight.priority.toUpperCase()}
                          <svg
                            className="inline ml-0.5 sm:ml-1 w-2.5 h-2.5 sm:w-3 sm:h-3 text-gray-400"
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
                        <span
                          className={`px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium capitalize flex items-center`}
                          style={{
                            backgroundColor: isDarkMode
                              ? "rgba(255,255,255,0.1)"
                              : "rgba(0,0,0,0.05)",
                            color: isDarkMode ? "#e5e7eb" : "#4b5563",
                          }}
                          title={
                            insight.type === "risk"
                              ? "Risk: Potential negative outcome"
                              : insight.type === "improvement"
                              ? "Improvement: Positive change or progress"
                              : insight.type === "alert"
                              ? "Alert: Needs attention"
                              : insight.type === "recommendation"
                              ? "Recommendation: Suggested action"
                              : "Other type"
                          }
                        >
                          {insight.type}
                          <svg
                            className="inline ml-0.5 sm:ml-1 w-2.5 h-2.5 sm:w-3 sm:h-3 text-gray-400"
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
                        {insight.severity === "critical" && (
                          <span
                            className={`px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium`}
                            style={{
                              backgroundColor: isDarkMode
                                ? `${BRAND.danger}25`
                                : `${BRAND.danger}15`,
                              color: BRAND.danger,
                              border: `1px solid ${
                                isDarkMode
                                  ? `${BRAND.danger}40`
                                  : `${BRAND.danger}20`
                              }`,
                            }}
                          >
                            CRITICAL
                          </span>
                        )}
                      </div>

                      <p
                        className={`text-sm sm:text-base font-medium mb-3 break-words ${
                          isDarkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {insight.message}
                      </p>

                      <div className="flex flex-wrap items-center gap-x-2 sm:gap-x-4 gap-y-1 sm:gap-y-2 text-xs sm:text-sm">
                        <div
                          className={`flex items-center ${
                            isDarkMode ? "text-gray-400" : "text-gray-600"
                          }`}
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
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                          <span className="truncate">{insight.fileName}</span>
                        </div>

                        {insight.patientName && (
                          <div
                            className={`flex items-center ${
                              isDarkMode ? "text-gray-400" : "text-gray-600"
                            }`}
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
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                              />
                            </svg>
                            <span>{insight.patientName}</span>
                          </div>
                        )}

                        <div
                          className={`flex items-center ${
                            isDarkMode ? "text-gray-400" : "text-gray-600"
                          }`}
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
                              d="M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2m-4-4H9a2 2 0 00-2 2v4a2 2 0 002 2h2a2 2 0 002-2v-4a2 2 0 00-2-2z"
                            />
                          </svg>
                          <span>{formatDate(insight.uploadDate)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      <button
                        onClick={() => {
                          window.location.href = `/dashboard/files/${insight.fileId}`;
                        }}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center ${
                          isDarkMode
                            ? "bg-gray-700 hover:bg-gray-600 text-white"
                            : "bg-gray-100 hover:bg-gray-200 text-gray-800"
                        }`}
                      >
                        <span>Details</span>
                        <svg
                          className="w-4 h-4 ml-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClinicalInsightsDashboard;
