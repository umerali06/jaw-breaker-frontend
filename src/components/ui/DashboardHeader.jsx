import { useTheme } from "../../contexts/ThemeContext";

const DashboardHeader = ({
  title,
  subtitle,
  onSidebarToggle,
  isSidebarCollapsed,
  onChatToggle,
  isChatOpen,
  toggleViewMode,
  viewMode,
  activeView,
}) => {
  const { isDarkMode, toggleTheme } = useTheme();

  // Brand colors with enhanced contrast
  const brandColors = {
    primary: "#2596be",
    accent: "#96be25",
    dark: "#0f172a",
    light: "#f8fafc",
  };

  return (
    <div
      className={`px-6 py-4 border-b flex items-center justify-between ${
        isDarkMode ? "border-gray-800" : "border-gray-200"
      }`}
      style={{
        backgroundColor: isDarkMode ? brandColors.dark : "#ffffff",
        boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
      }}
    >
      {/* Left Section */}
      <div className="flex items-center gap-4">
        {/* Sidebar Toggle */}
        <button
          onClick={onSidebarToggle}
          className={`p-2 rounded-lg ${
            isDarkMode
              ? "hover:bg-gray-800 text-gray-300"
              : "hover:bg-gray-100 text-gray-700"
          } transition-colors`}
          aria-label="Toggle sidebar"
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
                d="M4 6h16M4 12h16M4 18h16"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            )}
          </svg>
        </button>

        {/* Title with improved typography */}
        <div>
          <h2
            className={`text-lg sm:text-xl font-bold tracking-tight ${
              isDarkMode ? "text-white" : "text-gray-900"
            } capitalize`}
          >
            {title}
          </h2>
          {subtitle && (
            <p
              className={`text-xs sm:text-sm font-medium truncate max-w-[200px] sm:max-w-none ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Right Section - Enhanced with theme toggle */}
      <div className="flex items-center gap-2">
        {/* View Mode Toggle - More prominent */}
        {(activeView === "patients" || activeView === "documents") && (
          <button
            onClick={toggleViewMode}
            className={`px-3 py-2 rounded-lg flex items-center gap-2 text-sm font-medium ${
              isDarkMode
                ? "hover:bg-gray-800 text-gray-300"
                : "hover:bg-gray-100 text-gray-700"
            } transition-colors`}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={
                  viewMode === "grid"
                    ? "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                    : "M4 6h16M4 12h16M4 18h16"
                }
              />
            </svg>
            {viewMode === "grid" ? "List View" : "Grid View"}
          </button>
        )}

        {/* Theme Toggle - Premium design */}
        <button
          onClick={toggleTheme}
          className={`p-2 rounded-lg ${
            isDarkMode
              ? "hover:bg-gray-800 text-yellow-300"
              : "hover:bg-gray-100 text-gray-700"
          } transition-colors`}
          aria-label="Toggle theme"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isDarkMode ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
              />
            )}
          </svg>
        </button>

        {/* Chat Toggle - More prominent */}
        <button
          onClick={onChatToggle}
          className={`p-2 rounded-lg relative ${
            isChatOpen
              ? isDarkMode
                ? "bg-gray-800 text-accent"
                : "bg-gray-100 text-accent"
              : isDarkMode
              ? "hover:bg-gray-800 text-gray-300"
              : "hover:bg-gray-100 text-gray-700"
          } transition-colors`}
          aria-label="Toggle chat"
        >
          <svg
            className="w-6 h-6"
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
          {isChatOpen && (
            <span className="absolute top-0 right-0 w-2 h-2 bg-accent rounded-full"></span>
          )}
        </button>
      </div>
    </div>
  );
};

export default DashboardHeader;
