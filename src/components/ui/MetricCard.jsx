import React, { useState } from "react";
import PropTypes from "prop-types";
import { Card, Typography } from "./index";

/**
 * MetricCard component for displaying key metrics in the dashboard
 */
const MetricCard = ({
  title,
  value,
  icon,
  trend,
  trendValue,
  chart,
  variant = "default",
  className = "",
  onClick,
  ...props
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Determine trend color
  const getTrendColor = () => {
    if (!trend) return "";

    switch (trend) {
      case "up":
        return "text-green-600";
      case "down":
        return "text-red-600";
      default:
        return "text-gray-500";
    }
  };

  // Determine trend icon
  const getTrendIcon = () => {
    if (!trend) return null;

    switch (trend) {
      case "up":
        return (
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 15l7-7 7 7"
            />
          </svg>
        );
      case "down":
        return (
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  // Determine background gradient based on trend
  const getBackgroundGradient = () => {
    if (!trend) return "";

    switch (trend) {
      case "up":
        return isHovered ? "bg-gradient-to-br from-white to-green-50" : "";
      case "down":
        return isHovered ? "bg-gradient-to-br from-white to-red-50" : "";
      default:
        return isHovered ? "bg-gradient-to-br from-white to-gray-50" : "";
    }
  };

  return (
    <Card
      variant={variant}
      padding="lg"
      className={`
        transition-all duration-300 
        hover:shadow-lg 
        ${getBackgroundGradient()}
        ${onClick ? "cursor-pointer" : ""}
        ${className}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      {...props}
    >
      <div className="flex items-start justify-between mb-4">
        {/* Title with animated underline on hover */}
        <div className="relative">
          <Typography variant="subtitle2" color="gray">
            {title}
          </Typography>
          {isHovered && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary transform origin-left animate-slideIn"></div>
          )}
        </div>

        {/* Icon with animation */}
        {icon && (
          <div
            className={`text-primary transition-transform duration-300 ${
              isHovered ? "scale-110" : ""
            }`}
          >
            {icon}
          </div>
        )}
      </div>

      {/* Value with animation */}
      <Typography
        variant="h3"
        className={`mb-2 transition-all duration-300 ${
          isHovered ? "text-primary" : ""
        }`}
      >
        {value}
      </Typography>

      {/* Trend */}
      {(trend || trendValue) && (
        <div className="flex items-center">
          {trend && (
            <span className={`flex items-center ${getTrendColor()}`}>
              <span
                className={`transition-transform duration-300 ${
                  isHovered ? "transform translate-y-[-2px]" : ""
                }`}
              >
                {getTrendIcon()}
              </span>
              {trendValue && (
                <Typography variant="caption" className="ml-1">
                  {trendValue}
                </Typography>
              )}
            </span>
          )}
        </div>
      )}

      {/* Chart with animation */}
      {chart && (
        <div
          className={`mt-4 transition-opacity duration-300 ${
            isHovered ? "opacity-100" : "opacity-80"
          }`}
        >
          {chart}
        </div>
      )}

      {/* Optional hover indicator */}
      {onClick && isHovered && (
        <div className="absolute bottom-2 right-2 text-primary opacity-70">
          <svg
            className="w-4 h-4"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      )}
    </Card>
  );
};

MetricCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.node,
  trend: PropTypes.oneOf(["up", "down", "neutral"]),
  trendValue: PropTypes.string,
  chart: PropTypes.node,
  variant: PropTypes.string,
  className: PropTypes.string,
  onClick: PropTypes.func,
};

export default MetricCard;
