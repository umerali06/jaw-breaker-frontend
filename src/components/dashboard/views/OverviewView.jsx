import { useState, useEffect } from "react";
import { usePatientData } from "../../../contexts/PatientDataContext";
import { useTheme } from "../../../contexts/ThemeContext";
import ClinicalInsightsDashboard from "../ClinicalInsightsDashboard";

const OverviewView = ({ selectedPatient }) => {
  const { patients, files, loading } = usePatientData();
  const { isDarkMode } = useTheme();
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalDocuments: 0,
    recentActivity: 0,
    pendingAnalysis: 0,
  });

  useEffect(() => {
    // Calculate statistics
    const totalPatients = patients.length;
    const totalDocuments = files.length;
    const recentActivity = files.filter((file) => {
      const fileDate = new Date(file.createdAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return fileDate > weekAgo;
    }).length;
    const pendingAnalysis = files.filter(
      (file) =>
        file.processingStatus === "pending" ||
        file.processingStatus === "processing"
    ).length;

    setStats({
      totalPatients,
      totalDocuments,
      recentActivity,
      pendingAnalysis,
    });
  }, [patients, files]);

  const recentFiles = files
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  const generateSOAPNote = async (patient) => {
    try {
      const token = localStorage.getItem("authToken");
      // Find the most recent file for this patient
      const recentFile = patient.files.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      )[0];

      if (!recentFile) {
        alert("No documents found for this patient");
        return;
      }

      const response = await fetch(`/api/ai/custom/${recentFile._id}`, {
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
        alert("SOAP note generated successfully!");
        // You might want to show the SOAP note in a modal or navigate to it
      } else {
        alert("Failed to generate SOAP note");
      }
    } catch (error) {
      console.error("Error generating SOAP note:", error);
      alert("Error generating SOAP note");
    }
  };

  const StatCard = ({ title, value, icon, color = "blue" }) => (
    <div
      className={`${
        isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
      } rounded-lg border p-6`}
    >
      <div className="flex items-center">
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
        <div className="ml-4">
          <p
            className={`text-sm font-medium ${
              isDarkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            {title}
          </p>
          <p
            className={`text-2xl font-bold ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            {value}
          </p>
        </div>
      </div>
    </div>
  );

  if (selectedPatient) {
    return (
      <div className="p-6 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {/* Patient Header */}
          <div
            className={`${
              isDarkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            } rounded-lg border p-6 mb-6`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3
                  className={`text-xl font-bold ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {selectedPatient.name}
                </h3>
                <p
                  className={`${
                    isDarkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  Patient ID: {selectedPatient.id}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    selectedPatient.status === "active"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {selectedPatient.status}
                </span>
                <button
                  onClick={() => generateSOAPNote(selectedPatient)}
                  className="bg-primary-custom text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-opacity-90"
                >
                  Generate SOAP Note
                </button>
              </div>
            </div>
          </div>

          {/* Patient Documents */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div
              className={`${
                isDarkMode
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-200"
              } rounded-lg border p-6`}
            >
              <h4
                className={`text-lg font-semibold ${
                  isDarkMode ? "text-white" : "text-gray-900"
                } mb-4`}
              >
                Recent Documents
              </h4>
              <div className="space-y-3">
                {selectedPatient.files.map((file) => (
                  <div
                    key={file._id}
                    className={`flex items-center justify-between p-3 ${
                      isDarkMode ? "bg-gray-700" : "bg-gray-50"
                    } rounded-lg`}
                  >
                    <div className="flex items-center">
                      <svg
                        className="w-5 h-5 text-gray-400 mr-3"
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
                      <div>
                        <p
                          className={`text-sm font-medium ${
                            isDarkMode ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {file.originalname}
                        </p>
                        <p
                          className={`text-xs ${
                            isDarkMode ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          {new Date(file.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        file.processingStatus === "completed"
                          ? "bg-green-100 text-green-800"
                          : file.processingStatus === "processing"
                          ? "bg-blue-100 text-blue-800"
                          : file.processingStatus === "failed"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {file.processingStatus}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div
              className={`${
                isDarkMode
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-200"
              } rounded-lg border p-6`}
            >
              <h4
                className={`text-lg font-semibold ${
                  isDarkMode ? "text-white" : "text-gray-900"
                } mb-4`}
              >
                AI Insights
              </h4>
              <div className="space-y-4">
                <div
                  className={`p-4 rounded-lg ${
                    isDarkMode ? "bg-blue-900 bg-opacity-30" : "bg-blue-50"
                  }`}
                >
                  <h5
                    className={`font-medium mb-2 ${
                      isDarkMode ? "text-blue-200" : "text-blue-900"
                    }`}
                  >
                    Clinical Summary
                  </h5>
                  <p
                    className={`text-sm ${
                      isDarkMode ? "text-blue-300" : "text-blue-800"
                    }`}
                  >
                    Based on recent documentation, patient shows stable vital
                    signs with ongoing management of chronic conditions.
                  </p>
                </div>
                <div
                  className={`p-4 rounded-lg ${
                    isDarkMode ? "bg-yellow-900 bg-opacity-30" : "bg-yellow-50"
                  }`}
                >
                  <h5
                    className={`font-medium mb-2 ${
                      isDarkMode ? "text-yellow-200" : "text-yellow-900"
                    }`}
                  >
                    Recommendations
                  </h5>
                  <ul
                    className={`text-sm space-y-1 ${
                      isDarkMode ? "text-yellow-300" : "text-yellow-800"
                    }`}
                  >
                    <li>• Continue current medication regimen</li>
                    <li>• Schedule follow-up in 2 weeks</li>
                    <li>• Monitor blood pressure trends</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Section */}
        <div className="mb-8">
          <h3
            className={`text-2xl font-bold ${
              isDarkMode ? "text-white" : "text-gray-900"
            } mb-2`}
          >
            Welcome to Jawbreaker
          </h3>
          <p className={`${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
            Your AI-powered clinical documentation assistant. Upload patient
            documents to get started with intelligent analysis and OASIS
            scoring.
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Patients"
            value={stats.totalPatients}
            icon="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
            color="blue"
          />
          <StatCard
            title="Documents"
            value={stats.totalDocuments}
            icon="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            color="green"
          />
          <StatCard
            title="Recent Activity"
            value={stats.recentActivity}
            icon="M13 10V3L4 14h7v7l9-11h-7z"
            color="yellow"
          />
          <StatCard
            title="Pending Analysis"
            value={stats.pendingAnalysis}
            icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            color="red"
          />
        </div>

        {/* Clinical Insights Dashboard */}
        <div className="mb-8">
          <ClinicalInsightsDashboard files={files} />
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div
            className={`${
              isDarkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            } rounded-lg border p-6`}
          >
            <h4
              className={`text-lg font-semibold ${
                isDarkMode ? "text-white" : "text-gray-900"
              } mb-4`}
            >
              Recent Documents
            </h4>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-custom"></div>
              </div>
            ) : recentFiles.length === 0 ? (
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
                <p
                  className={`${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  No documents uploaded yet
                </p>
                <p
                  className={`text-sm ${
                    isDarkMode ? "text-gray-500" : "text-gray-400"
                  } mt-1`}
                >
                  Upload your first patient document to get started
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentFiles.map((file) => (
                  <div
                    key={file._id}
                    className={`flex items-center justify-between p-3 ${
                      isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"
                    } rounded-lg transition-colors`}
                  >
                    <div className="flex items-center">
                      <svg
                        className="w-5 h-5 text-gray-400 mr-3"
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
                      <div>
                        <p
                          className={`text-sm font-medium ${
                            isDarkMode ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {file.originalname}
                        </p>
                        <p
                          className={`text-xs ${
                            isDarkMode ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          {new Date(file.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        file.processingStatus === "completed"
                          ? "bg-green-100 text-green-800"
                          : file.processingStatus === "processing"
                          ? "bg-blue-100 text-blue-800"
                          : file.processingStatus === "failed"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {file.processingStatus}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div
            className={`${
              isDarkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            } rounded-lg border p-6`}
          >
            <h4
              className={`text-lg font-semibold ${
                isDarkMode ? "text-white" : "text-gray-900"
              } mb-4`}
            >
              Quick Actions
            </h4>
            <div className="space-y-3">
              <button
                className={`w-full flex items-center p-4 text-left ${
                  isDarkMode
                    ? "bg-blue-900 hover:bg-blue-800"
                    : "bg-blue-50 hover:bg-blue-100"
                } rounded-lg transition-colors`}
              >
                <svg
                  className="w-6 h-6 text-blue-600 mr-3"
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
                <div>
                  <p
                    className={`font-medium ${
                      isDarkMode ? "text-blue-200" : "text-blue-900"
                    }`}
                  >
                    Upload Document
                  </p>
                  <p
                    className={`text-sm ${
                      isDarkMode ? "text-blue-300" : "text-blue-700"
                    }`}
                  >
                    Add new patient documentation
                  </p>
                </div>
              </button>

              <button
                className={`w-full flex items-center p-4 text-left ${
                  isDarkMode
                    ? "bg-green-900 hover:bg-green-800"
                    : "bg-green-50 hover:bg-green-100"
                } rounded-lg transition-colors`}
              >
                <svg
                  className="w-6 h-6 text-green-600 mr-3"
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
                <div>
                  <p
                    className={`font-medium ${
                      isDarkMode ? "text-green-200" : "text-green-900"
                    }`}
                  >
                    Generate SOAP Note
                  </p>
                  <p
                    className={`text-sm ${
                      isDarkMode ? "text-green-300" : "text-green-700"
                    }`}
                  >
                    Create structured documentation
                  </p>
                </div>
              </button>

              <button
                className={`w-full flex items-center p-4 text-left ${
                  isDarkMode
                    ? "bg-purple-900 hover:bg-purple-800"
                    : "bg-purple-50 hover:bg-purple-100"
                } rounded-lg transition-colors`}
              >
                <svg
                  className="w-6 h-6 text-purple-600 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                <div>
                  <p
                    className={`font-medium ${
                      isDarkMode ? "text-purple-200" : "text-purple-900"
                    }`}
                  >
                    Ask AI Assistant
                  </p>
                  <p
                    className={`text-sm ${
                      isDarkMode ? "text-purple-300" : "text-purple-700"
                    }`}
                  >
                    Get clinical insights and recommendations
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewView;
