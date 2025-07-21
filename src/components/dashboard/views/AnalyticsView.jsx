import { useState, useEffect } from "react";
import { usePatientData } from "../../../contexts/PatientDataContext";
import { useTheme } from "../../../contexts/ThemeContext";

const AnalyticsView = ({ selectedPatient }) => {
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
    const patientActivity = patients
      .map((patient) => ({
        name: patient.name,
        documents: patient.files.filter(
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
      } rounded-lg border p-6`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p
            className={`text-sm font-medium ${
              isDarkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            {title}
          </p>
          <p
            className={`text-3xl font-bold ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            {value}
          </p>
          {subtitle && (
            <p
              className={`text-sm ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              } mt-1`}
            >
              {subtitle}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg bg-${color}-100`}>
          <svg
            className={`w-6 h-6 text-${color}-600`}
            fill="none"
            stroke="currentColor"
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
        <div className="mt-4 flex items-center">
          <span
            className={`text-sm font-medium ${
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
            className={`text-sm ${
              isDarkMode ? "text-gray-400" : "text-gray-500"
            } ml-2`}
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
      } rounded-lg border p-6`}
    >
      <h3
        className={`text-lg font-semibold ${
          isDarkMode ? "text-white" : "text-gray-900"
        } mb-4`}
      >
        {title}
      </h3>
      {children}
    </div>
  );

  return (
    <div className="p-6 overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2
              className={`text-2xl font-bold ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Analytics Dashboard
            </h2>
            <p className={`${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
              Clinical insights and performance metrics
            </p>
          </div>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-custom"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Processing Trends */}
          <ChartCard title="Document Processing Trends">
            <div className="space-y-3">
              {analytics.processingTrends.map((day, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span
                    className={`text-sm ${
                      isDarkMode ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    {day.date}
                  </span>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                      <span
                        className={`text-sm ${
                          isDarkMode ? "text-gray-200" : "text-gray-900"
                        }`}
                      >
                        {day.uploaded} uploaded
                      </span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                      <span
                        className={`text-sm ${
                          isDarkMode ? "text-gray-200" : "text-gray-900"
                        }`}
                      >
                        {day.processed} processed
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ChartCard>

          {/* Document Types */}
          <ChartCard title="Document Types">
            <div className="space-y-3">
              {Object.entries(analytics.documentTypes).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <span
                    className={`text-sm font-medium ${
                      isDarkMode ? "text-gray-200" : "text-gray-900"
                    } capitalize`}
                  >
                    {type}
                  </span>
                  <div className="flex items-center">
                    <div
                      className={`w-32 ${
                        isDarkMode ? "bg-gray-600" : "bg-gray-200"
                      } rounded-full h-2 mr-3`}
                    >
                      <div
                        className="bg-primary-custom h-2 rounded-full"
                        style={{
                          width: `${(count / analytics.totalDocuments) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <span
                      className={`text-sm ${
                        isDarkMode ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      {count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>

        {/* OASIS Scores and Clinical Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* OASIS Scores */}
          <ChartCard title="OASIS Score Trends">
            <div className="space-y-4">
              {analytics.oasisScores.map((score, index) => (
                <div
                  key={index}
                  className={`border ${
                    isDarkMode ? "border-gray-600" : "border-gray-200"
                  } rounded-lg p-4`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4
                        className={`font-medium ${
                          isDarkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {score.item}
                      </h4>
                      <p
                        className={`text-sm ${
                          isDarkMode ? "text-gray-300" : "text-gray-600"
                        }`}
                      >
                        {score.description}
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-lg font-bold ${
                          isDarkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {score.averageScore}
                      </p>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          score.trend === "improving"
                            ? "bg-green-100 text-green-800"
                            : score.trend === "declining"
                            ? "bg-red-100 text-red-800"
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
            <div className="space-y-3">
              {analytics.clinicalInsights.map((insight, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-l-4 ${
                    insight.priority === "high"
                      ? "bg-red-50 border-red-400"
                      : insight.priority === "medium"
                      ? "bg-yellow-50 border-yellow-400"
                      : "bg-blue-50 border-blue-400"
                  }`}
                >
                  <div className="flex items-start">
                    <div
                      className={`p-1 rounded-full mr-3 ${
                        insight.type === "risk"
                          ? "bg-red-100"
                          : insight.type === "improvement"
                          ? "bg-green-100"
                          : insight.type === "alert"
                          ? "bg-yellow-100"
                          : "bg-blue-100"
                      }`}
                    >
                      <svg
                        className={`w-4 h-4 ${
                          insight.type === "risk"
                            ? "text-red-600"
                            : insight.type === "improvement"
                            ? "text-green-600"
                            : insight.type === "alert"
                            ? "text-yellow-600"
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
                    <div className="flex-1">
                      <p
                        className={`text-sm font-medium ${
                          insight.priority === "high"
                            ? "text-red-800"
                            : insight.priority === "medium"
                            ? "text-yellow-800"
                            : "text-blue-800"
                        }`}
                      >
                        {insight.message}
                      </p>
                      <p
                        className={`text-xs ${
                          isDarkMode ? "text-gray-400" : "text-gray-600"
                        } mt-1 capitalize`}
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
          <div className="space-y-3">
            {analytics.patientActivity.map((patient, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-3 ${
                  isDarkMode ? "bg-gray-700" : "bg-gray-50"
                } rounded-lg`}
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-primary-custom rounded-full flex items-center justify-center mr-3">
                    <span className="text-white text-sm font-medium">
                      {patient.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p
                      className={`font-medium ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {patient.name}
                    </p>
                    <p
                      className={`text-sm ${
                        isDarkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Last activity:{" "}
                      {new Date(patient.lastActivity).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-primary-custom">
                    {patient.documents}
                  </p>
                  <p
                    className={`text-xs ${
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
