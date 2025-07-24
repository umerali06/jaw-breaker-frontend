import { useState, useEffect, useMemo } from "react";
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
  CartesianGrid,
  LineChart,
  Line,
  AreaChart,
  Area,
  RadialBarChart,
  RadialBar,
  ComposedChart,
  ScatterChart,
  Scatter,
  Treemap,
} from "recharts";

// Enhanced Brand color definitions with medical theme - Updated Version
const BRAND = {
  primary: "#1a73e8", // Professional blue
  primaryLight: "#e8f0fe",
  primaryDark: "#0d47a1",
  secondary: "#34a853", // Healthy green
  secondaryLight: "#e6f4ea",
  secondaryDark: "#0d652d",
  accent: "#fbbc04", // Attention yellow
  accentLight: "#fff8e1",
  accentDark: "#e65100",
  danger: "#d32f2f", // Alert red
  dangerLight: "#ffebee",
  dark: "#202124", // Dark background
  light: "#f8f9fa", // Light background
  neutral: "#5f6368", // Neutral gray
  white: "#ffffff",
  purple: "#9c27b0",
  teal: "#009688",
  orange: "#ff9800",
  indigo: "#3f51b5",
  pink: "#e91e63",
  cyan: "#00bcd4",
};

const CHART_COLORS = [
  BRAND.primary,
  BRAND.secondary,
  BRAND.accent,
  BRAND.purple,
  BRAND.teal,
  BRAND.orange,
  BRAND.indigo,
  BRAND.pink,
  BRAND.cyan,
  BRAND.danger,
];

