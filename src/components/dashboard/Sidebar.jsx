import { useState } from "react";
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

  const menuItems = [
    {
      id: "overview",
      label: "Overview",
      icon: "M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z",
    },
    {
      id: "patients",
      label: "Patients",
      icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z",
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

  const filteredPatients = patients.filter((patient) =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLogout = () => {
    logout();
  };

  return (
    <div
      className={`${isCollapsed ? "w-16" : "w-80"} ${
        isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
      } border-r flex flex-col h-full transition-all duration-300 ease-in-out`}
    >
      {/* Header */}
      <div
        className={`${isCollapsed ? "p-3" : "p-6"} border-b ${
          isDarkMode ? "border-gray-700" : "border-gray-200"
        }`}
      >
        <div
          className={`flex items-center ${
            isCollapsed ? "justify-center" : "justify-between"
          } mb-4`}
        >
          {!isCollapsed && (
            <h1
              className={`text-xl font-bold ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Jawbreaker
            </h1>
          )}
          <button
            onClick={onUploadClick}
            className={`bg-primary-custom text-white ${
              isCollapsed ? "p-2" : "px-3 py-1.5"
            } rounded-lg text-sm font-medium hover:bg-opacity-90 transition-colors`}
            title={isCollapsed ? "Upload" : ""}
          >
            {isCollapsed ? (
              <svg
                className="w-4 h-4"
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
            ) : (
              "Upload"
            )}
          </button>
        </div>

        {/* User Info */}
        {!isCollapsed && (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary-custom rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p
                className={`text-sm font-medium ${
                  isDarkMode ? "text-white" : "text-gray-900"
                } truncate`}
              >
                {user?.name || "User"}
              </p>
              <p
                className={`text-xs ${
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                } truncate`}
              >
                {user?.email}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              title="Logout"
            >
              <svg
                className="w-4 h-4"
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
          </div>
        )}

        {isCollapsed && (
          <div className="flex justify-center">
            <div className="w-8 h-8 bg-primary-custom rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div
        className={`${isCollapsed ? "p-2" : "p-4"} border-b ${
          isDarkMode ? "border-gray-700" : "border-gray-200"
        }`}
      >
        <nav className="space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center ${
                isCollapsed ? "justify-center px-2 py-3" : "px-3 py-2"
              } text-sm font-medium rounded-lg transition-colors ${
                activeView === item.id
                  ? "bg-primary-custom text-white"
                  : isDarkMode
                  ? "text-gray-300 hover:bg-gray-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
              title={isCollapsed ? item.label : ""}
            >
              <svg
                className={`w-5 h-5 ${isCollapsed ? "" : "mr-3"}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={item.icon}
                />
              </svg>
              {!isCollapsed && item.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Patient List */}
      {!isCollapsed && (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div
            className={`p-4 border-b ${
              isDarkMode ? "border-gray-700" : "border-gray-200"
            }`}
          >
            <div className="relative">
              <input
                type="text"
                placeholder="Search patients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 border ${
                  isDarkMode
                    ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400"
                    : "border-gray-300"
                } rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-custom focus:border-transparent`}
              />
              <svg
                className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-custom"></div>
              </div>
            ) : filteredPatients.length === 0 ? (
              <div className="text-center py-8">
                <p
                  className={`${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  } text-sm`}
                >
                  {searchTerm ? "No patients found" : "No patients yet"}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredPatients.map((patient) => (
                  <button
                    key={patient.id}
                    onClick={() => setSelectedPatient(patient)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selectedPatient?.id === patient.id
                        ? isDarkMode
                          ? "border-primary-custom bg-blue-900 bg-opacity-50"
                          : "border-primary-custom bg-blue-50"
                        : isDarkMode
                        ? "border-gray-600 hover:border-gray-500 hover:bg-gray-700"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm font-medium ${
                            isDarkMode ? "text-white" : "text-gray-900"
                          } truncate`}
                        >
                          {patient.name}
                        </p>
                        <p
                          className={`text-xs ${
                            isDarkMode ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          {patient.files.length} document
                          {patient.files.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            patient.status === "active"
                              ? "bg-green-400"
                              : "bg-gray-400"
                          }`}
                        ></span>
                      </div>
                    </div>
                    <p
                      className={`text-xs ${
                        isDarkMode ? "text-gray-500" : "text-gray-400"
                      } mt-1`}
                    >
                      Updated{" "}
                      {new Date(patient.lastUpdated).toLocaleDateString()}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Collapsed Patient Indicators */}
      {isCollapsed && (
        <div className="flex-1 flex flex-col items-center py-4 space-y-2 overflow-y-auto">
          {filteredPatients.slice(0, 5).map((patient) => (
            <button
              key={patient.id}
              onClick={() => setSelectedPatient(patient)}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                selectedPatient?.id === patient.id
                  ? "bg-primary-custom text-white"
                  : isDarkMode
                  ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
              title={patient.name}
            >
              {patient.name.charAt(0).toUpperCase()}
            </button>
          ))}
          {filteredPatients.length > 5 && (
            <div className="text-xs text-gray-400 text-center">
              +{filteredPatients.length - 5}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Sidebar;
