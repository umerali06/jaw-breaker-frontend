import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import Sidebar from "../components/dashboard/Sidebar";
import MainContent from "../components/dashboard/MainContent";
import ChatPanel from "../components/dashboard/ChatPanel";
import FileUploadModal from "../components/dashboard/FileUploadModal";
import PatientDataProvider from "../contexts/PatientDataContext";

const DashboardPage = () => {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const [activeView, setActiveView] = useState("overview");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Handle responsive sidebar behavior
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarCollapsed(true);
      } else if (window.innerWidth >= 1024) {
        setIsSidebarCollapsed(false);
      }
    };

    // Set initial state
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <PatientDataProvider>
      <div
        className={`h-screen ${
          isDarkMode ? "bg-gray-900" : "bg-gray-50"
        } flex overflow-hidden relative`}
      >
        {/* Mobile Sidebar Overlay */}
        {!isSidebarCollapsed && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={() => setIsSidebarCollapsed(true)}
          />
        )}

        {/* Sidebar */}
        <div
          className={`${
            isSidebarCollapsed ? "" : "fixed md:relative"
          } z-50 md:z-auto h-full`}
        >
          <Sidebar
            activeView={activeView}
            setActiveView={setActiveView}
            selectedPatient={selectedPatient}
            setSelectedPatient={setSelectedPatient}
            onUploadClick={() => setIsUploadModalOpen(true)}
            user={user}
            isCollapsed={isSidebarCollapsed}
            setIsCollapsed={setIsSidebarCollapsed}
          />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <MainContent
            activeView={activeView}
            selectedPatient={selectedPatient}
            onChatToggle={() => setIsChatOpen(!isChatOpen)}
            isChatOpen={isChatOpen}
            onPatientSelect={setSelectedPatient}
            onSidebarToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            isSidebarCollapsed={isSidebarCollapsed}
          />
        </div>

        {/* AI Chat Panel */}
        {isChatOpen && (
          <ChatPanel
            selectedPatient={selectedPatient}
            onClose={() => setIsChatOpen(false)}
          />
        )}

        {/* File Upload Modal */}
        {isUploadModalOpen && (
          <FileUploadModal
            onClose={() => setIsUploadModalOpen(false)}
            onUploadSuccess={() => {
              setIsUploadModalOpen(false);
              // Refresh data
            }}
          />
        )}
      </div>
    </PatientDataProvider>
  );
};

export default DashboardPage;
