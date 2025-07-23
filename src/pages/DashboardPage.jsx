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
      // Collapse sidebar when screen width is below 1024px
      if (window.innerWidth < 1024) {
        setIsSidebarCollapsed(true);
      } else {
        setIsSidebarCollapsed(false);
      }
    };

    // Set initial state
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close chat panel on small screens when sidebar is opened
  useEffect(() => {
    if (!isSidebarCollapsed && window.innerWidth < 768 && isChatOpen) {
      setIsChatOpen(false);
    }
  }, [isSidebarCollapsed, isChatOpen]);

  return (
    <PatientDataProvider>
      <div
        className={`h-screen w-full ${
          isDarkMode ? "bg-gray-900" : "bg-gray-50"
        } flex overflow-hidden relative`}
        style={{ maxWidth: "100vw", overflowX: "hidden" }}
      >
        {/* Mobile Sidebar Overlay */}
        {!isSidebarCollapsed && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setIsSidebarCollapsed(true)}
            style={{ touchAction: "none" }}
          />
        )}

        {/* Sidebar */}
        <div
          className={`${
            isSidebarCollapsed ? "hidden lg:block" : "block"
          } z-50 lg:z-auto h-full transition-all duration-300 ${
            !isSidebarCollapsed && "fixed lg:relative left-0 top-0"
          }`}
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
        <div className="flex-1 min-h-0 flex flex-col w-full overflow-y-auto overflow-x-hidden">
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

        {/* AI Chat Panel - Responsive positioning */}
        {isChatOpen && (
          <div className="fixed right-0 top-0 h-full z-40 lg:relative lg:z-auto">
            <ChatPanel
              selectedPatient={selectedPatient}
              onClose={() => setIsChatOpen(false)}
            />
          </div>
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
