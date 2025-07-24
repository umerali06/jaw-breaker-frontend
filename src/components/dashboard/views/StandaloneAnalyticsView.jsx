import React, { useState, useEffect } from "react";
import { useTheme } from "../../../contexts/ThemeContext";
import AestheticBarChart from "../AestheticBarChart";
import AestheticDonutChart from "../AestheticDonutChart";

const StandaloneAnalyticsView = () => {
  const { isDarkMode } = useTheme();
  const [timeRange, setTimeRange] = useState("30"); // days
  const [analytics, setAnalytics] = useState({
    totalDocuments: 20,
    processedDocuments: 15,
    documentTypes: { pdf: 5, docx: 3, txt: 2, jpg: 1 },
  });
  const [isLoading, setIsLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Prepare chart data
  const [barChartData, setBarChartData] = useState([
    { name: "Mon", uploaded: 4, processed: 3 },
    { name: "Tue", uploaded: 3, processed: 2 },
    { name: "Wed", uploaded: 2, processed: 2 },
    { name: "Thu", uploaded: 5, processed: 4 },
    { name: "Fri", uploaded: 6, processed: 5 },
    { name: "Sat", uploaded: 3, processed: 3 },
    { name: "Sun", uploaded: 2, processed: 1 },
  ]);

  const [donutChartData, setDonutChartData] = useState([
    { name: "PDF", value: 5 },
    { name: "DOCX", value: 3 },
    { name: "TXT", value: 2 },
    { name: "JPG", value: 1 },
  ]);

  // Handle theme-specific styles
  const cardBgClass = isDarkMode ? "bg-gray-800" : "bg-white";
  const textClass = isDarkMode ? "text-white" : "text-gray-900";
  const subtextClass = isDarkMode ? "text-gray-300" : "text-gray-500";

  // Simulate data loading based on time range
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Generate random data based on time range
      const days = parseInt(timeRange);
      const multiplier = days / 30; // Scale data based on time range

      // Update analytics
      setAnalytics({
        totalDocuments: Math.round(20 * multiplier),
        processedDocuments: Math.round(15 * multiplier),
        documentTypes: {
          pdf: Math.round(5 * multiplier),
          docx: Math.round(3 * multiplier),
          txt: Math.round(2 * multiplier),
          jpg: Math.round(1 * multiplier),
        },
      });

      // Update bar chart data
      const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      const newBarData = daysOfWeek.map((day) => ({
        name: day,
        uploaded: Math.round(Math.random() * 5 * multiplier) + 1,
        processed: Math.round(Math.random() * 4 * multiplier) + 1,
      }));
      setBarChartData(newBarData);

      // Update donut chart data
      setDonutChartData([
        { name: "PDF", value: Math.round(5 * multiplier) },
        { name: "DOCX", value: Math.round(3 * multiplier) },
        { name: "TXT", value: Math.round(2 * multiplier) },
        { name: "JPG", value: Math.round(1 * multiplier) },
      ]);

      setIsLoading(false);
    };

    loadData();
  }, [timeRange, refreshTrigger]);

  // Time range selector
  const handleTimeRangeChange = (e) => {
    setTimeRange(e.target.value);
  };

  // Refresh data
  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="p-4">
      {/* Header with time range selector and refresh button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h2 className={`text-2xl font-bold ${textClass}`}>
          Analytics Dashboard
        </h2>
        <div className="flex items-center gap-2 mt-2 sm:mt-0">
          <select
            value={timeRange}
            onChange={handleTimeRangeChange}
            className={`px-3 py-2 border rounded-md ${
              isDarkMode
                ? "bg-gray-700 border-gray-600 text-white"
                : "bg-white border-gray-300"
            }`}
            disabled={isLoading}
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
          <button
            onClick={handleRefresh}
            className={`p-2 rounded-md ${
              isDarkMode
                ? "bg-gray-700 hover:bg-gray-600 text-white"
                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
            } transition-colors`}
            disabled={isLoading}
          >
            <svg
              className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-black bg-opacity-10 flex items-center justify-center z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div
          className={`${cardBgClass} p-4 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg`}
        >
          <h3 className={subtextClass}>Total Documents</h3>
          <p className={`text-2xl font-bold ${textClass}`}>
            {analytics.totalDocuments}
          </p>
          <div className="mt-2 flex items-center">
            <span className="text-green-500 text-xs font-medium">↗ 12%</span>
            <span className={`text-xs ${subtextClass} ml-1`}>
              vs last period
            </span>
          </div>
        </div>
        <div
          className={`${cardBgClass} p-4 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg`}
        >
          <h3 className={subtextClass}>Processed</h3>
          <p className={`text-2xl font-bold ${textClass}`}>
            {analytics.processedDocuments}
          </p>
          <div className="mt-2 flex items-center">
            <span className="text-green-500 text-xs font-medium">↗ 8%</span>
            <span className={`text-xs ${subtextClass} ml-1`}>
              vs last period
            </span>
          </div>
        </div>
        <div
          className={`${cardBgClass} p-4 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg`}
        >
          <h3 className={subtextClass}>Completion Rate</h3>
          <p className={`text-2xl font-bold ${textClass}`}>
            {Math.round(
              (analytics.processedDocuments / analytics.totalDocuments) * 100
            )}
            %
          </p>
          <div className="mt-2 flex items-center">
            <span className="text-gray-500 text-xs font-medium">→ 0%</span>
            <span className={`text-xs ${subtextClass} ml-1`}>
              vs last period
            </span>
          </div>
        </div>
        <div
          className={`${cardBgClass} p-4 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg`}
        >
          <h3 className={subtextClass}>Active Patients</h3>
          <p className={`text-2xl font-bold ${textClass}`}>{5}</p>
          <div className="mt-2 flex items-center">
            <span className="text-red-500 text-xs font-medium">↘ 4%</span>
            <span className={`text-xs ${subtextClass} ml-1`}>
              vs last period
            </span>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Bar Chart - Using our new aesthetic chart */}
        <div
          className={`${cardBgClass} p-4 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg`}
        >
          <AestheticBarChart
            title="Document Processing Trends"
            data={barChartData}
            dataKeys={["uploaded", "processed"]}
            colors={["#2596be", "#10b981"]}
          />
        </div>

        {/* Donut Chart - Using our new aesthetic chart */}
        <div
          className={`${cardBgClass} p-4 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg`}
        >
          <AestheticDonutChart
            title="Document Types Distribution"
            data={donutChartData}
            colors={["#2596be", "#10b981", "#f59e0b", "#ef4444"]}
          />
        </div>
      </div>

      {/* Additional Metrics */}
      <div
        className={`${cardBgClass} p-4 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg mb-6`}
      >
        <h3 className={`text-lg font-semibold mb-4 ${textClass}`}>
          Processing Efficiency
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <h4 className={subtextClass}>Average Processing Time</h4>
            <p className={`text-xl font-bold ${textClass}`}>2.3 min</p>
            <div className="mt-1 flex items-center">
              <span className="text-green-500 text-xs font-medium">↗ 15%</span>
              <span className={`text-xs ${subtextClass} ml-1`}>faster</span>
            </div>
          </div>
          <div>
            <h4 className={subtextClass}>Documents per Day</h4>
            <p className={`text-xl font-bold ${textClass}`}>4.5</p>
            <div className="mt-1 flex items-center">
              <span className="text-green-500 text-xs font-medium">↗ 8%</span>
              <span className={`text-xs ${subtextClass} ml-1`}>increase</span>
            </div>
          </div>
          <div>
            <h4 className={subtextClass}>Success Rate</h4>
            <p className={`text-xl font-bold ${textClass}`}>98%</p>
            <div className="mt-1 flex items-center">
              <span className="text-green-500 text-xs font-medium">↗ 2%</span>
              <span className={`text-xs ${subtextClass} ml-1`}>
                improvement
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StandaloneAnalyticsView;
