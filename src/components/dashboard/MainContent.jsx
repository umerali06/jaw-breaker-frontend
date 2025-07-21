import { useState } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import OverviewView from "./views/OverviewView";
import PatientsView from "./views/PatientsView";
import DocumentsView from "./views/DocumentsView";
import AnalyticsView from "./views/AnalyticsView";

const MainContent = ({
  activeView,
  selectedPatient,
  onChatToggle,
  isChatOpen,
  onPatientSelect,
  onSidebarToggle,
  isSidebarCollapsed,
}) => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [viewMode, setViewMode] = useState("grid");

  const toggleViewMode = () => {
    setViewMode(viewMode === "grid" ? "list" : "grid");
  };

  const renderView = () => {
    switch (activeView) {
      case "overview":
        return <OverviewView selectedPatient={selectedPatient} />;
      case "patients":
        return (
          <PatientsView
            selectedPatient={selectedPatient}
            onPatientSelect={onPatientSelect}
          />
        );
      case "documents":
        return (
          <DocumentsView
            selectedPatient={selectedPatient}
            viewMode={viewMode}
          />
        );
      case "analytics":
        return <AnalyticsView selectedPatient={selectedPatient} />;
      default:
        return <OverviewView selectedPatient={selectedPatient} />;
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div
        className={`${
          isDarkMode
            ? "bg-gray-800 border-gray-700 text-white"
            : "bg-white border-gray-200"
        } border-b px-6 py-4`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {/* Sidebar Toggle Button */}
            <button
              onClick={onSidebarToggle}
              className={`mr-4 p-2 rounded-lg transition-colors ${
                isDarkMode
                  ? "text-gray-400 hover:text-gray-300 hover:bg-gray-700"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              }`}
              title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isSidebarCollapsed ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 5l7 7-7 7M5 5l7 7-7 7"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                  />
                )}
              </svg>
            </button>

            <div>
              <h2
                className={`text-2xl font-bold ${
                  isDarkMode ? "text-white" : "text-gray-900"
                } capitalize`}
              >
                {activeView}
              </h2>
              {selectedPatient && (
                <p
                  className={`text-sm ${
                    isDarkMode ? "text-gray-300" : "text-gray-600"
                  } mt-1`}
                >
                  {selectedPatient.name} • {selectedPatient.files.length}{" "}
                  documents
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* AI Chat Toggle */}
            <button
              onClick={onChatToggle}
              className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isChatOpen
                  ? "bg-primary-custom text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
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
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              AI Assistant
            </button>

            {/* Quick Actions */}
            <div className="flex items-center space-x-2">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                title={
                  isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"
                }
              >
                {isDarkMode ? (
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
                      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                ) : (
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
                      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                    />
                  </svg>
                )}
              </button>

              {/* View Mode Toggle (only show on documents and patients view) */}
              {(activeView === "documents" || activeView === "patients") && (
                <button
                  onClick={toggleViewMode}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  title={
                    viewMode === "grid"
                      ? "Switch to List View"
                      : "Switch to Grid View"
                  }
                >
                  {viewMode === "grid" ? (
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
                        d="M4 6h16M4 10h16M4 14h16M4 18h16"
                      />
                    </svg>
                  ) : (
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
                        d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                      />
                    </svg>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">{renderView()}</div>
    </div>
  );
};

export default MainContent;
