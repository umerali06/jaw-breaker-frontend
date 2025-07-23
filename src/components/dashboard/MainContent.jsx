import { useState } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import OverviewView from "./views/OverviewView";
import PatientsView from "./views/PatientsView";
import DocumentsView from "./views/DocumentsView";
import AnalyticsView from "./views/AnalyticsView";
import DashboardHeader from "../ui/DashboardHeader";
import jsPDF from "jspdf";
import FileUploadModal from "./FileUploadModal";

const MainContent = ({
  activeView,
  selectedPatient,
  onChatToggle,
  isChatOpen,
  onPatientSelect,
  onSidebarToggle,
  isSidebarCollapsed,
}) => {
  const { isDarkMode } = useTheme();
  const [viewMode, setViewMode] = useState("grid");

  // SOAP modal state lifted up
  const [isSoapModalOpen, setIsSoapModalOpen] = useState(false);
  const [soapNote, setSoapNote] = useState(null);
  const [isSoapLoading, setIsSoapLoading] = useState(false);

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const downloadSoapAsPDF = () => {
    if (!soapNote) return;
    const doc = new jsPDF();
    doc.text(soapNote, 10, 10);
    doc.save(`${selectedPatient?.name || "patient"}-SOAP-note.pdf`);
  };

  // Brand colors
  const brandColors = {
    primary: "#2596be",
    accent: "#96be25",
    dark: "#0f172a",
    light: "#f8fafc",
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === "grid" ? "list" : "grid");
  };

  const renderView = () => {
    switch (activeView) {
      case "overview":
        return (
          <OverviewView
            selectedPatient={selectedPatient}
            isSoapModalOpen={isSoapModalOpen}
            setIsSoapModalOpen={setIsSoapModalOpen}
            soapNote={soapNote}
            setSoapNote={setSoapNote}
            isSoapLoading={isSoapLoading}
            setIsSoapLoading={setIsSoapLoading}
            downloadSoapAsPDF={downloadSoapAsPDF}
            isUploadModalOpen={isUploadModalOpen}
            setIsUploadModalOpen={setIsUploadModalOpen}
          />
        );
      case "patients":
        return (
          <PatientsView
            selectedPatient={selectedPatient}
            onPatientSelect={onPatientSelect}
            viewMode={viewMode}
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
        return (
          <OverviewView
            selectedPatient={selectedPatient}
            isSoapModalOpen={isSoapModalOpen}
            setIsSoapModalOpen={setIsSoapModalOpen}
            soapNote={soapNote}
            setSoapNote={setSoapNote}
            isSoapLoading={isSoapLoading}
            setIsSoapLoading={setIsSoapLoading}
            downloadSoapAsPDF={downloadSoapAsPDF}
            isUploadModalOpen={isUploadModalOpen}
            setIsUploadModalOpen={setIsUploadModalOpen}
          />
        );
    }
  };

  // Prepare subtitle for header if patient is selected
  const subtitle = selectedPatient
    ? `${selectedPatient.name} • ${
        selectedPatient.files ? selectedPatient.files.length : 0
      } ${
        selectedPatient.files && selectedPatient.files.length === 1
          ? "document"
          : "documents"
      }`
    : null;

  return (
    <div
      className="flex-1 flex flex-col overflow-hidden"
      style={
        isDarkMode
          ? { backgroundColor: brandColors.dark, overflowX: "hidden" }
          : { backgroundColor: "#f8fafc", overflowX: "hidden" }
      }
    >
      {/* Premium Header */}
      <DashboardHeader
        title={activeView}
        subtitle={subtitle}
        onSidebarToggle={onSidebarToggle}
        isSidebarCollapsed={isSidebarCollapsed}
        onChatToggle={onChatToggle}
        isChatOpen={isChatOpen}
        toggleViewMode={toggleViewMode}
        viewMode={viewMode}
        activeView={activeView}
        isDarkMode={isDarkMode}
      />

      {/* Main Content Area with Gradient Border */}
      <div
        className="flex-1 overflow-y-auto relative"
        style={{
          background: isDarkMode
            ? `linear-gradient(${brandColors.dark}, ${brandColors.dark})`
            : `linear-gradient(#f8fafc, #f8fafc)`,
          borderTop: isDarkMode
            ? `1px solid rgba(37, 150, 190, 0.2)`
            : `1px solid rgba(150, 190, 37, 0.1)`,
        }}
      >
        {/* Glow Effect Container */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            boxShadow: isDarkMode
              ? `inset 0 1px 0 0 rgba(37, 150, 190, 0.1)`
              : `inset 0 1px 0 0 rgba(150, 190, 37, 0.05)`,
          }}
        ></div>

        {/* Content */}
        <div className="p-3 sm:p-4 md:p-6 overflow-x-hidden">
          {renderView()}
        </div>
      </div>
      {/* SOAP Note Preview Modal - moved here */}
      {isSoapModalOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ background: "rgba(0,0,0,0.4)" }}
        >
          <div
            className={`rounded-xl shadow-xl max-w-2xl w-full p-4 sm:p-6 relative border-2 max-h-[90vh] flex flex-col ${
              isDarkMode
                ? "bg-gray-800 border-[#2596be]"
                : "bg-white border-[#2596be]"
            }`}
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
            <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 pr-6">
              SOAP Note Preview
            </h2>
            {isSoapLoading ? (
              <div className="text-center py-8 flex-1">
                Generating SOAP note...
              </div>
            ) : (
              <>
                <div className="flex-1 min-h-0 overflow-hidden">
                  <pre className="bg-gray-100 rounded p-3 sm:p-4 h-full max-h-[60vh] overflow-y-auto whitespace-pre-wrap text-xs sm:text-sm mb-3 sm:mb-4 break-words">
                    {soapNote}
                  </pre>
                </div>
                <button
                  onClick={downloadSoapAsPDF}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 rounded bg-[#2596be] text-white font-bold hover:bg-[#1d7a9c] text-sm sm:text-base"
                >
                  Download as PDF
                </button>
              </>
            )}
          </div>
        </div>
      )}
      {/* File Upload Modal - moved here */}
      {isUploadModalOpen && (
        <FileUploadModal
          selectedPatient={selectedPatient}
          onClose={() => setIsUploadModalOpen(false)}
          onUploadSuccess={() => {
            setIsUploadModalOpen(false);
            // Optionally trigger a refresh if needed
          }}
        />
      )}
    </div>
  );
};

export default MainContent;
