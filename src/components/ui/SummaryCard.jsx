import React from "react";
import PropTypes from "prop-types";
import { Card, Typography } from "./index";

/**
 * SummaryCard component for displaying summary information with an icon
 */
const SummaryCard = ({
  title,
  value,
  icon,
  description,
  footer,
  color = "primary",
  variant = "default",
  className = "",
  onClick,
  ...props
}) => {
  // Determine color classes
  const getColorClasses = () => {
    switch (color) {
      case "primary":
        return {
          icon: "text-primary bg-primary-light",
          text: "text-primary",
          border: "border-primary",
        };
      case "accent":
        return {
          icon: "text-accent bg-accent-light",
          text: "text-accent",
          border: "border-accent",
        };
      case "success":
        return {
          icon: "text-green-600 bg-green-100",
          text: "text-green-600",
          border: "border-green-500",
        };
      case "warning":
        return {
          icon: "text-yellow-600 bg-yellow-100",
          text: "text-yellow-600",
          border: "border-yellow-500",
        };
      case "error":
        return {
          icon: "text-red-600 bg-red-100",
          text: "text-red-600",
          border: "border-red-500",
        };
      case "info":
        return {
          icon: "text-blue-600 bg-blue-100",
          text: "text-blue-600",
          border: "border-blue-500",
        };
      default:
        return {
          icon: "text-primary bg-primary-light",
          text: "text-primary",
          border: "border-primary",
        };
    }
  };

  const colorClasses = getColorClasses();

  return (
    <Card
      variant={variant}
      padding="lg"
      className={`
        transition-all duration-300 
        hover:shadow-lg 
        ${onClick ? "cursor-pointer" : ""}
        ${className}
      `}
      onClick={onClick}
      {...props}
    >
      <div className="flex items-start">
        {/* Icon */}
        {icon && (
          <div className={`p-3 rounded-lg ${colorClasses.icon} mr-4`}>
            {icon}
          </div>
        )}

        <div className="flex-1">
          {/* Title */}
          <Typography variant="subtitle2" color="gray" className="mb-1">
            {title}
          </Typography>

          {/* Value */}
          <Typography variant="h4" className="mb-1">
            {value}
          </Typography>

          {/* Description */}
          {description && (
            <Typography variant="body2" color="gray" className="mb-2">
              {description}
            </Typography>
          )}

          {/* Footer */}
          {footer && (
            <div className="mt-3 pt-3 border-t border-gray-100">{footer}</div>
          )}
        </div>
      </div>
    </Card>
  );
};

SummaryCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.node,
  ]).isRequired,
  icon: PropTypes.node,
  description: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  footer: PropTypes.node,
  color: PropTypes.oneOf([
    "primary",
    "accent",
    "success",
    "warning",
    "error",
    "info",
  ]),
  variant: PropTypes.string,
  className: PropTypes.string,
  onClick: PropTypes.func,
};

export default SummaryCard;
