import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { usePatientData } from "../../contexts/PatientDataContext";
import { useTheme } from "../../contexts/ThemeContext";

const Sidebar = ({
  activeView,
  setActiveView,
  selectedPatient,
  setSelectedPatient,
  onUploadClick,
  user,
  isCollapsed,
  setIsCollapsed,
}) => {
  const { logout } = useAuth();
  const { patients, loading } = usePatientData();
  const { isDarkMode } = useTheme();
  const [searchTerm, setSearchTerm] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Brand colors with proper contrast
  const brandColors = {
    primary: "#2596be",
    accent: "#96be25",
    dark: "#0f172a",
    light: "#f8fafc",
  };

  const menuItems = [
    {
      id: "overview",
      label: "Overview",
      icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
    },
    {
      id: "patients",
      label: "Patients",
      icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197",
    },
    {
      id: "documents",
      label: "Documents",
      icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
    },
  ];

  const filteredPatients = (patients || []).filter((patient) =>
    (patient.name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Close drawer on resize above md
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setDrawerOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Helper: Sidebar header arrow icon
  const ArrowIcon = ({ direction = "left", ...props }) => (
    <svg
      className="w-6 h-6"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d={direction === "left" ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"}
      />
    </svg>
  );

  // SidebarContent component for DRY rendering
  const SidebarContent = () => (
    <>
      {/* Premium Brand Header */}
      <div
        className={`p-4 flex ${
          isCollapsed ? "flex-col items-center" : "justify-between items-center"
        } gap-3`}
        style={{ backgroundColor: brandColors.primary }}
      >
        {!isCollapsed ? (
          <>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                <img
                  src="jawbreaker-white.png"
                  alt="/jawbreaker-white.png"
                  className="w-6 h-6"
                  srcSet=""
                  style={{ backgroundColor: "#2596be" }}
                />
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                JAWBREAKER
              </h1>
            </div>
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="text-white hover:text-accent transition-colors"
            >
              <ArrowIcon direction="left" />
            </button>
          </>
        ) : (
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-white hover:text-accent transition-colors"
          >
            <ArrowIcon direction="right" />
          </button>
        )}
      </div>
      {/* User Profile with Glass Effect */}
      <div
        className={`p-4 flex ${
          isCollapsed ? "flex-col items-center" : "items-center gap-3"
        } ${isDarkMode ? "bg-gray-800" : "bg-gray-50"} border-b ${
          isDarkMode ? "border-gray-700" : "border-gray-200"
        }`}
      >
        <div
          className={`${
            isCollapsed ? "w-12 h-12" : "w-14 h-14"
          } rounded-full flex items-center justify-center text-white font-bold text-xl`}
          style={{
            background: `linear-gradient(135deg, ${brandColors.primary}, ${brandColors.accent})`,
            boxShadow: "0 4px 15px rgba(37, 150, 190, 0.3)",
          }}
        >
          {user?.name?.charAt(0)?.toUpperCase() || "D"}
        </div>
        {!isCollapsed && (
          <div className="flex-1 min-w-0">
            <p
              className={`text-sm font-bold ${
                isDarkMode ? "text-white" : "text-gray-900"
              } truncate`}
            >
              Dr. {user?.name || "User"}
            </p>
            <p
              className={`text-xs font-medium ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              } truncate`}
            >
              {user?.email}
            </p>
          </div>
        )}
        {!isCollapsed && (
          <button
            onClick={logout}
            className={`p-2 rounded-full ${
              isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-200"
            } transition-colors`}
            title="Logout"
          >
            <svg
              className="w-5 h-5 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
          </button>
        )}
      </div>
      {/* Floating Upload Button */}
      <div className={`p-3 ${isDarkMode ? "bg-gray-800" : "bg-white"}`}>
        <button
          onClick={onUploadClick}
          className={`w-full py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md ${
            isDarkMode
              ? "bg-gray-700 hover:bg-gray-600 text-white"
              : "bg-white hover:bg-gray-50 text-gray-800"
          }`}
          style={{
            border: `2px dashed ${
              isDarkMode ? brandColors.primary : brandColors.accent
            }`,
            boxShadow: `0 4px 15px ${
              isDarkMode ? "rgba(37, 150, 190, 0.2)" : "rgba(150, 190, 37, 0.2)"
            }`,
          }}
        >
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
              d="M12 4v16m8-8H4"
            />
          </svg>
          {!isCollapsed && <span>Upload Scan</span>}
        </button>
      </div>
      {/* Navigation with Glow Effect */}
      <nav className="p-3 space-y-2 flex-shrink-0">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id)}
            className={`w-full flex items-center ${
              isCollapsed ? "justify-center p-3" : "px-4 py-3"
            } rounded-xl transition-all font-bold text-sm ${
              activeView === item.id
                ? isDarkMode
                  ? `bg-gray-700 text-${brandColors.accent} border-l-4 border-${brandColors.accent}`
                  : `bg-${brandColors.primary} bg-opacity-10 text-${brandColors.primary} border-l-4 border-${brandColors.primary}`
                : isDarkMode
                ? "text-gray-300 hover:bg-gray-700"
                : "text-gray-600 hover:bg-gray-100"
            }`}
            style={
              activeView === item.id
                ? isDarkMode
                  ? {
                      backgroundColor: "rgba(150, 190, 37, 0.1)",
                      borderLeftColor: brandColors.accent,
                      color: brandColors.accent,
                    }
                  : {
                      backgroundColor: "rgba(37, 150, 190, 0.1)",
                      borderLeftColor: brandColors.primary,
                      color: brandColors.primary,
                    }
                : {}
            }
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              style={
                activeView === item.id
                  ? isDarkMode
                    ? { stroke: brandColors.accent }
                    : { stroke: brandColors.primary }
                  : {}
              }
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={item.icon}
              />
            </svg>
            {!isCollapsed && <span className="ml-3">{item.label}</span>}
          </button>
        ))}
      </nav>
      {/* Patient List with Status Indicators */}
      {!isCollapsed && (
        <div
          className={`p-3 border-t ${
            isDarkMode ? "border-gray-800" : "border-gray-200"
          } flex-1 min-h-0 overflow-y-auto`}
        >
          <div className="relative mb-3">
            <input
              type="text"
              placeholder="Search patients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm font-bold ${
                isDarkMode
                  ? "bg-gray-800 text-white placeholder-gray-400 focus:ring-2 focus:ring-accent"
                  : "bg-gray-100 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-primary"
              } focus:outline-none`}
              style={{
                border: isDarkMode
                  ? `1px solid ${brandColors.primary}`
                  : `1px solid ${brandColors.accent}`,
              }}
            />
            <svg
              className="w-4 h-4 absolute left-3 top-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              style={{
                stroke: isDarkMode ? brandColors.accent : brandColors.primary,
              }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <div className="space-y-2 pr-2">
            {loading ? (
              <div className="flex justify-center py-4">
                <div
                  className="animate-spin rounded-full h-6 w-6 border-b-2 border-t-2"
                  style={{
                    borderTopColor: brandColors.primary,
                    borderBottomColor: brandColors.accent,
                  }}
                ></div>
              </div>
            ) : filteredPatients.length === 0 ? (
              <p
                className={`text-center py-4 text-sm font-medium ${
                  isDarkMode ? "text-gray-500" : "text-gray-400"
                }`}
              >
                {searchTerm ? "No matches found" : "No patients"}
              </p>
            ) : (
              filteredPatients.map((patient, idx) => (
                <button
                  key={patient.id || patient._id || patient.name || idx}
                  onClick={() => setSelectedPatient(patient)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                    selectedPatient?.id === patient.id
                      ? isDarkMode
                        ? `bg-${brandColors.accent} bg-opacity-20 border border-${brandColors.accent}`
                        : `bg-${brandColors.primary} bg-opacity-10 border border-${brandColors.primary}`
                      : isDarkMode
                      ? "bg-gray-800 hover:bg-gray-700"
                      : "bg-white hover:bg-gray-50"
                  } shadow-xs`}
                  style={
                    selectedPatient?.id === patient.id
                      ? isDarkMode
                        ? {
                            backgroundColor: "rgba(150, 190, 37, 0.2)",
                            borderColor: brandColors.accent,
                          }
                        : {
                            backgroundColor: "rgba(37, 150, 190, 0.1)",
                            borderColor: brandColors.primary,
                          }
                      : {}
                  }
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                        selectedPatient?.id === patient.id
                          ? isDarkMode
                            ? "bg-white text-gray-900"
                            : "bg-primary text-white"
                          : isDarkMode
                          ? "bg-gray-700 text-gray-200"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {patient.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-left">
                      <p
                        className={`text-sm font-bold ${
                          selectedPatient?.id === patient.id
                            ? isDarkMode
                              ? "text-white"
                              : "text-primary"
                            : isDarkMode
                            ? "text-gray-200"
                            : "text-gray-800"
                        }`}
                      >
                        {patient.name}
                      </p>
                      <p
                        className={`text-xs ${
                          selectedPatient?.id === patient.id
                            ? isDarkMode
                              ? "text-gray-300"
                              : "text-primary-600"
                            : isDarkMode
                            ? "text-gray-500"
                            : "text-gray-500"
                        }`}
                      >
                        {(patient.files || []).length} records
                      </p>
                    </div>
                  </div>
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${
                      patient.status === "active"
                        ? isDarkMode
                          ? "bg-green-400"
                          : "bg-green-500"
                        : isDarkMode
                        ? "bg-gray-600"
                        : "bg-gray-400"
                    }`}
                  ></div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
      {/* Collapsed Patient Indicators */}
      {isCollapsed && (
        <div
          className={`p-3 border-t ${
            isDarkMode ? "border-gray-800" : "border-gray-200"
          } flex flex-col items-center gap-2`}
        >
          {filteredPatients.slice(0, 5).map((patient, idx) => (
            <button
              key={patient.id || patient._id || patient.name || idx}
              onClick={() => setSelectedPatient(patient)}
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                selectedPatient?.id === patient.id
                  ? isDarkMode
                    ? `bg-${brandColors.accent} text-white`
                    : `bg-${brandColors.primary} text-white`
                  : isDarkMode
                  ? "bg-gray-700 text-gray-200"
                  : "bg-gray-100 text-gray-800"
              }`}
              style={
                selectedPatient?.id === patient.id
                  ? isDarkMode
                    ? { backgroundColor: brandColors.accent }
                    : { backgroundColor: brandColors.primary }
                  : {}
              }
              title={patient.name}
            >
              {patient.name.charAt(0).toUpperCase()}
            </button>
          ))}
        </div>
      )}
    </>
  );

  return (
    <div
      className={`${
        isCollapsed ? "w-16 sm:w-20" : "w-56 sm:w-64"
      } h-full flex flex-col transition-all duration-300 ${
        isDarkMode ? "bg-gray-900" : "bg-white"
      } border-r ${
        isDarkMode ? "border-gray-800" : "border-gray-200"
      } shadow-xl`}
      style={isDarkMode ? { backgroundColor: brandColors.dark } : {}}
    >
      <SidebarContent />
    </div>
  );
};

export default Sidebar;
