import React, { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  Sector,
} from "recharts";
import { useTheme } from "../../contexts/ThemeContext";

const AestheticDonutChart = ({ data: initialData, title, colors }) => {
  const { isDarkMode } = useTheme();
  const [data, setData] = useState(initialData || []);
  const [activeIndex, setActiveIndex] = useState(0);
  const [animationActive, setAnimationActive] = useState(true);

  // Default data if none provided
  const defaultData = [
    { name: "PDF", value: 5 },
    { name: "DOCX", value: 3 },
    { name: "TXT", value: 2 },
    { name: "JPG", value: 1 },
  ];

  const defaultColors = [
    "#2596be",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#06b6d4",
  ];

  // Use provided values or defaults
  const chartData = data.length > 0 ? data : defaultData;
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
          value: Math.max(1, item.value + Math.floor(Math.random() * 3) - 1),
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

  // Handle mouse enter for active slice
  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };

  // Theme-specific styles
  const textColor = isDarkMode ? "#e2e8f0" : "#1e293b";
  const tooltipStyle = {
    backgroundColor: isDarkMode ? "#374151" : "#ffffff",
    border: "none",
    borderRadius: "8px",
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
    color: isDarkMode ? "#ffffff" : "#000000",
  };

  // Custom active shape for hover effect
  const renderActiveShape = (props) => {
    const {
      cx,
      cy,
      innerRadius,
      outerRadius,
      startAngle,
      endAngle,
      fill,
      payload,
      percent,
    } = props;

    return (
      <g>
        <text
          x={cx}
          y={cy}
          dy={-10}
          textAnchor="middle"
          fill={textColor}
          className="text-sm font-medium"
        >
          {payload.name}
        </text>
        <text
          x={cx}
          y={cy}
          dy={10}
          textAnchor="middle"
          fill={textColor}
          className="text-lg font-bold"
        >
          {payload.value}
        </text>
        <text
          x={cx}
          y={cy}
          dy={30}
          textAnchor="middle"
          fill={textColor}
          className="text-xs"
        >
          {`${(percent * 100).toFixed(1)}%`}
        </text>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 8}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          opacity={0.2}
        />
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
      </g>
    );
  };

  // Calculate total for center text
  const total = chartData.reduce((sum, item) => sum + item.value, 0);

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
          <PieChart>
            <Pie
              activeIndex={activeIndex}
              activeShape={renderActiveShape}
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={4}
              dataKey="value"
              onMouseEnter={onPieEnter}
              animationDuration={1000}
              animationEasing="ease-out"
              isAnimationActive={animationActive}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={chartColors[index % chartColors.length]}
                  stroke={isDarkMode ? "#1f2937" : "#ffffff"}
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(value, name) => [
                `${value} (${((value / total) * 100).toFixed(1)}%)`,
                name,
              ]}
            />
            <Legend
              layout="horizontal"
              verticalAlign="bottom"
              align="center"
              wrapperStyle={{ fontSize: "12px", paddingTop: "20px" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AestheticDonutChart;