const AnalyticsView = () => {
  const { patients, files, loading } = usePatientData();
  const { isDarkMode } = useTheme();
  const [timeRange, setTimeRange] = useState("30");
  const [selectedView, setSelectedView] = useState("overview");
  const [isCalculating, setIsCalculating] = useState(false);

  // OASIS description helper function
  const getOASISDescription = (item) => {
    const descriptions = {
      M1830: "Bathing",
      M1840: "Toilet Transferring",
      M1850: "Transferring",
      M1860: "Ambulation/Locomotion",
      M1033: "Risk for Hospitalization",
      M1311: "Current Number of Unhealed Pressure Ulcers",
      M1322: "Current Number of Stage 2 Pressure Ulcers",
      M1324: "Stage of Most Problematic Unhealed Pressure Ulcer",
    };
    return descriptions[item] || item;
  };

  // Dynamic analytics calculation
  const analytics = useMemo(() => {
    if (loading || !files || !patients) return null;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(timeRange));

    const filesArray = Array.isArray(files) ? files : [];
    const patientsArray = Array.isArray(patients) ? patients : [];
    const recentFiles = filesArray.filter(
      (file) => file && file.createdAt && new Date(file.createdAt) > cutoffDate
    );

    // Basic metrics
    const totalDocuments = recentFiles.length;
    const processedDocuments = recentFiles.filter(
      (f) => f.processingStatus === "completed"
    ).length;
    const pendingDocuments = recentFiles.filter(
      (f) =>
        f.processingStatus === "pending" || f.processingStatus === "processing"
    ).length;
    const failedDocuments = recentFiles.filter(
      (f) => f.processingStatus === "failed"
    ).length;
    const processingSuccess =
      totalDocuments > 0
        ? Math.round((processedDocuments / totalDocuments) * 100)
        : 0;

    // Calculate all insights
    const allInsights = [];
    recentFiles.forEach((file) => {
      if (file.clinicalInsights && Array.isArray(file.clinicalInsights)) {
        file.clinicalInsights.forEach((insight) => {
          allInsights.push({
            ...insight,
            fileName: file.originalname,
            patientName: file.patientName,
            createdAt: file.createdAt,
            fileId: file._id,
          });
        });
      }
    });

    const totalInsights = allInsights.length;
    const criticalInsights = allInsights.filter(
      (i) => i.priority === "critical" || i.priority === "high"
    ).length;

    // Processing trends for the last 14 days
    const processingTrends = [];
    for (let i = 13; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayFiles = recentFiles.filter((file) => {
        const fileDate = new Date(file.createdAt);
        return fileDate.toDateString() === date.toDateString();
      });

      const uploaded = dayFiles.length;
      const processed = dayFiles.filter(
        (f) => f.processingStatus === "completed"
      ).length;
      const insights = dayFiles.reduce(
        (sum, file) =>
          sum + (file.clinicalInsights ? file.clinicalInsights.length : 0),
        0
      );

      processingTrends.push({
        date: date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        fullDate: date.toISOString().split("T")[0],
        uploaded,
        processed,
        insights,
        failed: dayFiles.filter((f) => f.processingStatus === "failed").length,
        success: uploaded > 0 ? Math.round((processed / uploaded) * 100) : 0,
      });
    }

    // Document types analysis
    const documentTypesMap = {};
    recentFiles.forEach((file) => {
      const type =
        (file.mimetype || "application/unknown").split("/")[1] || "unknown";
      const displayType =
        type === "pdf"
          ? "PDF"
          : type.includes("word")
          ? "Word"
          : type === "plain"
          ? "Text"
          : type.includes("image")
          ? "Image"
          : type.toUpperCase();
      documentTypesMap[displayType] = (documentTypesMap[displayType] || 0) + 1;
    });

    const documentTypes = Object.entries(documentTypesMap).map(
      ([name, value], index) => ({
        name,
        value,
        percentage: Math.round((value / totalDocuments) * 100) || 0,
        fill: CHART_COLORS[index % CHART_COLORS.length],
      })
    );

    // Insights by type and priority
    const insightsByTypeMap = {};
    const insightsByPriorityMap = {};

    allInsights.forEach((insight) => {
      const type = insight.type || "general";
      const priority = insight.priority || "medium";

      insightsByTypeMap[type] = (insightsByTypeMap[type] || 0) + 1;
      insightsByPriorityMap[priority] =
        (insightsByPriorityMap[priority] || 0) + 1;
    });

    const insightsByType = Object.entries(insightsByTypeMap).map(
      ([name, value], index) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
        percentage: Math.round((value / totalInsights) * 100) || 0,
        fill: CHART_COLORS[index % CHART_COLORS.length],
      })
    );

    const insightsByPriority = Object.entries(insightsByPriorityMap).map(
      ([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
        percentage: Math.round((value / totalInsights) * 100) || 0,
        fill:
          name === "critical"
            ? BRAND.danger
            : name === "high"
            ? BRAND.orange
            : name === "medium"
            ? BRAND.accent
            : BRAND.primary,
      })
    );

    // Patient activity analysis
    const patientActivity = patientsArray
      .map((patient) => {
        const patientFiles = (
          Array.isArray(patient.files) ? patient.files : []
        ).filter((f) => f && f.createdAt && new Date(f.createdAt) > cutoffDate);

        const totalInsights = patientFiles.reduce(
          (sum, file) =>
            sum + (file.clinicalInsights ? file.clinicalInsights.length : 0),
          0
        );

        const criticalFindings = patientFiles.reduce(
          (sum, file) =>
            sum +
            (file.clinicalInsights
              ? file.clinicalInsights.filter(
                  (i) => i.priority === "critical" || i.priority === "high"
                ).length
              : 0),
          0
        );

        const riskScore =
          criticalFindings > 5
            ? 85
            : criticalFindings > 2
            ? 65
            : criticalFindings > 0
            ? 45
            : 25;

        return {
          name:
            patient.name.length > 12
              ? patient.name.substring(0, 12) + "..."
              : patient.name,
          fullName: patient.name,
          documents: patientFiles.length,
          insights: totalInsights,
          criticalFindings,
          riskScore,
          lastActivity: patient.lastUpdated || new Date().toISOString(),
          processed: patientFiles.filter(
            (f) => f.processingStatus === "completed"
          ).length,
        };
      })
      .filter((p) => p.documents > 0)
      .sort((a, b) => b.insights - a.insights)
      .slice(0, 10);

    // OASIS scores analysis
    const oasisScores = [];
    const oasisData = {};

    recentFiles.forEach((file) => {
      if (file.oasisScores && typeof file.oasisScores === "object") {
        Object.entries(file.oasisScores).forEach(([item, score]) => {
          if (!oasisData[item]) {
            oasisData[item] = [];
          }
          if (typeof score === "object" && score.score !== undefined) {
            oasisData[item].push(parseFloat(score.score) || 0);
          } else if (typeof score === "number") {
            oasisData[item].push(score);
          }
        });
      }
    });

    Object.entries(oasisData).forEach(([item, scores]) => {
      if (scores.length > 0) {
        const average =
          scores.reduce((sum, score) => sum + score, 0) / scores.length;
        const description = getOASISDescription(item);
        oasisScores.push({
          item,
          description,
          averageScore: Math.round(average * 10) / 10,
          count: scores.length,
          maxScore: Math.max(...scores),
          minScore: Math.min(...scores),
          fill:
            average > 3
              ? BRAND.danger
              : average > 2
              ? BRAND.accent
              : BRAND.secondary,
        });
      }
    });

    // Processing performance metrics
    const completedFiles = recentFiles.filter(
      (f) =>
        f.processingStatus === "completed" &&
        f.processingStarted &&
        f.processingCompleted
    );

    let averageProcessingTime = 0;
    if (completedFiles.length > 0) {
      const totalTime = completedFiles.reduce((sum, file) => {
        const start = new Date(file.processingStarted);
        const end = new Date(file.processingCompleted);
        return sum + (end - start);
      }, 0);
      averageProcessingTime =
        Math.round((totalTime / completedFiles.length / 1000 / 60) * 10) / 10;
    }

    // Recent insights for timeline
    const recentInsights = allInsights
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10);

    // Processing status distribution
    const processingStatus = [
      { name: "Completed", value: processedDocuments, fill: BRAND.secondary },
      { name: "Pending", value: pendingDocuments, fill: BRAND.accent },
      { name: "Failed", value: failedDocuments, fill: BRAND.danger },
    ].filter((item) => item.value > 0);

    return {
      totalDocuments,
      processedDocuments,
      pendingDocuments,
      failedDocuments,
      processingSuccess,
      totalInsights,
      criticalInsights,
      averageProcessingTime,
      processingTrends,
      documentTypes,
      insightsByType,
      insightsByPriority,
      patientActivity,
      oasisScores,
      recentInsights,
      processingStatus,
    };
  }, [files, patients, timeRange, loading]);

  // Premium Metric Card Component
  const MetricCard = ({
    title,
    value,
    subtitle,
    icon,
    color = "primary",
    trend,
    onClick,
    isSelected,
    className = "",
  }) => {
    const colors = {
      primary: { bg: BRAND.primary, light: BRAND.primaryLight },
      secondary: { bg: BRAND.secondary, light: BRAND.secondaryLight },
      accent: { bg: BRAND.accent, light: BRAND.accentLight },
      danger: { bg: BRAND.danger, light: BRAND.dangerLight },
      purple: { bg: BRAND.purple, light: "#f3e5f5" },
      teal: { bg: BRAND.teal, light: "#e0f2f1" },
    };

    const currentColors = colors[color] || colors.primary;

    return (
      <div
        className={`p-4 sm:p-6 rounded-xl transition-all duration-300 cursor-pointer transform hover:scale-105 hover:shadow-lg ${
          isSelected ? "ring-2 ring-offset-2 shadow-lg" : ""
        } ${className}`}
        style={{
          background: isDarkMode
            ? `linear-gradient(135deg, ${BRAND.dark}, #2d3748)`
            : `linear-gradient(135deg, ${BRAND.white}, #f8f9fa)`,
          boxShadow: isSelected
            ? `0 8px 25px rgba(${
                color === "primary" ? "26, 115, 232" : "52, 168, 83"
              }, 0.3)`
            : "0 4px 6px rgba(0, 0, 0, 0.1)",
          border: `1px solid ${
            isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"
          }`,
          ringColor: currentColors.bg,
        }}
        onClick={onClick}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p
              className="text-sm font-medium mb-1"
              style={{ color: isDarkMode ? "#9aa0a6" : "#5f6368" }}
            >
              {title}
            </p>
            <p
              className="text-2xl sm:text-3xl font-bold mb-1"
              style={{ color: isDarkMode ? BRAND.white : currentColors.bg }}
            >
              {value}
            </p>
            {subtitle && (
              <p
                className="text-xs"
                style={{ color: isDarkMode ? "#9aa0a6" : "#5f6368" }}
              >
                {subtitle}
              </p>
            )}
            {trend && (
              <div className="flex items-center mt-2">
                <span
                  className={`text-xs font-medium flex items-center ${
                    trend.direction === "up"
                      ? "text-green-600"
                      : trend.direction === "down"
                      ? "text-red-600"
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
                <span className="text-xs text-gray-500 ml-1">
                  vs last period
                </span>
              </div>
            )}
          </div>
          <div
            className="p-3 rounded-lg"
            style={{
              backgroundColor: isDarkMode
                ? `${currentColors.bg}20`
                : currentColors.light,
            }}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke={currentColors.bg}
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
      </div>
    );
  };

  // Premium Chart Card Component
  const ChartCard = ({ title, children, className = "", actions }) => (
    <div
      className={`rounded-xl p-4 sm:p-6 transition-all duration-300 hover:shadow-lg ${className}`}
      style={{
        background: isDarkMode ? BRAND.dark : BRAND.white,
        border: `1px solid ${
          isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"
        }`,
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3
          className="text-lg font-semibold"
          style={{ color: isDarkMode ? BRAND.white : BRAND.dark }}
        >
          {title}
        </h3>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      {children}
    </div>
  );

  // Custom Tooltip Component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div
          className="p-3 rounded-lg shadow-lg border"
          style={{
            backgroundColor: isDarkMode ? "#374151" : "#ffffff",
            borderColor: isDarkMode ? "#4b5563" : "#e5e7eb",
            color: isDarkMode ? "#ffffff" : "#000000",
          }}
        >
          <p className="font-medium mb-1">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading || !analytics) {
    return (
      <div
        className="p-6 overflow-y-auto min-h-screen"
        style={{ background: isDarkMode ? "#18212f" : "#f6fcf3" }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div
                  className="animate-spin rounded-full h-12 w-12 border-b-2 border-t-2"
                  style={{ borderColor: BRAND.primary }}
                ></div>
                <div
                  className="absolute inset-0 animate-ping rounded-full h-12 w-12 border-2 opacity-20"
                  style={{ borderColor: BRAND.primary }}
                ></div>
              </div>
              <p
                className="text-lg font-medium"
                style={{ color: isDarkMode ? BRAND.white : BRAND.dark }}
              >
                Analyzing Clinical Data...
              </p>
              <p
                className="text-sm"
                style={{ color: isDarkMode ? "#9aa0a6" : "#5f6368" }}
              >
                Processing insights and generating analytics
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="p-4 sm:p-6 overflow-y-auto min-h-screen"
      style={{ background: isDarkMode ? "#18212f" : "#f6fcf3" }}
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div
          className="rounded-xl p-6"
          style={{
            background: isDarkMode
              ? `linear-gradient(135deg, ${BRAND.dark}, #2d3748)`
              : `linear-gradient(135deg, ${BRAND.white}, #f8f9fa)`,
            border: `1px solid ${
              isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"
            }`,
          }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1
                className="text-2xl sm:text-3xl font-bold mb-2"
                style={{ color: isDarkMode ? BRAND.white : BRAND.dark }}
              >
                Clinical Analytics Dashboard
              </h1>
              <p
                className="text-sm sm:text-base"
                style={{ color: isDarkMode ? "#9aa0a6" : "#5f6368" }}
              >
                AI-powered insights and performance metrics for healthcare
                analytics
              </p>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                style={{
                  backgroundColor: isDarkMode ? "#374151" : BRAND.white,
                  borderColor: isDarkMode ? "#4b5563" : "#d1d5db",
                  color: isDarkMode ? BRAND.white : BRAND.dark,
                  focusRingColor: BRAND.primary,
                }}
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="365">Last year</option>
              </select>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <MetricCard
            title="Total Documents"
            value={analytics.totalDocuments}
            subtitle={`${analytics.processedDocuments} processed successfully`}
            icon="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            color="primary"
            onClick={() => setSelectedView("documents")}
            isSelected={selectedView === "documents"}
          />
          <MetricCard
            title="AI Insights Generated"
            value={analytics.totalInsights}
            subtitle={`${analytics.criticalInsights} critical findings`}
            icon="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            color="secondary"
            onClick={() => setSelectedView("insights")}
            isSelected={selectedView === "insights"}
          />
          <MetricCard
            title="Processing Success"
            value={`${analytics.processingSuccess}%`}
            subtitle={`${analytics.averageProcessingTime}min avg time`}
            icon="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            color="accent"
            onClick={() => setSelectedView("performance")}
            isSelected={selectedView === "performance"}
          />
          <MetricCard
            title="Critical Findings"
            value={analytics.criticalInsights}
            subtitle={`${Math.round(
              (analytics.criticalInsights /
                Math.max(analytics.totalInsights, 1)) *
                100
            )}% of total insights`}
            icon="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            color="danger"
            onClick={() => setSelectedView("critical")}
            isSelected={selectedView === "critical"}
          />
        </div>

        {/* Main Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Processing Trends */}
          <ChartCard
            title="Processing Trends (14 Days)"
            className="lg:col-span-2"
          >
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={analytics.processingTrends}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={isDarkMode ? "#374151" : "#e5e7eb"}
                  />
                  <XAxis
                    dataKey="date"
                    stroke={isDarkMode ? "#9ca3af" : "#6b7280"}
                    fontSize={12}
                  />
                  <YAxis
                    stroke={isDarkMode ? "#9ca3af" : "#6b7280"}
                    fontSize={12}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar
                    dataKey="uploaded"
                    name="Uploaded"
                    fill={BRAND.primary}
                    radius={[2, 2, 0, 0]}
                  />
                  <Bar
                    dataKey="processed"
                    name="Processed"
                    fill={BRAND.secondary}
                    radius={[2, 2, 0, 0]}
                  />
                  <Line
                    type="monotone"
                    dataKey="insights"
                    name="Insights"
                    stroke={BRAND.accent}
                    strokeWidth={3}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          {/* Document Types */}
          <ChartCard title="Document Types Distribution">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.documentTypes}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={40}
                    paddingAngle={2}
                  >
                    {analytics.documentTypes.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          {/* Processing Status */}
          <ChartCard title="Processing Status">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  cx="50%"
                  cy="50%"
                  innerRadius="20%"
                  outerRadius="90%"
                  data={analytics.processingStatus}
                >
                  <RadialBar dataKey="value" cornerRadius={10} fill="#8884d8" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        {/* Insights Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Insights by Type */}
          <ChartCard title="Clinical Insights by Type">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.insightsByType} layout="horizontal">
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={isDarkMode ? "#374151" : "#e5e7eb"}
                  />
                  <XAxis
                    type="number"
                    stroke={isDarkMode ? "#9ca3af" : "#6b7280"}
                    fontSize={12}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    stroke={isDarkMode ? "#9ca3af" : "#6b7280"}
                    fontSize={12}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {analytics.insightsByType.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          {/* Insights by Priority */}
          <ChartCard title="Insights by Priority Level">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.insightsByPriority}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    paddingAngle={5}
                  >
                    {analytics.insightsByPriority.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        {/* Patient Activity Analysis */}
        {analytics.patientActivity.length > 0 && (
          <ChartCard
            title="Patient Activity & Risk Analysis"
            className="lg:col-span-2"
          >
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart data={analytics.patientActivity}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={isDarkMode ? "#374151" : "#e5e7eb"}
                  />
                  <XAxis
                    dataKey="documents"
                    name="Documents"
                    stroke={isDarkMode ? "#9ca3af" : "#6b7280"}
                    fontSize={12}
                  />
                  <YAxis
                    dataKey="insights"
                    name="Insights"
                    stroke={isDarkMode ? "#9ca3af" : "#6b7280"}
                    fontSize={12}
                  />
                  <Tooltip
                    cursor={{ strokeDasharray: "3 3" }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div
                            className="p-3 rounded-lg shadow-lg border"
                            style={{
                              backgroundColor: isDarkMode
                                ? "#374151"
                                : "#ffffff",
                              borderColor: isDarkMode ? "#4b5563" : "#e5e7eb",
                              color: isDarkMode ? "#ffffff" : "#000000",
                            }}
                          >
                            <p className="font-medium">{data.fullName}</p>
                            <p className="text-sm">
                              Documents: {data.documents}
                            </p>
                            <p className="text-sm">Insights: {data.insights}</p>
                            <p className="text-sm">
                              Critical: {data.criticalFindings}
                            </p>
                            <p className="text-sm">
                              Risk Score: {data.riskScore}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Scatter dataKey="riskScore" fill={BRAND.primary} />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        )}

        {/* OASIS Scores */}
        {analytics.oasisScores.length > 0 && (
          <ChartCard title="OASIS Assessment Scores">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.oasisScores}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={isDarkMode ? "#374151" : "#e5e7eb"}
                  />
                  <XAxis
                    dataKey="item"
                    stroke={isDarkMode ? "#9ca3af" : "#6b7280"}
                    fontSize={12}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis
                    stroke={isDarkMode ? "#9ca3af" : "#6b7280"}
                    fontSize={12}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div
                            className="p-3 rounded-lg shadow-lg border"
                            style={{
                              backgroundColor: isDarkMode
                                ? "#374151"
                                : "#ffffff",
                              borderColor: isDarkMode ? "#4b5563" : "#e5e7eb",
                              color: isDarkMode ? "#ffffff" : "#000000",
                            }}
                          >
                            <p className="font-medium">{data.description}</p>
                            <p className="text-sm">
                              Average: {data.averageScore}
                            </p>
                            <p className="text-sm">Count: {data.count}</p>
                            <p className="text-sm">
                              Range: {data.minScore} - {data.maxScore}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="averageScore" radius={[4, 4, 0, 0]}>
                    {analytics.oasisScores.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        )}

        {/* Recent Insights Timeline */}
        {analytics.recentInsights.length > 0 && (
          <ChartCard title="Recent Clinical Insights">
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {analytics.recentInsights.map((insight, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg border-l-4 transition-all duration-200 hover:shadow-md"
                  style={{
                    backgroundColor: isDarkMode ? "#374151" : "#f8f9fa",
                    borderLeftColor:
                      insight.priority === "critical"
                        ? BRAND.danger
                        : insight.priority === "high"
                        ? BRAND.orange
                        : insight.priority === "medium"
                        ? BRAND.accent
                        : BRAND.primary,
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className="text-xs px-2 py-1 rounded-full font-medium"
                          style={{
                            backgroundColor:
                              insight.priority === "critical"
                                ? `${BRAND.danger}20`
                                : insight.priority === "high"
                                ? `${BRAND.orange}20`
                                : insight.priority === "medium"
                                ? `${BRAND.accent}20`
                                : `${BRAND.primary}20`,
                            color:
                              insight.priority === "critical"
                                ? BRAND.danger
                                : insight.priority === "high"
                                ? BRAND.orange
                                : insight.priority === "medium"
                                ? BRAND.accent
                                : BRAND.primary,
                          }}
                        >
                          {insight.priority}
                        </span>
                        <span
                          className="text-xs px-2 py-1 rounded-full"
                          style={{
                            backgroundColor: isDarkMode ? "#4b5563" : "#e5e7eb",
                            color: isDarkMode ? "#9ca3af" : "#6b7280",
                          }}
                        >
                          {insight.type}
                        </span>
                      </div>
                      <p
                        className="text-sm mb-2"
                        style={{ color: isDarkMode ? BRAND.white : BRAND.dark }}
                        dangerouslySetInnerHTML={{
                          __html:
                            insight.message?.replace(
                              /\*\*(.*?)\*\*/g,
                              "<strong>$1</strong>"
                            ) || "No details available",
                        }}
                      />
                      <div
                        className="flex items-center gap-4 text-xs"
                        style={{ color: isDarkMode ? "#9aa0a6" : "#5f6368" }}
                      >
                        <span>Patient: {insight.patientName || "Unknown"}</span>
                        <span>•</span>
                        <span>Document: {insight.fileName}</span>
                        <span>•</span>
                        <span>
                          {new Date(insight.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ChartCard>
        )}
      </div>
    </div>
  );
};

export default AnalyticsView;
