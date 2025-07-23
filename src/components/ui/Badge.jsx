import React from "react";
import PropTypes from "prop-types";

/**
 * Badge component for status indicators and labels
 */
const Badge = ({
  children,
  variant = "default",
  size = "md",
  className = "",
  ...props
}) => {
  // Base classes for all badges
  const baseClasses =
    "inline-flex items-center justify-center font-bold rounded-full";

  // Variant specific classes
  const variantClasses = {
    default: "bg-gray-100 text-gray-800",
    primary: "bg-primary-light text-primary",
    accent: "bg-accent-light text-accent",
    success: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800",
    error: "bg-red-100 text-red-800",
    info: "bg-blue-100 text-blue-800",
  };

  // Size specific classes
  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-0.5",
    lg: "text-base px-3 py-1",
  };

  // Combine all classes
  const badgeClasses = `
    ${baseClasses}
    ${variantClasses[variant] || variantClasses.default}
    ${sizeClasses[size] || sizeClasses.md}
    ${className}
  `.trim();

  return (
    <span className={badgeClasses} {...props}>
      {children}
    </span>
  );
};

Badge.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf([
    "default",
    "primary",
    "accent",
    "success",
    "warning",
    "error",
    "info",
  ]),
  size: PropTypes.oneOf(["sm", "md", "lg"]),
  className: PropTypes.string,
};

export default Badge;
