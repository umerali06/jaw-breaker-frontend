import React from "react";
import { useTheme } from "../../contexts/ThemeContext";

const StatusCard = ({
  title,
  value,
  icon,
  color = "primary",
  className = "",
}) => {
  const { isDarkMode } = useTheme();

  // Map color names to our branding colors
  const getColorClasses = (colorName) => {
    switch (colorName) {
      case "primary":
        return {
          bg: "bg-primary-custom bg-opacity-10",
          text: "text-primary-custom",
          iconBg: "bg-primary-custom",
          iconText: "text-white",
          border: "border-primary-custom",
        };
      case "secondary":
        return {
          bg: "bg-secondary-custom bg-opacity-10",
          text: "text-secondary-custom",
          iconBg: "bg-secondary-custom",
          iconText: "text-white",
          border: "border-secondary-custom",
        };
      case "yellow":
        return {
          bg: "bg-yellow-100",
          text: "text-yellow-800",
          iconBg: "bg-yellow-500",
          iconText: "text-white",
          border: "border-yellow-500",
        };
      case "red":
        return {
          bg: "bg-red-100",
          text: "text-red-800",
          iconBg: "bg-red-500",
          iconText: "text-white",
          border: "border-red-500",
        };
      default:
        return {
          bg: "bg-primary-custom bg-opacity-10",
          text: "text-primary-custom",
          iconBg: "bg-primary-custom",
          iconText: "text-white",
          border: "border-primary-custom",
        };
    }
  };

  const colorClasses = getColorClasses(color);

  return (
    <div
      className={`rounded-xl border shadow-md hover:shadow-lg transition-all duration-300 ${
        isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
      } ${className} border-l-4 ${colorClasses.border}`}
    >
      <div className="p-6">
        <div className="flex items-center">
          <div className={`p-3 rounded-lg ${colorClasses.iconBg}`}>
            <svg
              className={`w-6 h-6 ${colorClasses.iconText}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={icon}
              />
            </svg>
          </div>
          <div className="ml-4">
            <p
              className={`text-sm font-bold ${
                isDarkMode ? "text-gray-300" : "text-gray-600"
              }`}
            >
              {title}
            </p>
            <p className={`text-2xl font-bold ${colorClasses.text}`}>{value}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusCard;
