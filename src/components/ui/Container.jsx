import React from "react";
import PropTypes from "prop-types";

/**
 * Container component for consistent page layout
 */
const Container = ({
  children,
  size = "default",
  className = "",
  ...props
}) => {
  // Base classes for all containers
  const baseClasses = "mx-auto px-4 sm:px-6 lg:px-8";

  // Size specific classes
  const sizeClasses = {
    sm: "max-w-3xl",
    default: "max-w-7xl",
    lg: "max-w-screen-2xl",
    full: "max-w-full",
  };

  // Combine all classes
  const containerClasses = `
    ${baseClasses}
    ${sizeClasses[size] || sizeClasses.default}
    ${className}
  `.trim();

  return (
    <div className={containerClasses} {...props}>
      {children}
    </div>
  );
};

Container.propTypes = {
  children: PropTypes.node.isRequired,
  size: PropTypes.oneOf(["sm", "default", "lg", "full"]),
  className: PropTypes.string,
};

export default Container;
