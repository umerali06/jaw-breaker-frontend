import React from "react";
import StandaloneAnalyticsView from "../components/dashboard/views/StandaloneAnalyticsView";
import { useTheme } from "../contexts/ThemeContext";

const AnalyticsTestPage = () => {
  const { isDarkMode } = useTheme();

  return (
    <div
      className={`min-h-screen ${isDarkMode ? "bg-gray-900" : "bg-gray-50"}`}
    >
      <div className="container mx-auto p-4">
        <h1
          className={`text-2xl font-bold mb-4 ${
            isDarkMode ? "text-white" : "text-gray-900"
          }`}
        >
          Analytics Test Page
        </h1>
        <StandaloneAnalyticsView />
      </div>
    </div>
  );
};

export default AnalyticsTestPage;
