import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import { useTheme } from "../../contexts/ThemeContext";

const AestheticBarChart = ({ data: initialData, title, dataKeys, colors }) => {
  const { isDarkMode } = useTheme();
  const [data, setData] = useState(initialData || []);
  const [animationActive, setAnimationActive] = useState(true);

  // Default data if none provided
  const defaultData = [
    { name: "Mon", uploaded: 4, processed: 3 },
    { name: "Tue", uploaded: 3, processed: 2 },
    { name: "Wed", uploaded: 2, processed: 2 },
    { name: "Thu", uploaded: 5, processed: 4 },
    { name: "Fri", uploaded: 6, processed: 5 },
    { name: "Sat", uploaded: 3, processed: 3 },
    { name: "Sun", uploaded: 2, processed: 1 },
  ];

  const defaultKeys = ["uploaded", "processed"];
  const defaultColors = ["#2596be", "#10b981"];

  // Use provided values or defaults
  const chartData = data.length > 0 ? data : defaultData;
  const chartKeys = dataKeys || defaultKeys;
  const chartColors = colors || defaultColors;

  // Simulate dynamic data updates
  useEffect(() => {
    if (initialData && initialData.length > 0) {
      setData(initialData);
      return;
    }

    // Only run animation if no data is provided
    const interval = setInterval(() => {
      setData((prevData) =>
        prevData.map((item) => ({
          ...item,
          uploaded: Math.max(
            1,
            item.uploaded + Math.floor(Math.random() * 3) - 1
          ),
          processed: Math.max(
            0,
            item.processed + Math.floor(Math.random() * 3) - 1
          ),
        }))
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [initialData]);

  // Disable animation after initial render
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationActive(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Theme-specific styles
  const textColor = isDarkMode ? "#e2e8f0" : "#1e293b";
  const gridColor = isDarkMode
    ? "rgba(255, 255, 255, 0.1)"
    : "rgba(0, 0, 0, 0.1)";
  const tooltipStyle = {
    backgroundColor: isDarkMode ? "#374151" : "#ffffff",
    border: "none",
    borderRadius: "8px",
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
    color: isDarkMode ? "#ffffff" : "#000000",
  };

  return (
    <div className="w-full h-full">
      {title && (
        <h3
          className={`text-lg font-semibold mb-4 ${
            isDarkMode ? "text-white" : "text-gray-900"
          }`}
        >
          {title}
        </h3>
      )}
      <div className="w-full h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={gridColor}
              vertical={false}
            />
            <XAxis
              dataKey="name"
              stroke={textColor}
              tick={{ fill: textColor, fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: gridColor }}
            />
            <YAxis
              stroke={textColor}
              tick={{ fill: textColor, fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: gridColor }}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              cursor={{
                fill: isDarkMode
                  ? "rgba(255,255,255,0.05)"
                  : "rgba(0,0,0,0.05)",
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: "12px", color: textColor }}
              iconType="circle"
            />
            {chartKeys.map((key, index) => (
              <Bar
                key={key}
                dataKey={key}
                name={key.charAt(0).toUpperCase() + key.slice(1)}
                fill={chartColors[index % chartColors.length]}
                radius={[4, 4, 0, 0]}
                animationDuration={1000}
                animationEasing="ease-out"
                isAnimationActive={animationActive}
              >
                {index === 0 && (
                  <LabelList
                    dataKey={key}
                    position="top"
                    fill={textColor}
                    fontSize={10}
                    formatter={(value) => (value > 3 ? value : "")}
                  />
                )}
              </Bar>
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AestheticBarChart;
