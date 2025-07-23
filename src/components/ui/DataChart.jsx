import React, { useEffect, useRef, useState } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import ReactTooltip from "react-tooltip";

const DataChart = ({
  title,
  type = "bar",
  data = [],
  labels = [],
  colors = [],
  height = 300,
  unit = "",
  className = "",
  animationDuration = 800,
  showLegend = true,
  showTooltips = true,
  showGrid = true,
  showAxis = true,
  borderRadius = 8,
}) => {
  const { isDarkMode } = useTheme();
  const chartRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [animatedData, setAnimatedData] = useState([]);
  const [hoveredItem, setHoveredItem] = useState(null);

  // Premium color palette
  const chartColors = {
    primary: "#1a73e8", // Professional blue
    secondary: "#34a853", // Healthy green
    accent: "#fbbc04", // Attention yellow
    danger: "#d32f2f", // Alert red
    text: isDarkMode ? "#ffffff" : "#202124",
    grid: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
    background: isDarkMode ? "#202124" : "#ffffff",
    axis: isDarkMode ? "#9aa0a6" : "#5f6368",
    cardBg: isDarkMode ? "#2d3748" : "#ffffff",
    cardBorder: isDarkMode ? "#374151" : "#e5e7eb",
  };

  // Use custom colors if provided
  const effectiveColors =
    colors.length > 0
      ? colors
      : [
          "#2596be", // Branding blue
          "#96be25", // Branding green
          chartColors.accent,
          chartColors.danger,
          "#8ab4f8",
          "#81c995",
          "#fde293",
          "#f28b82",
        ];

  // Handle resize and initial dimensions
  useEffect(() => {
    const updateDimensions = () => {
      if (chartRef.current) {
        setDimensions({
          width: chartRef.current.clientWidth,
          height: chartRef.current.clientHeight,
        });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // Data animation effect
  useEffect(() => {
    if (data.length === 0) return;

    const steps = 30;
    const stepDuration = animationDuration / steps;
    let currentStep = 0;

    setAnimatedData(
      data.map((series) =>
        Array.isArray(series) ? series.map(() => 0) : data.map(() => 0)
      )
    );

    const interval = setInterval(() => {
      currentStep++;
      const progress = Math.min(currentStep / steps, 1);

      setAnimatedData(
        data.map((series) =>
          Array.isArray(series)
            ? series.map((value) => value * progress)
            : data.map((value) => value * progress)
        )
      );

      if (currentStep >= steps) clearInterval(interval);
    }, stepDuration);

    return () => clearInterval(interval);
  }, [data, animationDuration]);

  // Calculate chart metrics
  const calculateChartMetrics = () => {
    const { width, height } = dimensions;
    const maxValue = Math.max(...animatedData.flat());
    const minValue = Math.min(...animatedData.flat());
    const padding = {
      top: 30,
      right: 30,
      bottom: 40,
      left: 40,
    };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    return {
      width,
      height,
      maxValue,
      minValue,
      padding,
      chartWidth,
      chartHeight,
    };
  };

  // Render bar chart
  const renderBarChart = () => {
    const { chartWidth, chartHeight, maxValue, padding } =
      calculateChartMetrics();
    const seriesCount = Array.isArray(data[0]) ? data.length : 1;
    const barGroupWidth = chartWidth / (labels.length || 1);
    const barWidth = (barGroupWidth * 0.8) / seriesCount;
    const barGap = (barGroupWidth * 0.2) / (seriesCount + 1);

    return (
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
        className="overflow-visible"
        style={{ filter: "drop-shadow(0 2px 8px rgba(37,150,190,0.08))" }}
      >
        <defs>
          <linearGradient id="barGradientBlue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2596be" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#2596be" stopOpacity="0.6" />
          </linearGradient>
          <linearGradient id="barGradientGreen" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#96be25" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#96be25" stopOpacity="0.6" />
          </linearGradient>
        </defs>
        {/* Grid lines */}
        {showGrid &&
          [...Array(5)].map((_, i) => {
            const y = padding.top + (chartHeight / 4) * i;
            return (
              <g key={`grid-${i}`}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={dimensions.width - padding.right}
                  y2={y}
                  stroke={chartColors.grid}
                  strokeWidth="1"
                  strokeDasharray="4 2"
                />
                <text
                  x={padding.left - 10}
                  y={y + 4}
                  textAnchor="end"
                  fill={chartColors.axis}
                  fontSize="10"
                >
                  {(maxValue - (maxValue / 4) * i).toFixed(
                    maxValue > 10 ? 0 : 1
                  )}
                </text>
              </g>
            );
          })}

        {/* Bars */}
        {(Array.isArray(data[0]) ? animatedData : [animatedData]).map(
          (series, seriesIndex) => (
            <g
              key={`series-${seriesIndex}`}
              transform={`translate(${padding.left}, ${padding.top})`}
            >
              {series.map((value, index) => {
                const x =
                  index * barGroupWidth +
                  barGap +
                  seriesIndex * (barWidth + barGap);
                const barHeight =
                  maxValue > 0 ? (value / maxValue) * chartHeight : 0;
                const y = chartHeight - barHeight;
                const isHovered =
                  hoveredItem?.index === index &&
                  hoveredItem?.seriesIndex === seriesIndex;
                const gradientId =
                  seriesIndex % 2 === 0
                    ? "barGradientBlue"
                    : "barGradientGreen";

                return (
                  <g
                    key={`bar-${index}`}
                    onMouseEnter={() => setHoveredItem({ seriesIndex, index })}
                    onMouseLeave={() => setHoveredItem(null)}
                    data-tip={labels[index] + ": " + value}
                    data-for={`bar-tooltip-${seriesIndex}-${index}`}
                  >
                    <rect
                      x={x}
                      y={y}
                      width={barWidth}
                      height={barHeight}
                      fill={`url(#${gradientId})`}
                      rx={borderRadius}
                      ry={borderRadius}
                      className="transition-all duration-200"
                      style={{
                        opacity: isHovered ? 1 : hoveredItem ? 0.7 : 1,
                        transform: isHovered
                          ? "scale(1.04, 1.08)"
                          : "scale(1, 1)",
                        transition: "transform 0.2s",
                        filter: isHovered
                          ? "drop-shadow(0 4px 16px rgba(37,150,190,0.18))"
                          : "none",
                      }}
                    />

                    {/* Value label */}
                    {showTooltips && isHovered && (
                      <g
                        transform={`translate(${x + barWidth / 2}, ${y - 10})`}
                      >
                        <rect
                          x="-20"
                          y="-15"
                          width="40"
                          height="20"
                          rx="4"
                          ry="4"
                          fill={chartColors.cardBg}
                          stroke={chartColors.cardBorder}
                          strokeWidth="1"
                        />
                        <text
                          textAnchor="middle"
                          fill={chartColors.text}
                          fontSize="10"
                          fontWeight="500"
                          dy="-4"
                        >
                          {value.toFixed(1)}
                          {unit}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </g>
          )
        )}

        {/* X-axis labels */}
        {showAxis && labels.length > 0 && (
          <g
            transform={`translate(${padding.left}, ${
              dimensions.height - padding.bottom + 15
            })`}
          >
            {labels.map((label, index) => (
              <text
                key={`label-${index}`}
                x={index * barGroupWidth + barGroupWidth / 2}
                y="0"
                textAnchor="middle"
                fill={chartColors.axis}
                fontSize="11"
              >
                {label}
              </text>
            ))}
          </g>
        )}

        {/* Y-axis line */}
        {showAxis && (
          <line
            x1={padding.left}
            y1={padding.top}
            x2={padding.left}
            y2={dimensions.height - padding.bottom}
            stroke={chartColors.axis}
            strokeWidth="1"
          />
        )}

        {/* X-axis line */}
        {showAxis && (
          <line
            x1={padding.left}
            y1={dimensions.height - padding.bottom}
            x2={dimensions.width - padding.right}
            y2={dimensions.height - padding.bottom}
            stroke={chartColors.axis}
            strokeWidth="1"
          />
        )}
      </svg>
    );
  };

  // Render line chart
  const renderLineChart = () => {
    const { chartWidth, chartHeight, maxValue, minValue, padding } =
      calculateChartMetrics();
    const range = maxValue - minValue;

    return (
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
        className="overflow-visible"
      >
        {/* Grid lines */}
        {showGrid &&
          [...Array(5)].map((_, i) => {
            const y = padding.top + (chartHeight / 4) * i;
            const value = maxValue - (range / 4) * i;
            return (
              <g key={`grid-${i}`}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={dimensions.width - padding.right}
                  y2={y}
                  stroke={chartColors.grid}
                  strokeWidth="1"
                  strokeDasharray="4 2"
                />
                <text
                  x={padding.left - 10}
                  y={y + 4}
                  textAnchor="end"
                  fill={chartColors.axis}
                  fontSize="10"
                >
                  {value.toFixed(range > 10 ? 0 : 1)}
                </text>
              </g>
            );
          })}

        {/* Lines */}
        {(Array.isArray(data[0]) ? animatedData : [animatedData]).map(
          (series, seriesIndex) => {
            const color = effectiveColors[seriesIndex % effectiveColors.length];
            const points = series.map((value, index) => {
              const x =
                padding.left + (index / (series.length - 1)) * chartWidth;
              const y =
                padding.top +
                chartHeight -
                ((value - minValue) / range) * chartHeight;
              return { x, y, value };
            });

            return (
              <g key={`series-${seriesIndex}`}>
                {/* Line */}
                <polyline
                  points={points.map((p) => `${p.x},${p.y}`).join(" ")}
                  fill="none"
                  stroke={color}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="transition-all duration-300"
                />

                {/* Data points */}
                {points.map((point, index) => {
                  const isHovered =
                    hoveredItem?.index === index &&
                    hoveredItem?.seriesIndex === seriesIndex;
                  return (
                    <g
                      key={`point-${index}`}
                      onMouseEnter={() =>
                        setHoveredItem({ seriesIndex, index })
                      }
                      onMouseLeave={() => setHoveredItem(null)}
                    >
                      <circle
                        cx={point.x}
                        cy={point.y}
                        r={isHovered ? 6 : 4}
                        fill={chartColors.cardBg}
                        stroke={color}
                        strokeWidth={isHovered ? 2 : 1.5}
                        className="transition-all duration-200"
                      />

                      {/* Value label */}
                      {showTooltips && isHovered && (
                        <g transform={`translate(${point.x}, ${point.y - 15})`}>
                          <rect
                            x="-20"
                            y="-15"
                            width="40"
                            height="20"
                            rx="4"
                            ry="4"
                            fill={chartColors.cardBg}
                            stroke={chartColors.cardBorder}
                            strokeWidth="1"
                          />
                          <text
                            textAnchor="middle"
                            fill={chartColors.text}
                            fontSize="10"
                            fontWeight="500"
                            dy="-4"
                          >
                            {point.value.toFixed(1)}
                            {unit}
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}
              </g>
            );
          }
        )}

        {/* X-axis labels */}
        {showAxis && labels.length > 0 && (
          <g
            transform={`translate(0, ${
              dimensions.height - padding.bottom + 15
            })`}
          >
            {labels.map((label, index) => (
              <text
                key={`label-${index}`}
                x={padding.left + (index / (labels.length - 1)) * chartWidth}
                y="0"
                textAnchor="middle"
                fill={chartColors.axis}
                fontSize="11"
              >
                {label}
              </text>
            ))}
          </g>
        )}

        {/* Y-axis line */}
        {showAxis && (
          <line
            x1={padding.left}
            y1={padding.top}
            x2={padding.left}
            y2={dimensions.height - padding.bottom}
            stroke={chartColors.axis}
            strokeWidth="1"
          />
        )}

        {/* X-axis line */}
        {showAxis && (
          <line
            x1={padding.left}
            y1={dimensions.height - padding.bottom}
            x2={dimensions.width - padding.right}
            y2={dimensions.height - padding.bottom}
            stroke={chartColors.axis}
            strokeWidth="1"
          />
        )}
      </svg>
    );
  };

  // Render pie chart
  const renderPieChart = () => {
    const { width, height } = dimensions;
    // Ensure the pie chart always fits inside the card, with room for labels
    const size = Math.max(Math.min(width, height) - 60, 180);
    const center = size / 2;
    const radius = Math.min(center - 36, 80); // reduce radius for label space
    const total = animatedData.flat().reduce((sum, value) => sum + value, 0);

    let startAngle = 0;
    const segments = animatedData.flat().map((value, index) => {
      const segmentAngle = total > 0 ? (value / total) * 360 : 0;
      const endAngle = startAngle + segmentAngle;
      const midAngle = startAngle + segmentAngle / 2;

      // Calculate coordinates for arc
      const x1 = center + radius * Math.cos((startAngle * Math.PI) / 180);
      const y1 = center + radius * Math.sin((startAngle * Math.PI) / 180);
      const x2 = center + radius * Math.cos((endAngle * Math.PI) / 180);
      const y2 = center + radius * Math.sin((endAngle * Math.PI) / 180);

      // Large arc flag (1 if angle > 180)
      const largeArcFlag = segmentAngle > 180 ? 1 : 0;

      const pathData = [
        `M ${center} ${center}`,
        `L ${x1} ${y1}`,
        `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
        "Z",
      ].join(" ");

      const segment = {
        pathData,
        color: effectiveColors[index % effectiveColors.length],
        percent: total > 0 ? (value / total) * 100 : 0,
        startAngle,
        endAngle,
        midAngle,
        value,
        label: labels[index] || `Item ${index + 1}`,
      };

      startAngle = endAngle;
      return segment;
    });

    return (
      <div className="flex flex-col items-center justify-center w-full h-full overflow-hidden">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="mx-auto block"
          style={{ overflow: "visible", maxWidth: "100%", maxHeight: "100%" }}
        >
          <defs>
            <radialGradient id="pieGradientBlue" cx="50%" cy="50%" r="80%">
              <stop offset="0%" stopColor="#2596be" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#2596be" stopOpacity="0.6" />
            </radialGradient>
            <radialGradient id="pieGradientGreen" cx="50%" cy="50%" r="80%">
              <stop offset="0%" stopColor="#96be25" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#96be25" stopOpacity="0.6" />
            </radialGradient>
          </defs>
          {segments.map((segment, index) => {
            // Move label outside the slice
            const labelRadius = radius + 24;
            const labelX =
              center +
              labelRadius * Math.cos((segment.midAngle * Math.PI) / 180);
            const labelY =
              center +
              labelRadius * Math.sin((segment.midAngle * Math.PI) / 180);
            const isHovered = hoveredItem?.index === index;
            const gradientId =
              index % 2 === 0 ? "pieGradientBlue" : "pieGradientGreen";

            return (
              <g
                key={`segment-${index}`}
                onMouseEnter={() => setHoveredItem({ index })}
                onMouseLeave={() => setHoveredItem(null)}
                className="transition-all duration-200"
                style={{
                  opacity: isHovered ? 1 : hoveredItem === null ? 1 : 0.7,
                  filter: isHovered
                    ? "drop-shadow(0 4px 16px rgba(37,150,190,0.18))"
                    : "none",
                  cursor: "pointer",
                  transform: isHovered ? "scale(1.04)" : "scale(1)",
                  transition: "transform 0.2s",
                }}
                data-tip={
                  segment.label +
                  ": " +
                  segment.value +
                  " (" +
                  segment.percent.toFixed(1) +
                  "%)"
                }
                data-for={`pie-tooltip-${index}`}
              >
                <path
                  d={segment.pathData}
                  fill={`url(#${gradientId})`}
                  stroke={chartColors.cardBg}
                  strokeWidth="2"
                />

                {/* Percentage label outside, only if inside SVG bounds */}
                {segment.percent > 5 &&
                  labelX > 0 &&
                  labelX < size &&
                  labelY > 0 &&
                  labelY < size && (
                    <text
                      x={labelX}
                      y={labelY}
                      textAnchor={labelX > center ? "start" : "end"}
                      fill={chartColors.text}
                      fontSize="11"
                      fontWeight="500"
                      dominantBaseline="middle"
                      className="bg-white px-2 rounded shadow"
                    >
                      {segment.label}: {segment.percent.toFixed(1)}%
                    </text>
                  )}
              </g>
            );
          })}

          {/* Center text: only percentage or total */}
          <text
            x={center}
            y={center}
            textAnchor="middle"
            fill={chartColors.text}
            fontSize="18"
            fontWeight="700"
            dominantBaseline="middle"
          >
            {total.toFixed(1)}
            {unit}
          </text>
        </svg>
        {/* Tooltips for each slice */}
        {segments.map((segment, index) => (
          <ReactTooltip
            id={`pie-tooltip-${index}`}
            effect="solid"
            backgroundColor={isDarkMode ? "#222" : "#fff"}
            textColor={isDarkMode ? "#fff" : "#222"}
            border={true}
            borderColor="#2596be"
            key={index}
          />
        ))}
      </div>
    );
  };

  // Render legend
  const renderLegend = () => {
    if (!showLegend || labels.length === 0) return null;

    return (
      <div className="flex flex-row flex-wrap justify-center items-center gap-4 mt-8 px-6 py-3 rounded-2xl bg-white/90 dark:bg-gray-800/90 shadow-lg border border-gray-100 dark:border-gray-700 w-fit mx-auto overflow-hidden max-w-full">
        {labels.map((label, index) => {
          const isHovered = hoveredItem?.index === index;
          return (
            <div
              key={`legend-${index}`}
              className="flex items-center px-4 py-2 rounded-xl transition-all duration-200 cursor-pointer shadow-md"
              style={{
                backgroundColor: isHovered
                  ? isDarkMode
                    ? "rgba(37,150,190,0.22)"
                    : "rgba(37,150,190,0.12)"
                  : isDarkMode
                  ? "rgba(255,255,255,0.04)"
                  : "rgba(37,150,190,0.04)",
                border: `2px solid ${
                  effectiveColors[index % effectiveColors.length]
                }`,
                boxShadow: isHovered
                  ? "0 4px 16px rgba(37,150,190,0.12)"
                  : "none",
              }}
              onMouseEnter={() => setHoveredItem({ index })}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <div
                className="w-4 h-4 rounded-full mr-3"
                style={{
                  backgroundColor:
                    effectiveColors[index % effectiveColors.length],
                  opacity: isHovered ? 1 : hoveredItem === null ? 1 : 0.7,
                  border: isHovered ? "2px solid #2596be" : "none",
                }}
              ></div>
              <span
                className={`text-base ${
                  isDarkMode ? "text-gray-100" : "text-gray-800"
                } font-semibold`}
                style={{
                  fontWeight: isHovered ? "700" : "600",
                  letterSpacing: "0.01em",
                }}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  // Render the appropriate chart type
  const renderChart = () => {
    if (data.length === 0 || dimensions.width === 0) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center py-8">
            <svg
              className="w-12 h-12 mx-auto mb-4"
              fill="none"
              stroke={isDarkMode ? "#4b5563" : "#d1d5db"}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className={isDarkMode ? "text-gray-400" : "text-gray-500"}>
              No data available
            </p>
          </div>
        </div>
      );
    }

    switch (type) {
      case "bar":
        return renderBarChart();
      case "line":
        return renderLineChart();
      case "pie":
        return renderPieChart();
      default:
        return (
          <div className="text-center py-10 text-gray-500">
            Unsupported chart type
          </div>
        );
    }
  };

  return (
    <div
      ref={chartRef}
      className={`rounded-2xl border transition-all duration-300 overflow-hidden ${className}`}
      style={{
        height: `${height}px`,
        backgroundColor: chartColors.cardBg,
        borderColor: chartColors.cardBorder,
        boxShadow: isDarkMode
          ? "0 2px 8px rgba(0,0,0,0.18)"
          : "0 2px 8px rgba(37,150,190,0.08)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* SVG pattern background */}
      <svg
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 0,
          opacity: 0.04,
          pointerEvents: "none",
        }}
        width="100%"
        height="100%"
      >
        <defs>
          <pattern
            id="dots"
            x="0"
            y="0"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="20" cy="20" r="1.5" fill="#2596be" fillOpacity="0.12" />
            <circle cx="10" cy="30" r="1.5" fill="#96be25" fillOpacity="0.12" />
            <circle cx="30" cy="10" r="1.5" fill="#2596be" fillOpacity="0.12" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dots)" />
      </svg>
      {/* Header */}
      <div
        className={`px-6 py-4 border-b flex items-center justify-between ${
          isDarkMode ? "border-gray-700" : "border-gray-200"
        }`}
      >
        <h3
          className={`text-lg font-semibold ${
            isDarkMode ? "text-white" : "text-gray-900"
          }`}
        >
          {title}
        </h3>
        <div className="flex items-center space-x-2">
          {unit && (
            <span
              className={`px-2 py-1 rounded-md text-xs ${
                isDarkMode
                  ? "bg-gray-700 text-gray-300"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {unit}
            </span>
          )}
        </div>
      </div>

      {/* Chart Area */}
      <div
        className="flex-1 flex flex-col items-center justify-center px-4 py-6 md:px-8 md:py-8"
        style={{ minHeight: 220 }}
      >
        {renderChart()}
        {renderLegend()}
      </div>
    </div>
  );
};

export default DataChart;
