import { useState, useEffect } from "react";
import { usePatientData } from "../../../contexts/PatientDataContext";
import { useTheme } from "../../../contexts/ThemeContext";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const AnalyticsView = () => {
  const { patients, files } = usePatientData();
  const { isDarkMode } = useTheme();
  const [timeRange, setTimeRange] = useState("30"); // days
  const [analytics, setAnalytics] = useState({
    totalDocuments: 0,
    processedDocuments: 0,
    averageProcessingTime: 0,
    documentTypes: {},
    processingTrends: [],
    patientActivity: [],
    oasisScores: [],
    clinicalInsights: [],
  });

  useEffect(() => {
    calculateAnalytics();
  }, [files, patients, timeRange]);

  const calculateAnalytics = () => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(timeRange));

    const recentFiles = files.filter(
      (file) => new Date(file.createdAt) > cutoffDate
    );

    // Basic stats
    const totalDocuments = recentFiles.length;
    const processedDocuments = recentFiles.filter(
      (f) => f.processingStatus === "completed"
    ).length;

    // Document types
    const documentTypes = {};
    recentFiles.forEach((file) => {
      const type =
        (file.mimetype || "application/unknown").split("/")[1] || "unknown";
      documentTypes[type] = (documentTypes[type] || 0) + 1;
    });

    // Processing trends (last 7 days)
    const processingTrends = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayFiles = recentFiles.filter((file) => {
        const fileDate = new Date(file.createdAt);
        return fileDate.toDateString() === date.toDateString();
      });
      processingTrends.push({
        date: date.toLocaleDateString(),
        uploaded: dayFiles.length,
        processed: dayFiles.filter((f) => f.processingStatus === "completed")
          .length,
      });
    }

    // Patient activity
    const patientActivity = (patients || [])
      .map((patient) => ({
        name: patient.name,
        documents: (patient.files || []).filter(
          (f) => new Date(f.createdAt) > cutoffDate
        ).length,
        lastActivity: patient.lastUpdated,
      }))
      .sort((a, b) => b.documents - a.documents)
      .slice(0, 5);

    // Mock OASIS scores and clinical insights
    const oasisScores = [
      {
        item: "M1830",
        description: "Bathing",
        averageScore: 2.3,
        trend: "stable",
      },
      {
        item: "M1840",
        description: "Toilet Transferring",
        averageScore: 1.8,
        trend: "improving",
      },
      {
        item: "M1850",
        description: "Transferring",
        averageScore: 2.1,
        trend: "declining",
      },
      {
        item: "M1860",
        description: "Ambulation",
        averageScore: 2.5,
        trend: "stable",
      },
    ];

    const clinicalInsights = [
      {
        type: "risk",
        message: "Increased fall risk identified in 3 patients",
        priority: "high",
      },
      {
        type: "improvement",
        message: "Overall mobility scores improving",
        priority: "medium",
      },
      {
        type: "alert",
        message: "2 patients require medication review",
        priority: "high",
      },
      {
        type: "trend",
        message: "Documentation completeness at 95%",
        priority: "low",
      },
    ];

    setAnalytics({
      totalDocuments,
      processedDocuments,
      averageProcessingTime: 2.3, // Mock value
      documentTypes,
      processingTrends,
      patientActivity,
      oasisScores,
      clinicalInsights,
    });
  };

  const StatCard = ({
    title,
    value,
    subtitle,
    icon,
    color = "blue",
    trend,
  }) => (
    <div
      className={`${
        isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
      } rounded-lg border p-3 sm:p-6 h-full`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p
            className={`text-[10px] sm:text-xs md:text-sm font-medium truncate ${
              isDarkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            {title}
          </p>
          <p
            className={`text-lg sm:text-xl md:text-3xl font-bold truncate ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            {value}
          </p>
          {subtitle && (
            <p
              className={`text-[10px] sm:text-xs ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              } mt-0.5 truncate`}
            >
              {subtitle}
            </p>
          )}
        </div>
        <div
          className={`p-1.5 sm:p-2 md:p-3 rounded-lg flex-shrink-0`}
          style={{
            backgroundColor: isDarkMode
              ? `rgba(${
                  color === "blue"
                    ? "37, 99, 235"
                    : color === "green"
                    ? "52, 168, 83"
                    : color === "yellow"
                    ? "251, 188, 4"
                    : "211, 47, 47"
                }, 0.2)`
              : `rgba(${
                  color === "blue"
                    ? "37, 99, 235"
                    : color === "green"
                    ? "52, 168, 83"
                    : color === "yellow"
                    ? "251, 188, 4"
                    : "211, 47, 47"
                }, 0.1)`,
          }}
        >
          <svg
            className={`w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-6 md:h-6`}
            fill="none"
            stroke={
              color === "blue"
                ? "#2563eb"
                : color === "green"
                ? "#34a853"
                : color === "yellow"
                ? "#fbbc04"
                : "#d32f2f"
            }
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={icon}
            />
          </svg>
        </div>
      </div>
      {trend && (
        <div className="mt-1 sm:mt-2 md:mt-4 flex items-center">
          <span
            className={`text-[10px] sm:text-xs font-medium ${
              trend.direction === "up"
                ? "text-green-600"
                : trend.direction === "down"
                ? "text-red-600"
                : isDarkMode
                ? "text-gray-400"
                : "text-gray-600"
            }`}
          >
            {trend.direction === "up"
              ? "↗"
              : trend.direction === "down"
              ? "↘"
              : "→"}{" "}
            {trend.value}
          </span>
          <span
            className={`text-[10px] sm:text-xs ${
              isDarkMode ? "text-gray-400" : "text-gray-500"
            } ml-1 truncate`}
          >
            vs last period
          </span>
        </div>
      )}
    </div>
  );

  const ChartCard = ({ title, children }) => (
    <div
      className={`${
        isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
      } rounded-lg border p-3 sm:p-6 h-full flex flex-col`}
    >
      <h3
        className={`text-sm sm:text-base md:text-lg font-semibold ${
          isDarkMode ? "text-white" : "text-gray-900"
        } mb-2 sm:mb-4 truncate`}
      >
        {title}
      </h3>
      <div className="flex-1 min-h-0 flex flex-col">{children}</div>
    </div>
  );

  return (
    <div className="p-3 sm:p-6 overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
          <div>
            <h2
              className={`text-lg sm:text-xl md:text-2xl font-bold ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Analytics Dashboard
            </h2>
            <p
              className={`text-xs sm:text-sm ${
                isDarkMode ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Clinical insights and performance metrics
            </p>
          </div>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className={`px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 text-xs sm:text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2596be] ${
              isDarkMode
                ? "bg-gray-700 border-gray-600 text-white"
                : "bg-white border-gray-300 text-gray-900"
            }`}
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6 md:mb-8">
          <StatCard
            title="Total Documents"
            value={analytics.totalDocuments}
            subtitle="Uploaded in period"
            icon="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            color="blue"
            trend={{ direction: "up", value: "+12%" }}
          />
          <StatCard
            title="Processed"
            value={analytics.processedDocuments}
            subtitle={`${
              Math.round(
                (analytics.processedDocuments / analytics.totalDocuments) * 100
              ) || 0
            }% completion rate`}
            icon="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            color="green"
            trend={{ direction: "up", value: "+8%" }}
          />
          <StatCard
            title="Active Patients"
            value={patients.length}
            subtitle="With recent activity"
            icon="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
            color="purple"
            trend={{ direction: "stable", value: "0%" }}
          />
          <StatCard
            title="Avg Processing"
            value={`${analytics.averageProcessingTime}min`}
            subtitle="Per document"
            icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            color="yellow"
            trend={{ direction: "down", value: "-15%" }}
          />
        </div>

        {/* Charts and Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6 md:mb-8">
          {/* Processing Trends */}
          <ChartCard title="Document Processing Trends">
            <div className="w-full h-40 sm:h-48 md:h-72 flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={analytics.processingTrends}
                  margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
                >
                  <XAxis
                    dataKey="date"
                    stroke={isDarkMode ? "#fff" : "#333"}
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis
                    stroke={isDarkMode ? "#fff" : "#333"}
                    tick={{ fontSize: 10 }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: isDarkMode ? "#222" : "#fff",
                      borderRadius: 8,
                      border: "none",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                      fontSize: "12px",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "10px" }} />
                  <Bar
                    dataKey="uploaded"
                    name="Uploaded"
                    radius={[4, 4, 0, 0]}
                    fill="url(#uploadedGradient)"
                  />
                  <Bar
                    dataKey="processed"
                    name="Processed"
                    radius={[4, 4, 0, 0]}
                    fill="url(#processedGradient)"
                  />
                  <defs>
                    <linearGradient
                      id="uploadedGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#2596be" />
                      <stop offset="100%" stopColor="#96be25" />
                    </linearGradient>
                    <linearGradient
                      id="processedGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#96be25" />
                      <stop offset="100%" stopColor="#2596be" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          {/* Document Types */}
          <ChartCard title="Document Types Distribution">
            <div className="w-full h-40 sm:h-48 md:h-72 flex items-center justify-center flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={Object.entries(analytics.documentTypes).map(
                      ([type, count]) => ({ name: type, value: count })
                    )}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={window.innerWidth < 640 ? 60 : 90}
                    innerRadius={window.innerWidth < 640 ? 30 : 50}
                    paddingAngle={2}
                    label={({ name, percent }) =>
                      window.innerWidth < 640
                        ? `${(percent * 100).toFixed(0)}%`
                        : `${name} ${(percent * 100).toFixed(1)}%`
                    }
                  >
                    {Object.entries(analytics.documentTypes).map(
                      (entry, idx) => (
                        <Cell
                          key={`cell-${idx}`}
                          fill={idx % 2 === 0 ? "#2596be" : "#96be25"}
                        />
                      )
                    )}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: isDarkMode ? "#222" : "#fff",
                      borderRadius: 8,
                      border: "none",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                      fontSize: "12px",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "10px" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        {/* OASIS Scores and Clinical Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6 md:mb-8">
          {/* OASIS Scores */}
          <ChartCard title="OASIS Score Trends">
            <div className="space-y-2 sm:space-y-3 md:space-y-4 overflow-y-auto flex-1">
              {analytics.oasisScores.map((score, index) => (
                <div
                  key={index}
                  className={`border ${
                    isDarkMode ? "border-gray-600" : "border-gray-200"
                  } rounded-lg p-2 sm:p-3 md:p-4`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <h4
                        className={`font-medium text-sm sm:text-base truncate ${
                          isDarkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {score.item}
                      </h4>
                      <p
                        className={`text-xs sm:text-sm truncate ${
                          isDarkMode ? "text-gray-300" : "text-gray-600"
                        }`}
                      >
                        {score.description}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p
                        className={`text-base sm:text-lg font-bold ${
                          isDarkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {score.averageScore}
                      </p>
                      <span
                        className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full inline-block ${
                          score.trend === "improving"
                            ? isDarkMode
                              ? "bg-green-900 bg-opacity-30 text-green-300"
                              : "bg-green-100 text-green-800"
                            : score.trend === "declining"
                            ? isDarkMode
                              ? "bg-red-900 bg-opacity-30 text-red-300"
                              : "bg-red-100 text-red-800"
                            : isDarkMode
                            ? "bg-gray-700 text-gray-300"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {score.trend}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ChartCard>

          {/* Clinical Insights */}
          <ChartCard title="Clinical Insights">
            <div className="space-y-2 sm:space-y-3 overflow-y-auto flex-1">
              {analytics.clinicalInsights.map((insight, index) => (
                <div
                  key={index}
                  className={`p-2 sm:p-3 md:p-4 rounded-lg border-l-4 ${
                    insight.priority === "high"
                      ? isDarkMode
                        ? "bg-red-900 bg-opacity-20 border-red-500"
                        : "bg-red-50 border-red-400"
                      : insight.priority === "medium"
                      ? isDarkMode
                        ? "bg-yellow-900 bg-opacity-20 border-yellow-500"
                        : "bg-yellow-50 border-yellow-400"
                      : isDarkMode
                      ? "bg-blue-900 bg-opacity-20 border-blue-500"
                      : "bg-blue-50 border-blue-400"
                  }`}
                >
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div
                      className={`p-1 rounded-full flex-shrink-0 ${
                        insight.type === "risk"
                          ? isDarkMode
                            ? "bg-red-900 bg-opacity-50"
                            : "bg-red-100"
                          : insight.type === "improvement"
                          ? isDarkMode
                            ? "bg-green-900 bg-opacity-50"
                            : "bg-green-100"
                          : insight.type === "alert"
                          ? isDarkMode
                            ? "bg-yellow-900 bg-opacity-50"
                            : "bg-yellow-100"
                          : isDarkMode
                          ? "bg-blue-900 bg-opacity-50"
                          : "bg-blue-100"
                      }`}
                    >
                      <svg
                        className={`w-3 h-3 sm:w-4 sm:h-4 ${
                          insight.type === "risk"
                            ? isDarkMode
                              ? "text-red-400"
                              : "text-red-600"
                            : insight.type === "improvement"
                            ? isDarkMode
                              ? "text-green-400"
                              : "text-green-600"
                            : insight.type === "alert"
                            ? isDarkMode
                              ? "text-yellow-400"
                              : "text-yellow-600"
                            : isDarkMode
                            ? "text-blue-400"
                            : "text-blue-600"
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d={
                            insight.type === "risk"
                              ? "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
                              : insight.type === "improvement"
                              ? "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                              : insight.type === "alert"
                              ? "M15 17h5l-5 5v-5zM4 19h6v-6H4v6zM16 3h5v5h-5V3zM4 3h6v6H4V3z"
                              : "M13 10V3L4 14h7v7l9-11h-7z"
                          }
                        />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-xs sm:text-sm font-medium break-words ${
                          insight.priority === "high"
                            ? isDarkMode
                              ? "text-red-300"
                              : "text-red-800"
                            : insight.priority === "medium"
                            ? isDarkMode
                              ? "text-yellow-300"
                              : "text-yellow-800"
                            : isDarkMode
                            ? "text-blue-300"
                            : "text-blue-800"
                        }`}
                      >
                        {insight.message}
                      </p>
                      <p
                        className={`text-[10px] sm:text-xs ${
                          isDarkMode ? "text-gray-400" : "text-gray-600"
                        } mt-0.5 sm:mt-1 capitalize`}
                      >
                        {insight.priority} priority • {insight.type}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>

        {/* Patient Activity */}
        <ChartCard title="Most Active Patients">
          <div className="space-y-2 sm:space-y-3 overflow-y-auto flex-1">
            {analytics.patientActivity.map((patient, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-2 sm:p-3 ${
                  isDarkMode ? "bg-gray-700" : "bg-gray-50"
                } rounded-lg`}
              >
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <div
                    className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: "#2596be" }}
                  >
                    <span className="text-white text-xs sm:text-sm font-medium">
                      {patient.name.charAt(0)}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p
                      className={`font-medium text-sm sm:text-base truncate ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {patient.name}
                    </p>
                    <p
                      className={`text-[10px] sm:text-sm truncate ${
                        isDarkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Last activity:{" "}
                      {new Date(patient.lastActivity).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <p
                    className="text-base sm:text-lg font-bold"
                    style={{ color: "#2596be" }}
                  >
                    {patient.documents}
                  </p>
                  <p
                    className={`text-[10px] sm:text-xs ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    documents
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>
    </div>
  );
};

export default AnalyticsView;
