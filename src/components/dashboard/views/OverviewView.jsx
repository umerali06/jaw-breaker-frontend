import { useState, useEffect } from "react";
import { usePatientData } from "../../../contexts/PatientDataContext";
import { useTheme } from "../../../contexts/ThemeContext";
import ClinicalInsightsDashboard from "../ClinicalInsightsDashboard";
import FileUploadModal from "../FileUploadModal";
import AddPatientModal from "../AddPatientModal";

// Enhanced Brand color definitions with medical theme
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
};

const OverviewView = ({
  selectedPatient,
  isSoapModalOpen,
  setIsSoapModalOpen,
  soapNote,
  setSoapNote,
  isSoapLoading,
  setIsSoapLoading,
  downloadSoapAsPDF,
  isUploadModalOpen,
  setIsUploadModalOpen,
}) => {
  const { patients, files, loading, fetchFiles } = usePatientData();
  const { isDarkMode } = useTheme();

  const [stats, setStats] = useState({
    totalPatients: 0,
    totalDocuments: 0,
    recentActivity: 0,
    pendingAnalysis: 0,
    criticalFindings: 0,
    completedAnalysis: 0,
    failedAnalysis: 0,
    totalInsights: 0,
    highPriorityInsights: 0,
  });

  const [recentFiles, setRecentFiles] = useState([]);
  const [isAddPatientModalOpen, setIsAddPatientModalOpen] = useState(false);
  const [showFileSelect, setShowFileSelect] = useState(false);
  const [dynamicInsights, setDynamicInsights] = useState([]);
  const [activityData, setActivityData] = useState([]);

  const handleGenerateSOAPClick = (patient) => {
    console.log("handleGenerateSOAPClick called", patient);
    if ((patient.files || []).length === 1) {
      generateSOAPNoteForFile(patient.files[0]._id);
    } else if ((patient.files || []).length > 1) {
      setShowFileSelect(true);
      console.log("Multiple files, showing file select modal");
    } else {
      setSoapNote("No documents available for SOAP note generation.");
      setIsSoapModalOpen(true);
      console.log("No documents for SOAP note");
    }
  };

  const generateSOAPNoteForFile = async (fileId) => {
    console.log("generateSOAPNoteForFile called", fileId);
    setIsSoapLoading(true);
    setSoapNote(null);
    setIsSoapModalOpen(true);
    setShowFileSelect(false);
    try {
      const token = localStorage.getItem("authToken");
      console.log("Token used for SOAP:", token);
      const response = await fetch(`/api/ai/custom/${fileId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ type: "soap" }),
      });
      console.log("SOAP fetch response status:", response.status);
      let data;
      try {
        console.log("About to parse response as JSON");
        data = await response.json();
        console.log("Parsed JSON:", data);
      } catch (jsonErr) {
        console.log("Error parsing JSON from SOAP response:", jsonErr);
        setSoapNote("Error: Invalid response from server (not JSON)");
        setIsSoapLoading(false);
        return;
      }
      if (data.success && data.result) {
        const note =
          typeof data.result === "object"
            ? [
                `SUBJECTIVE:\n${data.result.subjective}`,
                `\n\nOBJECTIVE:\n${data.result.objective}`,
                `\n\nASSESSMENT:\n${data.result.assessment}`,
                `\n\nPLAN:\n${data.result.plan}`,
              ].join("")
            : data.result;
        setSoapNote(note);
      } else {
        setSoapNote("Failed to generate SOAP note.");
      }
    } catch (error) {
      console.log("SOAP fetch error:", error);
      setSoapNote("Error generating SOAP note.");
    } finally {
      setIsSoapLoading(false);
      console.log("SOAP loading set to false");
    }
  };

  // Function to open document
  const openDocument = (file) => {
    alert("Opening document: " + file.originalname);
    // In a real implementation, this would navigate to the file detail page
  };

  // Calculate dynamic statistics and insights from real data
  useEffect(() => {
    // Debug logging to understand data structure
    console.log("=== OVERVIEW DEBUG ===");
    console.log("Total files:", files.length);
    console.log("Files data:", files);
    console.log("Selected patient:", selectedPatient);
    console.log("Patients data:", patients);

    // Log clinical insights specifically
    files.forEach((file, index) => {
      console.log(`File ${index + 1} (${file.originalname}):`, {
        processingStatus: file.processingStatus,
        clinicalInsights: file.clinicalInsights,
        aiSummary: file.aiSummary,
        patientId: file.patientId,
        patientName: file.patientName,
      });
    });

    // Calculate comprehensive statistics from real data
    const completedFiles = files.filter(
      (file) => file.processingStatus === "completed"
    );
    const pendingFiles = files.filter(
      (file) =>
        file.processingStatus === "pending" ||
        file.processingStatus === "processing"
    );
    const failedFiles = files.filter(
      (file) => file.processingStatus === "failed"
    );

    // Get all clinical insights from completed files
    const allInsights = [];
    completedFiles.forEach((file) => {
      if (file.clinicalInsights && Array.isArray(file.clinicalInsights)) {
        file.clinicalInsights.forEach((insight) => {
          allInsights.push({
            ...insight,
            fileName: file.originalname,
            patientName: file.patientName,
            fileId: file._id,
            createdAt: file.createdAt,
          });
        });
      }
    });

    // Count critical findings from insights
    const criticalInsights = allInsights.filter(
      (insight) =>
        insight.priority === "critical" || insight.priority === "high"
    );

    // Calculate recent activity (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const recentActivity = files.filter((file) => {
      const fileDate = new Date(file.createdAt);
      return fileDate > weekAgo;
    }).length;

    // Update stats with real data
    setStats({
      totalPatients: patients.length,
      totalDocuments: files.length,
      recentActivity,
      pendingAnalysis: pendingFiles.length,
      criticalFindings: criticalInsights.length,
      completedAnalysis: completedFiles.length,
      failedAnalysis: failedFiles.length,
      totalInsights: allInsights.length,
      highPriorityInsights: criticalInsights.length,
    });

    // Set dynamic insights (top 10 most recent critical/high priority)
    const sortedInsights = criticalInsights
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10);
    setDynamicInsights(sortedInsights);

    // Set recent files with analysis status
    const sortedFiles = [...files].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
    setRecentFiles(sortedFiles.slice(0, 5));

    // Create activity timeline data
    const activityTimeline = files
      .filter((file) => file.processingCompleted || file.createdAt)
      .map((file) => ({
        id: file._id,
        type:
          file.processingStatus === "completed"
            ? "analysis_completed"
            : "document_uploaded",
        fileName: file.originalname,
        patientName: file.patientName,
        timestamp: file.processingCompleted || file.createdAt,
        status: file.processingStatus,
        insightCount: file.clinicalInsights ? file.clinicalInsights.length : 0,
      }))
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 10);

    setActivityData(activityTimeline);
  }, [patients, files]);

  // Premium StatCard Component with improved design
  const StatCard = ({ title, value, icon, trend, color = "primary" }) => {
    const colors = {
      primary: {
        bg: isDarkMode ? `${BRAND.primary}15` : BRAND.primaryLight,
        text: BRAND.primary,
        iconBg: isDarkMode ? `${BRAND.primary}25` : `${BRAND.primary}15`,
      },
      secondary: {
        bg: isDarkMode ? `${BRAND.secondary}15` : BRAND.secondaryLight,
        text: BRAND.secondary,
        iconBg: isDarkMode ? `${BRAND.secondary}25` : `${BRAND.secondary}15`,
      },
      accent: {
        bg: isDarkMode ? `${BRAND.accent}15` : BRAND.accentLight,
        text: BRAND.accentDark,
        iconBg: isDarkMode ? `${BRAND.accent}25` : `${BRAND.accent}15`,
      },
      danger: {
        bg: isDarkMode ? `${BRAND.danger}15` : BRAND.dangerLight,
        text: BRAND.danger,
        iconBg: isDarkMode ? `${BRAND.danger}25` : `${BRAND.danger}15`,
      },
    };

    const currentColors = colors[color] || colors.primary;

    return (
      <div
        className={`p-3 sm:p-5 rounded-xl transition-all duration-300 hover:shadow-lg flex flex-col h-full`}
        style={{
          backgroundColor: currentColors.bg,
          border: `1px solid ${
            isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"
          }`,
        }}
      >
        <div className="flex items-start justify-between mb-2">
          <div
            className="p-2 sm:p-3 rounded-lg flex-shrink-0"
            style={{ backgroundColor: currentColors.iconBg }}
          >
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              style={{ color: currentColors.text }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={icon}
              />
            </svg>
          </div>
          {trend && (
            <span
              className={`text-xs px-2 py-1 rounded-full flex items-center ${
                trend.value > 0 ? "text-green-600" : "text-red-600"
              }`}
              style={{
                backgroundColor: isDarkMode
                  ? trend.value > 0
                    ? "rgba(52,168,83,0.2)"
                    : "rgba(211,47,47,0.2)"
                  : trend.value > 0
                  ? "rgba(52,168,83,0.1)"
                  : "rgba(211,47,47,0.1)",
              }}
            >
              {trend.value > 0 ? (
                <svg
                  className="w-3 h-3 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 7a1 1 0 01-1 1H9v1h2a1 1 0 110 2H9v1h2a1 1 0 110 2H9v1a1 1 0 11-2 0v-1H5a1 1 0 110-2h2v-1H5a1 1 0 110-2h2V5a1 1 0 112 0v1h2a1 1 0 011 1z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  className="w-3 h-3 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              {Math.abs(trend.value)}%
            </span>
          )}
        </div>
        <div className="mt-2">
          <p
            className="text-xs sm:text-sm font-medium mb-1"
            style={{ color: isDarkMode ? "#9aa0a6" : "#5f6368" }}
          >
            {title}
          </p>
          <p
            className="text-xl sm:text-2xl font-bold mb-1"
            style={{ color: isDarkMode ? BRAND.white : currentColors.text }}
          >
            {value}
          </p>
          {trend && (
            <p
              className="text-xs hidden sm:block"
              style={{ color: isDarkMode ? "#9aa0a6" : "#5f6368" }}
            >
              vs {trend.comparison} last period
            </p>
          )}
        </div>
      </div>
    );
  };

  // Document Status Indicator Component
  const DocumentStatus = ({ status }) => {
    const statusConfig = {
      completed: {
        color: BRAND.secondary,
        label: "Processed",
        icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
      },
      processing: {
        color: BRAND.accent,
        label: "Processing",
        icon: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15",
      },
      pending: {
        color: BRAND.neutral,
        label: "Pending",
        icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
      },
      failed: {
        color: BRAND.danger,
        label: "Failed",
        icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
      },
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <span
        className="text-xs px-2 py-1 rounded-full inline-flex items-center"
        style={{
          backgroundColor: isDarkMode
            ? `${config.color}20`
            : `${config.color}10`,
          color: config.color,
        }}
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
            d={config.icon}
          />
        </svg>
        {config.label}
      </span>
    );
  };

  // Patient Condition Tag Component
  const ConditionTag = ({ condition }) => {
    const conditionColors = {
      stable: BRAND.secondary,
      critical: BRAND.danger,
      improving: BRAND.primary,
      chronic: BRAND.neutral,
    };

    const color = conditionColors[condition] || BRAND.neutral;

    return (
      <span
        className="text-xs px-2 py-1 rounded-full"
        style={{
          backgroundColor: isDarkMode ? `${color}20` : `${color}10`,
          color: color,
        }}
      >
        {condition}
      </span>
    );
  };

  // Copy/export helpers for AI summary and recommendations
  const copySummary = () => {
    const summary = selectedPatient?.aiInsights?.summary || "";
    navigator.clipboard.writeText(summary);
  };
  const exportSummary = () => {
    const summary = selectedPatient?.aiInsights?.summary || "";
    const blob = new Blob([summary], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedPatient?.name || "patient"}-summary.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  const copyRecommendations = () => {
    const recs = (selectedPatient?.aiInsights?.recommendations || []).join(
      "\n"
    );
    navigator.clipboard.writeText(recs);
  };
  const exportRecommendations = () => {
    const recs = selectedPatient?.aiInsights?.recommendations || [];
    const blob = new Blob([JSON.stringify(recs, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedPatient?.name || "patient"}-recommendations.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (selectedPatient) {
    // Debug: Log modal state and add test button
    console.log(
      "Render: isSoapModalOpen",
      isSoapModalOpen,
      "soapNote",
      soapNote
    );
    return (
      <>
        <div
          className="p-3 sm:p-6 overflow-y-auto min-h-screen overflow-x-hidden"
          style={{ background: isDarkMode ? "#18212f" : "#f6fcf3" }}
        >
          <div className="max-w-full w-full px-2 sm:px-4 md:px-6 space-y-4 sm:space-y-6">
            {/* Patient Header - Premium Design */}
            <div
              className={`rounded-lg sm:rounded-xl p-3 sm:p-6 transition-all overflow-hidden`}
              style={{
                background: isDarkMode
                  ? `linear-gradient(135deg, ${BRAND.dark}, #2d3748)`
                  : `linear-gradient(135deg, ${BRAND.white}, #f8f9fa)`,
                boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
                border: `1px solid ${
                  isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"
                }`,
              }}
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="flex items-center gap-2 sm:gap-4">
                  <div
                    className="w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      background: `linear-gradient(135deg, ${BRAND.primary}, ${BRAND.secondary})`,
                    }}
                  >
                    <span className="text-white text-xl sm:text-2xl font-bold">
                      {selectedPatient.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center flex-wrap gap-2 sm:gap-3 mb-0.5 sm:mb-1">
                      <h3
                        className="text-lg sm:text-2xl font-bold truncate"
                        style={{ color: isDarkMode ? BRAND.white : BRAND.dark }}
                      >
                        {selectedPatient.name}
                      </h3>
                      <ConditionTag
                        condition={selectedPatient.condition || "stable"}
                      />
                    </div>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      <p
                        className="text-xs sm:text-sm flex items-center"
                        style={{ color: isDarkMode ? "#9aa0a6" : "#5f6368" }}
                      >
                        <svg
                          className="w-3 h-3 sm:w-4 sm:h-4 mr-0.5 sm:mr-1"
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
                        <span className="truncate">
                          {selectedPatient.age || "--"} yrs •{" "}
                          {selectedPatient.gender || "--"}
                        </span>
                      </p>
                      <p
                        className="text-xs sm:text-sm flex items-center"
                        style={{ color: isDarkMode ? "#9aa0a6" : "#5f6368" }}
                      >
                        <svg
                          className="w-3 h-3 sm:w-4 sm:h-4 mr-0.5 sm:mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                          />
                        </svg>
                        <span className="truncate">
                          {selectedPatient.phone || "--"}
                        </span>
                      </p>
                      <p
                        className="text-xs sm:text-sm flex items-center"
                        style={{ color: isDarkMode ? "#9aa0a6" : "#5f6368" }}
                      >
                        <svg
                          className="w-3 h-3 sm:w-4 sm:h-4 mr-0.5 sm:mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                        <span className="truncate">
                          {selectedPatient.email || "--"}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 sm:gap-3 mt-2 sm:mt-0">
                  <button
                    onClick={() => handleGenerateSOAPClick(selectedPatient)}
                    className={`w-full min-w-0 sm:min-w-[140px] px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium flex items-center justify-center transition-all duration-300 ${
                      isDarkMode ? "" : ""
                    }`}
                    style={{
                      background: BRAND.primary,
                      color: BRAND.white,
                    }}
                  >
                    <svg
                      className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2"
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
                    Generate SOAP Note
                  </button>
                  <button
                    className={`w-full min-w-0 sm:min-w-[140px] px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium flex items-center justify-center transition-all duration-300`}
                    style={{
                      background: isDarkMode ? "#2d3748" : "#f1f3f4",
                      color: isDarkMode ? BRAND.white : BRAND.dark,
                    }}
                    onClick={() => setIsUploadModalOpen(true)}
                  >
                    <svg
                      className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    New Document
                  </button>
                </div>
              </div>
            </div>

            {/* Dynamic Patient Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <StatCard
                title="Documents"
                value={selectedPatient?.files?.length || 0}
                icon="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                color="primary"
              />
              <StatCard
                title="AI Insights"
                value={(selectedPatient?.files || []).reduce(
                  (total, file) =>
                    total +
                    (file.clinicalInsights ? file.clinicalInsights.length : 0),
                  0
                )}
                icon="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                color="secondary"
              />
              <StatCard
                title="Critical Findings"
                value={(selectedPatient?.files || []).reduce((total, file) => {
                  if (!file.clinicalInsights) return total;
                  return (
                    total +
                    file.clinicalInsights.filter(
                      (insight) =>
                        insight.priority === "critical" ||
                        insight.priority === "high"
                    ).length
                  );
                }, 0)}
                icon="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                color="danger"
              />
              <StatCard
                title="Analysis Status"
                value={`${
                  (selectedPatient?.files || []).filter(
                    (f) => f.processingStatus === "completed"
                  ).length
                }/${selectedPatient?.files?.length || 0}`}
                icon="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                color="accent"
              />
            </div>

            {/* Dynamic Insights Panel */}
            {(() => {
              const hasInsights = (selectedPatient?.files || []).some(
                (file) =>
                  file.clinicalInsights && file.clinicalInsights.length > 0
              );
              console.log("=== PATIENT INSIGHTS DEBUG ===");
              console.log("Selected patient files:", selectedPatient?.files);
              console.log("Has insights:", hasInsights);
              (selectedPatient?.files || []).forEach((file, index) => {
                console.log(`Patient file ${index + 1}:`, {
                  name: file.originalname,
                  clinicalInsights: file.clinicalInsights,
                  insightCount: file.clinicalInsights
                    ? file.clinicalInsights.length
                    : 0,
                });
              });
              return hasInsights;
            })() && (
              <div
                className="rounded-xl p-3 sm:p-6 transition-all duration-300"
                style={{
                  background: isDarkMode ? BRAND.dark : BRAND.white,
                  border: `1px solid ${
                    isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"
                  }`,
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h4
                    className="text-base sm:text-lg font-semibold flex items-center"
                    style={{ color: isDarkMode ? BRAND.white : BRAND.dark }}
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
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      />
                    </svg>
                    Clinical Insights
                  </h4>
                  <span
                    className="text-xs px-2 py-1 rounded-full"
                    style={{
                      background: isDarkMode ? "#2d3748" : "#f1f3f4",
                      color: isDarkMode ? "#9aa0a6" : "#5f6368",
                    }}
                  >
                    {(selectedPatient?.files || []).reduce(
                      (total, file) =>
                        total +
                        (file.clinicalInsights
                          ? file.clinicalInsights.length
                          : 0),
                      0
                    )}{" "}
                    insights
                  </span>
                </div>

                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {(selectedPatient?.files || [])
                    .flatMap((file) =>
                      (file.clinicalInsights || []).map((insight) => ({
                        ...insight,
                        fileName: file.originalname,
                        fileId: file._id,
                      }))
                    )
                    .sort((a, b) => {
                      const priorityOrder = {
                        critical: 4,
                        high: 3,
                        medium: 2,
                        low: 1,
                      };
                      return (
                        (priorityOrder[b.priority] || 0) -
                        (priorityOrder[a.priority] || 0)
                      );
                    })
                    .slice(0, 8)
                    .map((insight, index) => (
                      <div
                        key={`${insight.fileId}-${index}`}
                        className="p-3 rounded-lg transition-all duration-200"
                        style={{
                          background: isDarkMode ? "#2d3748" : "#f8f9fa",
                          border: `1px solid ${
                            isDarkMode
                              ? "rgba(255,255,255,0.1)"
                              : "rgba(0,0,0,0.05)"
                          }`,
                        }}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-xs px-2 py-1 rounded-full font-medium ${
                                insight.priority === "critical"
                                  ? "text-red-600"
                                  : insight.priority === "high"
                                  ? "text-orange-600"
                                  : insight.priority === "medium"
                                  ? "text-yellow-600"
                                  : "text-blue-600"
                              }`}
                              style={{
                                backgroundColor: isDarkMode
                                  ? insight.priority === "critical"
                                    ? "rgba(211,47,47,0.2)"
                                    : insight.priority === "high"
                                    ? "rgba(255,152,0,0.2)"
                                    : insight.priority === "medium"
                                    ? "rgba(255,193,7,0.2)"
                                    : "rgba(33,150,243,0.2)"
                                  : insight.priority === "critical"
                                  ? "rgba(211,47,47,0.1)"
                                  : insight.priority === "high"
                                  ? "rgba(255,152,0,0.1)"
                                  : insight.priority === "medium"
                                  ? "rgba(255,193,7,0.1)"
                                  : "rgba(33,150,243,0.1)",
                              }}
                            >
                              {insight.priority}
                            </span>
                            <span
                              className="text-xs px-2 py-1 rounded-full"
                              style={{
                                background: isDarkMode ? "#374151" : "#e5e7eb",
                                color: isDarkMode ? "#9ca3af" : "#6b7280",
                              }}
                            >
                              {insight.type}
                            </span>
                          </div>
                        </div>
                        <p
                          className="text-sm mb-2"
                          style={{
                            color: isDarkMode ? BRAND.white : BRAND.dark,
                          }}
                          dangerouslySetInnerHTML={{
                            __html:
                              insight.message?.replace(
                                /\*\*(.*?)\*\*/g,
                                "<strong>$1</strong>"
                              ) || "No details available",
                          }}
                        />
                        {insight.evidence && (
                          <p
                            className="text-xs"
                            style={{
                              color: isDarkMode ? "#9aa0a6" : "#5f6368",
                            }}
                          >
                            Evidence: {insight.evidence}
                          </p>
                        )}
                        <p
                          className="text-xs mt-1"
                          style={{ color: isDarkMode ? "#9aa0a6" : "#5f6368" }}
                        >
                          From: {insight.fileName}
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Patient Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Documents Card */}
              <div className="lg:col-span-2">
                <div
                  className={`rounded-xl p-3 sm:p-6 h-full transition-all duration-300`}
                  style={{
                    background: isDarkMode ? BRAND.dark : BRAND.white,
                    border: `1px solid ${
                      isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"
                    }`,
                  }}
                >
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <h4
                      className="text-base sm:text-lg font-semibold"
                      style={{ color: isDarkMode ? BRAND.white : BRAND.dark }}
                    >
                      Patient Documents
                    </h4>
                    <div className="flex items-center gap-1 sm:gap-2">
                      <span
                        className="text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full"
                        style={{
                          background: isDarkMode ? "#2d3748" : "#f1f3f4",
                          color: isDarkMode ? "#9aa0a6" : "#5f6368",
                        }}
                      >
                        {selectedPatient?.files?.length || 0} items
                      </span>
                      <button
                        className="text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full flex items-center"
                        style={{
                          background: isDarkMode ? "#2d3748" : "#f1f3f4",
                          color: isDarkMode ? "#9aa0a6" : "#5f6368",
                        }}
                      >
                        <svg
                          className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                        New
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {selectedPatient?.files?.length > 0 ? (
                      (selectedPatient?.files || []).map((file) => (
                        <div
                          key={file._id}
                          className={`flex items-center justify-between p-2 sm:p-3 rounded-lg transition-all duration-200 cursor-pointer`}
                          style={{
                            background: isDarkMode ? "#2d3748" : "#f8f9fa",
                            border: `1px solid ${
                              isDarkMode
                                ? "rgba(255,255,255,0.1)"
                                : "rgba(0,0,0,0.05)"
                            }`,
                          }}
                          onClick={() => openDocument(file)}
                        >
                          <div className="flex items-center min-w-0 flex-1">
                            <div className="mr-2 sm:mr-3 flex-shrink-0">
                              {file.type === "pdf" ? (
                                <svg
                                  className="w-4 h-4 sm:w-5 sm:h-5"
                                  fill="#d32f2f"
                                  viewBox="0 0 24 24"
                                >
                                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM6 4h7v5h5v11H6V4zm4.5 12v-1h-3v1h3zm0-3v-1h-3v1h3zm0-3v-1h-3v1h3zm3 6v-1h-3v1h3zm0-3v-1h-3v1h3zm0-3v-1h-3v1h3z" />
                                </svg>
                              ) : file.type === "image" ? (
                                <svg
                                  className="w-4 h-4 sm:w-5 sm:h-5"
                                  fill="#1a73e8"
                                  viewBox="0 0 24 24"
                                >
                                  <path d="M8.5 13.5l2.5 3 3.5-4.5 4.5 6H5m16 1V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2z" />
                                </svg>
                              ) : (
                                <svg
                                  className="w-4 h-4 sm:w-5 sm:h-5"
                                  fill="#5f6368"
                                  viewBox="0 0 24 24"
                                >
                                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM6 4h7v5h5v11H6V4zm4.5 12v-1h-3v1h3zm0-3v-1h-3v1h3zm0-3v-1h-3v1h3zm3 6v-1h-3v1h3zm0-3v-1h-3v1h3zm0-3v-1h-3v1h3z" />
                                </svg>
                              )}
                            </div>
                            <div className="truncate flex-1">
                              <p
                                className="text-xs sm:text-sm font-medium truncate"
                                style={{
                                  color: isDarkMode ? BRAND.white : BRAND.dark,
                                }}
                              >
                                {file.originalname}
                              </p>
                              <div className="flex items-center gap-1 sm:gap-2">
                                <p
                                  className="text-[10px] sm:text-xs"
                                  style={{
                                    color: isDarkMode ? "#9aa0a6" : "#5f6368",
                                  }}
                                >
                                  {new Date(
                                    file.createdAt
                                  ).toLocaleDateString()}
                                </p>
                                <span className="text-[10px] sm:text-xs hidden sm:inline">
                                  •
                                </span>
                                <p
                                  className="text-[10px] sm:text-xs hidden sm:inline"
                                  style={{
                                    color: isDarkMode ? "#9aa0a6" : "#5f6368",
                                  }}
                                >
                                  {file.type || "Document"}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="ml-2 sm:ml-4 flex-shrink-0">
                            <DocumentStatus status={file.processingStatus} />
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <svg
                          className="w-12 h-12 mx-auto mb-4"
                          fill="none"
                          stroke={isDarkMode ? "#2d3748" : "#dadce0"}
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        <p
                          className="mb-1"
                          style={{ color: isDarkMode ? "#9aa0a6" : "#5f6368" }}
                        >
                          No documents uploaded yet
                        </p>
                        <button
                          className="text-sm px-4 py-2 rounded-lg mt-2 inline-flex items-center"
                          style={{
                            background: BRAND.primary,
                            color: BRAND.white,
                          }}
                          onClick={() => setIsUploadModalOpen(true)}
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
                              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                            />
                          </svg>
                          Upload First Document
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Patient Summary */}
              <div>
                <div
                  className={`rounded-xl p-6 h-full transition-all duration-300`}
                  style={{
                    background: isDarkMode ? BRAND.dark : BRAND.white,
                    border: `1px solid ${
                      isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"
                    }`,
                  }}
                >
                  <h4
                    className="text-lg font-semibold mb-4"
                    style={{ color: isDarkMode ? BRAND.white : BRAND.dark }}
                  >
                    Patient Summary
                  </h4>

                  <div className="space-y-4">
                    {/* Demographics */}
                    <div>
                      <h5
                        className="text-sm font-medium mb-2 flex items-center"
                        style={{ color: isDarkMode ? "#9aa0a6" : "#5f6368" }}
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
                        Demographics
                      </h5>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p
                            style={{
                              color: isDarkMode ? "#9aa0a6" : "#5f6368",
                            }}
                          >
                            Age
                          </p>
                          <p
                            style={{
                              color: isDarkMode ? BRAND.white : BRAND.dark,
                            }}
                          >
                            {selectedPatient.age || "--"} years
                          </p>
                        </div>
                        <div>
                          <p
                            style={{
                              color: isDarkMode ? "#9aa0a6" : "#5f6368",
                            }}
                          >
                            Gender
                          </p>
                          <p
                            style={{
                              color: isDarkMode ? BRAND.white : BRAND.dark,
                            }}
                          >
                            {selectedPatient.gender || "--"}
                          </p>
                        </div>
                        <div>
                          <p
                            style={{
                              color: isDarkMode ? "#9aa0a6" : "#5f6368",
                            }}
                          >
                            Height
                          </p>
                          <p
                            style={{
                              color: isDarkMode ? BRAND.white : BRAND.dark,
                            }}
                          >
                            {selectedPatient.height || "--"} cm
                          </p>
                        </div>
                        <div>
                          <p
                            style={{
                              color: isDarkMode ? "#9aa0a6" : "#5f6368",
                            }}
                          >
                            Weight
                          </p>
                          <p
                            style={{
                              color: isDarkMode ? BRAND.white : BRAND.dark,
                            }}
                          >
                            {selectedPatient.weight || "--"} kg
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Conditions */}
                    <div>
                      <h5
                        className="text-sm font-medium mb-2 flex items-center"
                        style={{ color: isDarkMode ? "#9aa0a6" : "#5f6368" }}
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
                            d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                          />
                        </svg>
                        Conditions
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        {selectedPatient.conditions?.length > 0 ? (
                          selectedPatient.conditions.map((condition, index) => (
                            <span
                              key={index}
                              className="text-xs px-2 py-1 rounded-full"
                              style={{
                                background: isDarkMode
                                  ? `${BRAND.secondary}20`
                                  : `${BRAND.secondary}10`,
                                color: BRAND.secondary,
                              }}
                            >
                              {condition}
                            </span>
                          ))
                        ) : (
                          <p
                            className="text-sm"
                            style={{
                              color: isDarkMode ? "#9aa0a6" : "#5f6368",
                            }}
                          >
                            No conditions recorded
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Medications */}
                    <div>
                      <h5
                        className="text-sm font-medium mb-2 flex items-center"
                        style={{ color: isDarkMode ? "#9aa0a6" : "#5f6368" }}
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
                            d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
                          />
                        </svg>
                        Medications
                      </h5>
                      <div className="space-y-2">
                        {selectedPatient.medications?.length > 0 ? (
                          selectedPatient.medications.map((med, index) => (
                            <div key={index} className="flex items-start">
                              <div
                                className="p-1 rounded mr-2 flex-shrink-0"
                                style={{
                                  background: isDarkMode
                                    ? `${BRAND.primary}20`
                                    : `${BRAND.primary}10`,
                                }}
                              >
                                <svg
                                  className="w-3 h-3"
                                  fill="none"
                                  stroke={BRAND.primary}
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 12h14M12 5l7 7-7 7"
                                  />
                                </svg>
                              </div>
                              <div>
                                <p
                                  style={{
                                    color: isDarkMode
                                      ? BRAND.white
                                      : BRAND.dark,
                                  }}
                                  className="text-sm"
                                >
                                  {med.name}
                                </p>
                                <p
                                  style={{
                                    color: isDarkMode ? "#9aa0a6" : "#5f6368",
                                  }}
                                  className="text-xs"
                                >
                                  {med.dosage} • {med.frequency}
                                </p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p
                            className="text-sm"
                            style={{
                              color: isDarkMode ? "#9aa0a6" : "#5f6368",
                            }}
                          >
                            No medications recorded
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Insights and Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* AI Insights */}
              <div className="lg:col-span-2">
                <div
                  className={`rounded-xl p-6 transition-all duration-300`}
                  style={{
                    background: isDarkMode ? BRAND.dark : BRAND.white,
                    border: `1px solid ${
                      isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"
                    }`,
                  }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h4
                      className="text-lg font-semibold"
                      style={{ color: isDarkMode ? BRAND.white : BRAND.dark }}
                    >
                      AI Clinical Insights
                    </h4>
                    <span
                      className="text-xs px-2 py-1 rounded-full flex items-center"
                      style={{
                        background: isDarkMode ? "#2d3748" : "#f1f3f4",
                        color: isDarkMode ? "#9aa0a6" : "#5f6368",
                      }}
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
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                      {(() => {
                        const latestFile = (selectedPatient?.files || [])
                          .filter((f) => f.processingCompleted)
                          .sort(
                            (a, b) =>
                              new Date(b.processingCompleted) -
                              new Date(a.processingCompleted)
                          )[0];

                        if (latestFile) {
                          const timeDiff =
                            Date.now() -
                            new Date(latestFile.processingCompleted).getTime();
                          const minutes = Math.floor(timeDiff / (1000 * 60));
                          const hours = Math.floor(minutes / 60);
                          const days = Math.floor(hours / 24);

                          if (days > 0) return `Updated ${days}d ago`;
                          if (hours > 0) return `Updated ${hours}h ago`;
                          if (minutes > 0) return `Updated ${minutes}m ago`;
                          return "Updated just now";
                        }

                        return "No recent updates";
                      })()}
                    </span>
                  </div>

                  <div className="space-y-4">
                    {/* Clinical Summary */}
                    <div
                      className="p-3 sm:p-4 rounded-lg overflow-hidden"
                      style={{
                        background: isDarkMode
                          ? `${BRAND.primary}10`
                          : `${BRAND.primary}05`,
                        border: `1px solid ${
                          isDarkMode
                            ? `${BRAND.primary}20`
                            : `${BRAND.primary}10`
                        }`,
                      }}
                    >
                      <div className="flex items-start">
                        <div
                          className="p-2 rounded-lg mr-3 flex-shrink-0"
                          style={{
                            background: isDarkMode
                              ? `${BRAND.primary}20`
                              : `${BRAND.primary}10`,
                          }}
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke={BRAND.primary}
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                            <h5
                              className="font-bold flex flex-wrap items-center"
                              style={{ color: BRAND.primary }}
                            >
                              <span className="mr-2">Clinical Summary</span>
                              <span
                                className="mr-2 text-[10px] sm:text-xs px-1.5 py-0.5 rounded-full flex items-center"
                                style={{
                                  background: isDarkMode
                                    ? `${BRAND.primary}20`
                                    : `${BRAND.primary}10`,
                                  color: BRAND.primary,
                                }}
                                title="This summary is generated by AI based on the patient's recent documentation."
                              >
                                AI Generated
                                <svg
                                  className="inline ml-1 w-2.5 h-2.5 sm:w-3 sm:h-3 text-gray-400"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <circle
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    strokeWidth="2"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M12 16v-4m0-4h.01"
                                  />
                                </svg>
                              </span>
                            </h5>
                            <div className="flex flex-wrap gap-2">
                              <button
                                className="px-2 py-1 rounded bg-[#2596be] text-white text-[10px] sm:text-xs font-bold hover:bg-[#1d7a9c]"
                                onClick={copySummary}
                                title="Copy summary to clipboard"
                              >
                                Copy
                              </button>
                              <button
                                className="px-2 py-1 rounded bg-[#96be25] text-white text-[10px] sm:text-xs font-bold hover:bg-[#7a9c1d]"
                                onClick={exportSummary}
                                title="Export summary as text"
                              >
                                Export
                              </button>
                            </div>
                          </div>
                          <p
                            className="text-xs sm:text-sm break-words"
                            style={{
                              color: isDarkMode ? "#cbd5e1" : "#475569",
                            }}
                          >
                            {(() => {
                              // Get the most recent file with AI summary
                              const filesWithSummary = (
                                selectedPatient?.files || []
                              )
                                .filter((file) => file.aiSummary)
                                .sort(
                                  (a, b) =>
                                    new Date(b.createdAt) -
                                    new Date(a.createdAt)
                                );

                              if (filesWithSummary.length > 0) {
                                return filesWithSummary[0].aiSummary;
                              }

                              // If no AI summary, generate one from clinical insights
                              const allInsights = (selectedPatient?.files || [])
                                .flatMap((file) => file.clinicalInsights || [])
                                .filter((insight) => insight.message);

                              if (allInsights.length > 0) {
                                const criticalInsights = allInsights.filter(
                                  (i) =>
                                    i.priority === "critical" ||
                                    i.priority === "high"
                                );
                                const summaryInsights =
                                  criticalInsights.length > 0
                                    ? criticalInsights.slice(0, 3)
                                    : allInsights.slice(0, 3);
                                return `Clinical analysis reveals: ${summaryInsights
                                  .map((i) =>
                                    i.message.replace(/\*\*(.*?)\*\*/g, "$1")
                                  )
                                  .join(". ")}.`;
                              }

                              return `Patient ${selectedPatient.name} has ${
                                selectedPatient?.files?.length || 0
                              } document(s) uploaded. ${
                                (selectedPatient?.files || []).filter(
                                  (f) => f.processingStatus === "completed"
                                ).length > 0
                                  ? "Analysis completed for recent documents."
                                  : "Analysis pending for uploaded documents."
                              }`;
                            })()}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Recommendations */}
                    <div
                      className="p-3 sm:p-4 rounded-lg overflow-hidden"
                      style={{
                        background: isDarkMode
                          ? `${BRAND.secondary}10`
                          : `${BRAND.secondary}05`,
                        border: `1px solid ${
                          isDarkMode
                            ? `${BRAND.secondary}20`
                            : `${BRAND.secondary}10`
                        }`,
                      }}
                    >
                      <div className="flex items-start">
                        <div
                          className="p-2 rounded-lg mr-3 flex-shrink-0"
                          style={{
                            background: isDarkMode
                              ? `${BRAND.secondary}20`
                              : `${BRAND.secondary}10`,
                          }}
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke={BRAND.secondary}
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                            />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                            <h5
                              className="font-bold flex flex-wrap items-center"
                              style={{ color: BRAND.secondary }}
                            >
                              <span className="mr-2">
                                Clinical Recommendations
                              </span>
                              <span
                                className="mr-2 text-[10px] sm:text-xs px-1.5 py-0.5 rounded-full flex items-center"
                                style={{
                                  background: isDarkMode
                                    ? `${BRAND.secondary}20`
                                    : `${BRAND.secondary}10`,
                                  color: BRAND.secondary,
                                }}
                                title="These recommendations are generated by AI based on the patient's clinical data."
                              >
                                AI Generated
                                <svg
                                  className="inline ml-1 w-2.5 h-2.5 sm:w-3 sm:h-3 text-gray-400"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <circle
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    strokeWidth="2"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M12 16v-4m0-4h.01"
                                  />
                                </svg>
                              </span>
                            </h5>
                            <div className="flex flex-wrap gap-2">
                              <button
                                className="px-2 py-1 rounded bg-[#2596be] text-white text-[10px] sm:text-xs font-bold hover:bg-[#1d7a9c]"
                                onClick={copyRecommendations}
                                title="Copy recommendations to clipboard"
                              >
                                Copy
                              </button>
                              <button
                                className="px-2 py-1 rounded bg-[#96be25] text-white text-[10px] sm:text-xs font-bold hover:bg-[#7a9c1d]"
                                onClick={exportRecommendations}
                                title="Export recommendations as JSON"
                              >
                                Export
                              </button>
                            </div>
                          </div>
                          <ul
                            className="text-xs sm:text-sm space-y-2 break-words"
                            style={{
                              color: isDarkMode ? "#cbd5e1" : "#475569",
                            }}
                          >
                            {(() => {
                              // Get recommendations from clinical insights
                              const allInsights = (selectedPatient?.files || [])
                                .flatMap((file) => file.clinicalInsights || [])
                                .filter(
                                  (insight) =>
                                    insight.type === "recommendation" ||
                                    insight.recommendation
                                );

                              if (allInsights.length > 0) {
                                return allInsights
                                  .slice(0, 5)
                                  .map(
                                    (insight) =>
                                      insight.recommendation ||
                                      insight.message.replace(
                                        /\*\*(.*?)\*\*/g,
                                        "$1"
                                      )
                                  );
                              }

                              // Get care goals from files
                              const careGoals = (selectedPatient?.files || [])
                                .flatMap((file) => file.careGoals || [])
                                .slice(0, 5);

                              if (careGoals.length > 0) {
                                return careGoals;
                              }

                              // Get interventions from files
                              const interventions = (
                                selectedPatient?.files || []
                              )
                                .flatMap((file) => file.interventions || [])
                                .slice(0, 5);

                              if (interventions.length > 0) {
                                return interventions;
                              }

                              // Default recommendations based on patient data
                              const recommendations = [];
                              if ((selectedPatient?.files || []).length > 0) {
                                recommendations.push(
                                  "Review recent documentation for care plan updates"
                                );
                                recommendations.push(
                                  "Continue monitoring patient progress"
                                );

                                const completedAnalysis = (
                                  selectedPatient?.files || []
                                ).filter(
                                  (f) => f.processingStatus === "completed"
                                ).length;
                                if (completedAnalysis > 0) {
                                  recommendations.push(
                                    "Follow up on AI-generated clinical insights"
                                  );
                                }

                                const pendingAnalysis = (
                                  selectedPatient?.files || []
                                ).filter(
                                  (f) =>
                                    f.processingStatus === "pending" ||
                                    f.processingStatus === "processing"
                                ).length;
                                if (pendingAnalysis > 0) {
                                  recommendations.push(
                                    `Complete analysis for ${pendingAnalysis} pending document(s)`
                                  );
                                }

                                recommendations.push(
                                  "Schedule next appointment as appropriate"
                                );
                              } else {
                                recommendations.push(
                                  "Upload patient documentation for AI analysis"
                                );
                                recommendations.push(
                                  "Complete initial patient assessment"
                                );
                                recommendations.push(
                                  "Establish baseline care plan"
                                );
                              }

                              return recommendations;
                            })().map((rec, i) => (
                              <li key={i} className="flex items-start">
                                <span
                                  className="mr-2 flex-shrink-0"
                                  style={{ color: BRAND.secondary }}
                                >
                                  •
                                </span>
                                <span>{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Critical Findings */}
                    {(selectedPatient?.files || []).some(
                      (file) =>
                        file.clinicalInsights &&
                        file.clinicalInsights.some(
                          (insight) =>
                            insight.priority === "critical" ||
                            insight.priority === "high"
                        )
                    ) && (
                      <div
                        className="p-4 rounded-lg"
                        style={{
                          background: isDarkMode
                            ? `${BRAND.danger}10`
                            : `${BRAND.danger}05`,
                          border: `1px solid ${
                            isDarkMode
                              ? `${BRAND.danger}20`
                              : `${BRAND.danger}10`
                          }`,
                        }}
                      >
                        <div className="flex items-start">
                          <div
                            className="p-2 rounded-lg mr-3 flex-shrink-0"
                            style={{
                              background: isDarkMode
                                ? `${BRAND.danger}20`
                                : `${BRAND.danger}10`,
                            }}
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke={BRAND.danger}
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                              />
                            </svg>
                          </div>
                          <div>
                            <h5
                              className="font-bold mb-1"
                              style={{ color: BRAND.danger }}
                            >
                              Critical Findings
                            </h5>
                            <ul
                              className="text-sm space-y-2"
                              style={{
                                color: isDarkMode ? "#cbd5e1" : "#475569",
                              }}
                            >
                              {(selectedPatient?.files || [])
                                .flatMap((file) =>
                                  (file.clinicalInsights || [])
                                    .filter(
                                      (insight) =>
                                        insight.priority === "critical" ||
                                        insight.priority === "high"
                                    )
                                    .map((insight) => ({
                                      ...insight,
                                      fileName: file.originalname,
                                    }))
                                )
                                .slice(0, 5)
                                .map((insight, i) => (
                                  <li key={i} className="flex items-start">
                                    <span
                                      className="mr-2"
                                      style={{ color: BRAND.danger }}
                                    >
                                      •
                                    </span>
                                    <span>
                                      <strong>{insight.fileName}</strong>:{" "}
                                      {insight.message?.replace(
                                        /\*\*(.*?)\*\*/g,
                                        "$1"
                                      ) || "Critical finding detected"}
                                      {insight.evidence && (
                                        <span
                                          className="text-xs block mt-1"
                                          style={{
                                            color: isDarkMode
                                              ? "#9aa0a6"
                                              : "#5f6368",
                                          }}
                                        >
                                          Evidence: {insight.evidence}
                                        </span>
                                      )}
                                    </span>
                                  </li>
                                ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div>
                <div
                  className={`rounded-xl p-6 transition-all duration-300`}
                  style={{
                    background: isDarkMode ? BRAND.dark : BRAND.white,
                    border: `1px solid ${
                      isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"
                    }`,
                  }}
                >
                  <h4
                    className="text-lg font-semibold mb-4"
                    style={{ color: isDarkMode ? BRAND.white : BRAND.dark }}
                  >
                    Quick Actions
                  </h4>

                  <div className="space-y-3">
                    <button
                      className={`w-full p-3 rounded-lg text-left flex items-center transition-all duration-200`}
                      style={{
                        background: isDarkMode ? "#2d3748" : "#f8f9fa",
                        border: `1px solid ${
                          isDarkMode
                            ? "rgba(255,255,255,0.1)"
                            : "rgba(0,0,0,0.05)"
                        }`,
                      }}
                    >
                      <div
                        className="p-2 rounded-lg mr-3 flex-shrink-0"
                        style={{
                          background: `${BRAND.primary}10`,
                        }}
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke={BRAND.primary}
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                          />
                        </svg>
                      </div>
                      <div>
                        <p
                          className="font-medium"
                          style={{
                            color: isDarkMode ? BRAND.white : BRAND.dark,
                          }}
                        >
                          Upload New Document
                        </p>
                        <p
                          className="text-xs"
                          style={{ color: isDarkMode ? "#9aa0a6" : "#5f6368" }}
                        >
                          Lab results, imaging, or clinical notes
                        </p>
                      </div>
                    </button>

                    <button
                      className={`w-full p-3 rounded-lg text-left flex items-center transition-all duration-200`}
                      style={{
                        background: isDarkMode ? "#2d3748" : "#f8f9fa",
                        border: `1px solid ${
                          isDarkMode
                            ? "rgba(255,255,255,0.1)"
                            : "rgba(0,0,0,0.05)"
                        }`,
                      }}
                      onClick={() => handleGenerateSOAPClick(selectedPatient)}
                    >
                      <div
                        className="p-2 rounded-lg mr-3 flex-shrink-0"
                        style={{
                          background: `${BRAND.secondary}10`,
                        }}
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke={BRAND.secondary}
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
                      <div>
                        <p
                          className="font-medium"
                          style={{
                            color: isDarkMode ? BRAND.white : BRAND.dark,
                          }}
                        >
                          Generate SOAP Note
                        </p>
                        <p
                          className="text-xs"
                          style={{ color: isDarkMode ? "#9aa0a6" : "#5f6368" }}
                        >
                          Structured clinical documentation
                        </p>
                      </div>
                    </button>

                    <button
                      className={`w-full p-3 rounded-lg text-left flex items-center transition-all duration-200`}
                      style={{
                        background: isDarkMode ? "#2d3748" : "#f8f9fa",
                        border: `1px solid ${
                          isDarkMode
                            ? "rgba(255,255,255,0.1)"
                            : "rgba(0,0,0,0.05)"
                        }`,
                      }}
                    >
                      <div
                        className="p-2 rounded-lg mr-3 flex-shrink-0"
                        style={{
                          background: `${BRAND.accent}10`,
                        }}
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke={BRAND.accentDark}
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2m-4-4H9a2 2 0 00-2 2v4a2 2 0 002 2h2a2 2 0 002-2v-4a2 2 0 00-2-2z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p
                          className="font-medium"
                          style={{
                            color: isDarkMode ? BRAND.white : BRAND.dark,
                          }}
                        >
                          Order Lab Tests
                        </p>
                        <p
                          className="text-xs"
                          style={{ color: isDarkMode ? "#9aa0a6" : "#5f6368" }}
                        >
                          Blood work, imaging, or other diagnostics
                        </p>
                      </div>
                    </button>

                    <button
                      className={`w-full p-3 rounded-lg text-left flex items-center transition-all duration-200`}
                      style={{
                        background: isDarkMode ? "#2d3748" : "#f8f9fa",
                        border: `1px solid ${
                          isDarkMode
                            ? "rgba(255,255,255,0.1)"
                            : "rgba(0,0,0,0.05)"
                        }`,
                      }}
                    >
                      <div
                        className="p-2 rounded-lg mr-3 flex-shrink-0"
                        style={{
                          background: `${BRAND.primary}10`,
                        }}
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke={BRAND.primary}
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
                          />
                        </svg>
                      </div>
                      <div>
                        <p
                          className="font-medium"
                          style={{
                            color: isDarkMode ? BRAND.white : BRAND.dark,
                          }}
                        >
                          Prescribe Medication
                        </p>
                        <p
                          className="text-xs"
                          style={{ color: isDarkMode ? "#9aa0a6" : "#5f6368" }}
                        >
                          New or refill prescriptions
                        </p>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Clinical Insights Dashboard */}
        <div
          className={`rounded-xl p-3 sm:p-6 transition-all duration-300 overflow-hidden`}
          style={{
            background: isDarkMode ? BRAND.dark : BRAND.white,
            border: `1px solid ${
              isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"
            }`,
          }}
        >
          <div className="w-full overflow-x-hidden">
            <ClinicalInsightsDashboard files={files} />
          </div>
        </div>
      </>
    );
  }

  // System Overview View (when no patient is selected)
  return (
    <div
      className="p-3 sm:p-6 overflow-y-auto min-h-screen overflow-x-hidden"
      style={{ background: isDarkMode ? "#18212f" : "#f6fcf3" }}
    >
      <div className="max-w-full w-full px-2 sm:px-4 md:px-6 space-y-4 sm:space-y-6">
        {/* System Header */}
        <div
          className="rounded-lg sm:rounded-xl p-3 sm:p-6 transition-all overflow-hidden"
          style={{
            background: isDarkMode
              ? `linear-gradient(135deg, ${BRAND.dark}, #2d3748)`
              : `linear-gradient(135deg, ${BRAND.white}, #f8f9fa)`,
            boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
            border: `1px solid ${
              isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"
            }`,
          }}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-2 sm:gap-4">
              <div
                className="w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  background: `linear-gradient(135deg, ${BRAND.primary}, ${BRAND.secondary})`,
                }}
              >
                <svg
                  className="w-6 h-6 sm:w-8 sm:h-8 text-white"
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
              </div>
              <div className="min-w-0">
                <h3
                  className="text-lg sm:text-2xl font-bold truncate"
                  style={{ color: isDarkMode ? BRAND.white : BRAND.dark }}
                >
                  System Overview
                </h3>
                <p
                  className="text-xs sm:text-sm"
                  style={{ color: isDarkMode ? "#9aa0a6" : "#5f6368" }}
                >
                  Real-time analytics and insights across all patients
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <button
                className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium flex items-center justify-center transition-all duration-300"
                style={{
                  background: BRAND.primary,
                  color: BRAND.white,
                }}
                onClick={() => setIsAddPatientModalOpen(true)}
              >
                <svg
                  className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Add Patient
              </button>
              <button
                className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium flex items-center justify-center transition-all duration-300"
                style={{
                  background: isDarkMode ? "#2d3748" : "#f1f3f4",
                  color: isDarkMode ? BRAND.white : BRAND.dark,
                }}
                onClick={() => setIsUploadModalOpen(true)}
              >
                <svg
                  className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                Upload Document
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic System Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <StatCard
            title="Total Patients"
            value={stats.totalPatients}
            icon="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            color="primary"
          />
          <StatCard
            title="Total Documents"
            value={stats.totalDocuments}
            icon="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            color="secondary"
          />
          <StatCard
            title="AI Insights Generated"
            value={stats.totalInsights}
            icon="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            color="accent"
          />
          <StatCard
            title="Critical Findings"
            value={stats.criticalFindings}
            icon="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            color="danger"
          />
        </div>

        {/* Analysis Status Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <StatCard
            title="Completed Analysis"
            value={stats.completedAnalysis}
            icon="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            color="secondary"
          />
          <StatCard
            title="Pending Analysis"
            value={stats.pendingAnalysis}
            icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            color="accent"
          />
          <StatCard
            title="Recent Activity (7d)"
            value={stats.recentActivity}
            icon="M13 10V3L4 14h7v7l9-11h-7z"
            color="primary"
          />
        </div>

        {/* Dynamic Insights Dashboard */}
        {dynamicInsights.length > 0 && (
          <div
            className="rounded-xl p-3 sm:p-6 transition-all duration-300"
            style={{
              background: isDarkMode ? BRAND.dark : BRAND.white,
              border: `1px solid ${
                isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"
              }`,
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h4
                className="text-base sm:text-lg font-semibold flex items-center"
                style={{ color: isDarkMode ? BRAND.white : BRAND.dark }}
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
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                Critical & High Priority Insights
              </h4>
              <span
                className="text-xs px-2 py-1 rounded-full"
                style={{
                  background: isDarkMode ? "#2d3748" : "#f1f3f4",
                  color: isDarkMode ? "#9aa0a6" : "#5f6368",
                }}
              >
                {dynamicInsights.length} insights
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
              {dynamicInsights.map((insight, index) => (
                <div
                  key={`${insight.fileId}-${index}`}
                  className="p-3 rounded-lg transition-all duration-200"
                  style={{
                    background: isDarkMode ? "#2d3748" : "#f8f9fa",
                    border: `1px solid ${
                      isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"
                    }`,
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${
                          insight.priority === "critical"
                            ? "text-red-600"
                            : insight.priority === "high"
                            ? "text-orange-600"
                            : "text-yellow-600"
                        }`}
                        style={{
                          backgroundColor: isDarkMode
                            ? insight.priority === "critical"
                              ? "rgba(211,47,47,0.2)"
                              : insight.priority === "high"
                              ? "rgba(255,152,0,0.2)"
                              : "rgba(255,193,7,0.2)"
                            : insight.priority === "critical"
                            ? "rgba(211,47,47,0.1)"
                            : insight.priority === "high"
                            ? "rgba(255,152,0,0.1)"
                            : "rgba(255,193,7,0.1)",
                        }}
                      >
                        {insight.priority}
                      </span>
                      <span
                        className="text-xs px-2 py-1 rounded-full"
                        style={{
                          background: isDarkMode ? "#374151" : "#e5e7eb",
                          color: isDarkMode ? "#9ca3af" : "#6b7280",
                        }}
                      >
                        {insight.type}
                      </span>
                    </div>
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
                  <div className="flex flex-col gap-1">
                    <p
                      className="text-xs"
                      style={{ color: isDarkMode ? "#9aa0a6" : "#5f6368" }}
                    >
                      Patient: {insight.patientName || "Unknown"}
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: isDarkMode ? "#9aa0a6" : "#5f6368" }}
                    >
                      Document: {insight.fileName}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Activity Feed */}
        {activityData.length > 0 && (
          <div
            className="rounded-xl p-3 sm:p-6 transition-all duration-300"
            style={{
              background: isDarkMode ? BRAND.dark : BRAND.white,
              border: `1px solid ${
                isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"
              }`,
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h4
                className="text-base sm:text-lg font-semibold flex items-center"
                style={{ color: isDarkMode ? BRAND.white : BRAND.dark }}
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
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                Recent Activity
              </h4>
              <span
                className="text-xs px-2 py-1 rounded-full"
                style={{
                  background: isDarkMode ? "#2d3748" : "#f1f3f4",
                  color: isDarkMode ? "#9aa0a6" : "#5f6368",
                }}
              >
                Last 10 activities
              </span>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto">
              {activityData.map((activity, index) => (
                <div
                  key={activity.id}
                  className="flex items-center gap-3 p-3 rounded-lg transition-all duration-200"
                  style={{
                    background: isDarkMode ? "#2d3748" : "#f8f9fa",
                    border: `1px solid ${
                      isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"
                    }`,
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      background:
                        activity.type === "analysis_completed"
                          ? `${BRAND.secondary}20`
                          : `${BRAND.primary}20`,
                    }}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke={
                        activity.type === "analysis_completed"
                          ? BRAND.secondary
                          : BRAND.primary
                      }
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d={
                          activity.type === "analysis_completed"
                            ? "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            : "M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        }
                      />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm font-medium truncate"
                      style={{ color: isDarkMode ? BRAND.white : BRAND.dark }}
                    >
                      {activity.type === "analysis_completed"
                        ? `Analysis completed for ${activity.fileName}`
                        : `Document uploaded: ${activity.fileName}`}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <p
                        className="text-xs"
                        style={{ color: isDarkMode ? "#9aa0a6" : "#5f6368" }}
                      >
                        Patient: {activity.patientName || "Unknown"}
                      </p>
                      {activity.insightCount > 0 && (
                        <>
                          <span className="text-xs">•</span>
                          <p
                            className="text-xs"
                            style={{
                              color: isDarkMode ? "#9aa0a6" : "#5f6368",
                            }}
                          >
                            {activity.insightCount} insights generated
                          </p>
                        </>
                      )}
                    </div>
                    <p
                      className="text-xs mt-1"
                      style={{ color: isDarkMode ? "#9aa0a6" : "#5f6368" }}
                    >
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <DocumentStatus status={activity.status} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {stats.totalPatients === 0 && (
          <div
            className="rounded-xl p-8 text-center transition-all duration-300"
            style={{
              background: isDarkMode ? BRAND.dark : BRAND.white,
              border: `1px solid ${
                isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"
              }`,
            }}
          >
            <svg
              className="w-16 h-16 mx-auto mb-4"
              fill="none"
              stroke={isDarkMode ? "#2d3748" : "#dadce0"}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <h3
              className="text-lg font-semibold mb-2"
              style={{ color: isDarkMode ? BRAND.white : BRAND.dark }}
            >
              Welcome to Your Healthcare Analytics Dashboard
            </h3>
            <p
              className="text-sm mb-4"
              style={{ color: isDarkMode ? "#9aa0a6" : "#5f6368" }}
            >
              Start by adding your first patient and uploading their medical
              documents to see AI-powered insights and analytics.
            </p>
            <button
              className="px-6 py-3 rounded-lg font-medium inline-flex items-center transition-all duration-300"
              style={{
                background: BRAND.primary,
                color: BRAND.white,
              }}
              onClick={() => setIsAddPatientModalOpen(true)}
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add Your First Patient
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      {isAddPatientModalOpen && (
        <AddPatientModal
          isOpen={isAddPatientModalOpen}
          onClose={() => setIsAddPatientModalOpen(false)}
        />
      )}
    </div>
  );
  return (
    <>
      <div
        className="p-3 sm:p-6 overflow-y-auto overflow-x-hidden min-h-screen"
        style={{ background: isDarkMode ? "#18212f" : "#f6fcf3" }}
      >
        <div className="max-w-full w-full px-2 sm:px-4 md:px-6 space-y-4 sm:space-y-6">
          {/* Welcome Header */}
          <div
            className={`rounded-lg sm:rounded-xl p-3 sm:p-6 transition-all overflow-hidden`}
            style={{
              background: isDarkMode
                ? `linear-gradient(135deg, ${BRAND.dark}, #2d3748)`
                : `linear-gradient(135deg, ${BRAND.white}, #f8f9fa)`,
              boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
              border: `1px solid ${
                isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"
              }`,
            }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3
                  className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2"
                  style={{ color: isDarkMode ? BRAND.white : BRAND.dark }}
                >
                  Welcome to JAWBREAKER
                </h3>
                <p
                  className="text-sm sm:text-lg"
                  style={{ color: isDarkMode ? "#9aa0a6" : "#5f6368" }}
                >
                  Your AI-powered clinical documentation assistant
                </p>
              </div>
              <div className="flex flex-wrap gap-2 sm:gap-3 mt-2 sm:mt-0">
                <button
                  className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-300 flex items-center justify-center flex-1 sm:flex-none`}
                  style={{
                    background: BRAND.primary,
                    color: BRAND.white,
                  }}
                  onClick={() => setIsAddPatientModalOpen(true)}
                >
                  <svg
                    className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  New Patient
                </button>
                <button
                  className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-300 flex items-center justify-center flex-1 sm:flex-none`}
                  style={{
                    background: isDarkMode ? "#2d3748" : "#f1f3f4",
                    color: isDarkMode ? BRAND.white : BRAND.dark,
                  }}
                  onClick={() => setIsUploadModalOpen(true)}
                >
                  <svg
                    className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  Upload
                </button>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            <StatCard
              title="Total Patients"
              value={stats.totalPatients}
              icon="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              color="primary"
              trend={{ value: 8, label: "increase", comparison: "142" }}
            />
            <StatCard
              title="Documents"
              value={stats.totalDocuments}
              icon="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              color="secondary"
              trend={{ value: 15, label: "increase", comparison: "892" }}
            />
            <StatCard
              title="Recent Activity"
              value={stats.recentActivity}
              icon="M13 10V3L4 14h7v7l9-11h-7z"
              color="accent"
            />
            <StatCard
              title="Critical Findings"
              value={stats.criticalFindings}
              icon="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              color="danger"
            />
          </div>

          {/* Recent Activity Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-6">
            {/* Recent Documents */}
            <div className="lg:col-span-2">
              <div
                className={`rounded-lg sm:rounded-xl p-3 sm:p-6 transition-all duration-300 overflow-hidden`}
                style={{
                  background: isDarkMode ? BRAND.dark : BRAND.white,
                  border: `1px solid ${
                    isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"
                  }`,
                }}
              >
                <div className="flex items-center justify-between mb-2 sm:mb-4">
                  <h4
                    className="text-base sm:text-lg font-semibold"
                    style={{ color: isDarkMode ? BRAND.white : BRAND.dark }}
                  >
                    Recent Documents
                  </h4>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-xs px-2 py-1 rounded-full"
                      style={{
                        background: isDarkMode ? "#2d3748" : "#f1f3f4",
                        color: isDarkMode ? "#9aa0a6" : "#5f6368",
                      }}
                    >
                      {recentFiles.length} items
                    </span>
                    <button
                      className="text-xs px-2 py-1 rounded-full flex items-center"
                      style={{
                        background: isDarkMode ? "#2d3748" : "#f1f3f4",
                        color: isDarkMode ? "#9aa0a6" : "#5f6368",
                      }}
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
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      New
                    </button>
                  </div>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div
                      className="animate-spin rounded-full h-8 w-8 border-b-2"
                      style={{ borderBottomColor: BRAND.primary }}
                    ></div>
                  </div>
                ) : recentFiles.length === 0 ? (
                  <div className="text-center py-8">
                    <svg
                      className="w-12 h-12 mx-auto mb-4"
                      fill="none"
                      stroke={isDarkMode ? "#2d3748" : "#dadce0"}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <p
                      className="mb-1"
                      style={{ color: isDarkMode ? "#9aa0a6" : "#5f6368" }}
                    >
                      No documents uploaded yet
                    </p>
                    <button
                      className="text-sm px-4 py-2 rounded-lg mt-2 inline-flex items-center"
                      style={{
                        background: BRAND.primary,
                        color: BRAND.white,
                      }}
                      onClick={() => setIsUploadModalOpen(true)}
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
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      Upload First Document
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentFiles.map((file) => (
                      <div
                        key={file._id}
                        className={`flex items-center justify-between p-3 rounded-lg transition-all duration-200 cursor-pointer`}
                        style={{
                          background: isDarkMode ? "#2d3748" : "#f8f9fa",
                          border: `1px solid ${
                            isDarkMode
                              ? "rgba(255,255,255,0.1)"
                              : "rgba(0,0,0,0.05)"
                          }`,
                        }}
                        onClick={() => openDocument(file)}
                      >
                        <div className="flex items-center min-w-0 flex-1">
                          <div className="mr-3 flex-shrink-0">
                            {file.type === "pdf" ? (
                              <svg
                                className="w-5 h-5"
                                fill="#d32f2f"
                                viewBox="0 0 24 24"
                              >
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM6 4h7v5h5v11H6V4zm4.5 12v-1h-3v1h3zm0-3v-1h-3v1h3zm0-3v-1h-3v1h3zm3 6v-1h-3v1h3zm0-3v-1h-3v1h3zm0-3v-1h-3v1h3z" />
                              </svg>
                            ) : file.type === "image" ? (
                              <svg
                                className="w-5 h-5"
                                fill="#1a73e8"
                                viewBox="0 0 24 24"
                              >
                                <path d="M8.5 13.5l2.5 3 3.5-4.5 4.5 6H5m16 1V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2z" />
                              </svg>
                            ) : (
                              <svg
                                className="w-5 h-5"
                                fill="#5f6368"
                                viewBox="0 0 24 24"
                              >
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM6 4h7v5h5v11H6V4zm4.5 12v-1h-3v1h3zm0-3v-1h-3v1h3zm0-3v-1h-3v1h3zm3 6v-1h-3v1h3zm0-3v-1h-3v1h3zm0-3v-1h-3v1h3z" />
                              </svg>
                            )}
                          </div>
                          <div className="truncate flex-1">
                            <p
                              className="text-sm font-medium truncate"
                              style={{
                                color: isDarkMode ? BRAND.white : BRAND.dark,
                              }}
                            >
                              {file.originalname}
                            </p>
                            <div className="flex items-center gap-2">
                              <p
                                className="text-xs"
                                style={{
                                  color: isDarkMode ? "#9aa0a6" : "#5f6368",
                                }}
                              >
                                {new Date(file.createdAt).toLocaleDateString()}
                              </p>
                              <span className="text-xs">•</span>
                              <p
                                className="text-xs"
                                style={{
                                  color: isDarkMode ? "#9aa0a6" : "#5f6368",
                                }}
                              >
                                {file.type || "Document"}
                              </p>
                              <span className="text-xs">•</span>
                              <p
                                className="text-xs"
                                style={{
                                  color: isDarkMode ? "#9aa0a6" : "#5f6368",
                                }}
                              >
                                {file.patientName || "No patient"}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="ml-4 flex-shrink-0">
                          <DocumentStatus status={file.processingStatus} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div>
              <div
                className={`rounded-xl p-6 transition-all duration-300`}
                style={{
                  background: isDarkMode ? BRAND.dark : BRAND.white,
                  border: `1px solid ${
                    isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"
                  }`,
                }}
              >
                <h4
                  className="text-lg font-semibold mb-4"
                  style={{ color: isDarkMode ? BRAND.white : BRAND.dark }}
                >
                  Quick Actions
                </h4>

                <div className="space-y-3">
                  <button
                    onClick={() => setIsAddPatientModalOpen(true)}
                    className={`w-full p-2 sm:p-3 rounded-lg text-left flex items-center transition-all duration-200 hover:shadow-md`}
                    style={{
                      background: isDarkMode ? "#2d3748" : "#f8f9fa",
                      border: `1px solid ${
                        isDarkMode
                          ? "rgba(255,255,255,0.1)"
                          : "rgba(0,0,0,0.05)"
                      }`,
                    }}
                  >
                    <div
                      className="p-1.5 sm:p-2 rounded-lg mr-2 sm:mr-3 flex-shrink-0"
                      style={{
                        background: `${BRAND.primary}10`,
                      }}
                    >
                      <svg
                        className="w-4 h-4 sm:w-5 sm:h-5"
                        fill="none"
                        stroke={BRAND.primary}
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                    </div>
                    <div>
                      <p
                        className="text-sm sm:text-base font-medium"
                        style={{ color: isDarkMode ? BRAND.white : BRAND.dark }}
                      >
                        Add New Patient
                      </p>
                      <p
                        className="text-xs hidden sm:block"
                        style={{ color: isDarkMode ? "#9aa0a6" : "#5f6368" }}
                      >
                        Create a new patient record
                      </p>
                    </div>
                  </button>

                  <button
                    onClick={() => setIsUploadModalOpen(true)}
                    className={`w-full p-3 rounded-lg text-left flex items-center transition-all duration-200 hover:shadow-md`}
                    style={{
                      background: isDarkMode ? "#2d3748" : "#f8f9fa",
                      border: `1px solid ${
                        isDarkMode
                          ? "rgba(255,255,255,0.1)"
                          : "rgba(0,0,0,0.05)"
                      }`,
                    }}
                  >
                    <div
                      className="p-2 rounded-lg mr-3 flex-shrink-0"
                      style={{
                        background: `${BRAND.secondary}10`,
                      }}
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke={BRAND.secondary}
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                    </div>
                    <div>
                      <p
                        className="font-medium"
                        style={{ color: isDarkMode ? BRAND.white : BRAND.dark }}
                      >
                        Upload Documents
                      </p>
                      <p
                        className="text-xs"
                        style={{ color: isDarkMode ? "#9aa0a6" : "#5f6368" }}
                      >
                        Clinical notes, lab results, etc.
                      </p>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      // Process documents logic - for now just show an alert
                      alert("Processing documents with AI...");
                      // In a real implementation, this would trigger document processing
                    }}
                    className={`w-full p-3 rounded-lg text-left flex items-center transition-all duration-200 hover:shadow-md`}
                    style={{
                      background: isDarkMode ? "#2d3748" : "#f8f9fa",
                      border: `1px solid ${
                        isDarkMode
                          ? "rgba(255,255,255,0.1)"
                          : "rgba(0,0,0,0.05)"
                      }`,
                    }}
                  >
                    <div
                      className="p-2 rounded-lg mr-3 flex-shrink-0"
                      style={{
                        background: `${BRAND.accent}10`,
                      }}
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke={BRAND.accentDark}
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2m-4-4H9a2 2 0 00-2 2v4a2 2 0 002 2h2a2 2 0 002-2v-4a2 2 0 00-2-2z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p
                        className="font-medium"
                        style={{ color: isDarkMode ? BRAND.white : BRAND.dark }}
                      >
                        Process Documents
                      </p>
                      <p
                        className="text-xs"
                        style={{ color: isDarkMode ? "#9aa0a6" : "#5f6368" }}
                      >
                        Extract clinical data with AI
                      </p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Clinical Insights Dashboard */}
          <div
            className={`rounded-xl p-3 sm:p-6 transition-all duration-300 overflow-hidden`}
            style={{
              background: isDarkMode ? BRAND.dark : BRAND.white,
              border: `1px solid ${
                isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"
              }`,
            }}
          >
            <div className="w-full overflow-x-hidden">
              <ClinicalInsightsDashboard files={files} />
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {isUploadModalOpen && (
        <FileUploadModal
          selectedPatient={selectedPatient}
          onClose={() => setIsUploadModalOpen(false)}
          onUploadSuccess={() => {
            setIsUploadModalOpen(false);
            fetchFiles();
          }}
        />
      )}

      {isAddPatientModalOpen && (
        <AddPatientModal
          onClose={() => setIsAddPatientModalOpen(false)}
          onSuccess={() => {
            setIsAddPatientModalOpen(false);
            fetchFiles();
          }}
        />
      )}

      {/* SOAP Note Preview Modal */}
      {isSoapModalOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center p-3 sm:p-0"
          style={{ zIndex: 99999, background: "rgba(0,0,0,0.4)" }}
        >
          <div
            className="rounded-lg sm:rounded-xl shadow-lg sm:shadow-xl max-w-2xl w-full p-3 sm:p-6 relative"
            style={{ border: "4px solid red", background: "white" }}
          >
            <button
              onClick={() => setIsSoapModalOpen(false)}
              className="absolute top-2 sm:top-3 right-2 sm:right-3 text-gray-500 hover:text-gray-900"
            >
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">
              SOAP Note Preview
            </h2>
            {isSoapLoading ? (
              <div className="text-center py-6 sm:py-8">
                Generating SOAP note...
              </div>
            ) : (
              <>
                <pre className="bg-gray-100 rounded p-3 sm:p-4 max-h-96 overflow-y-auto whitespace-pre-wrap text-xs sm:text-sm mb-3 sm:mb-4 break-words">
                  {soapNote}
                </pre>
                <button
                  onClick={downloadSoapAsPDF}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 rounded text-xs sm:text-sm bg-[#2596be] text-white font-bold hover:bg-[#1d7a9c]"
                >
                  Download as PDF
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* File selection modal for SOAP note generation */}
      {showFileSelect && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-3 sm:p-0">
          <div className="bg-white rounded-lg sm:rounded-xl shadow-lg sm:shadow-xl max-w-lg w-full p-3 sm:p-6 relative">
            <button
              onClick={() => setShowFileSelect(false)}
              className="absolute top-2 sm:top-3 right-2 sm:right-3 text-gray-500 hover:text-gray-900"
            >
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">
              Select Document for SOAP Note
            </h2>
            <ul className="space-y-3">
              {(selectedPatient.files || []).map((file) => (
                <li
                  key={file._id}
                  className="flex items-center justify-between p-2 sm:p-3 rounded border border-gray-200 hover:bg-gray-50"
                >
                  <span className="text-xs sm:text-sm truncate mr-2">
                    {file.originalname}
                  </span>
                  <button
                    className="px-2 sm:px-3 py-1 rounded bg-[#2596be] text-white text-[10px] sm:text-xs font-bold hover:bg-[#1d7a9c] whitespace-nowrap"
                    onClick={() => generateSOAPNoteForFile(file._id)}
                  >
                    Generate SOAP
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
};

export default OverviewView;
