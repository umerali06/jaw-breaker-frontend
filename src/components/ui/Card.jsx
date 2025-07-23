import React from "react";
import PropTypes from "prop-types";

/**
 * Card component for displaying content in a contained box
 */
const Card = ({
  children,
  variant = "default",
  padding = "default",
  className = "",
  ...props
}) => {
  // Base classes for all cards
  const baseClasses =
    "rounded-xl overflow-hidden transition-shadow duration-200";

  // Variant specific classes
  const variantClasses = {
    default: "bg-white border border-gray-200 shadow-card",
    elevated: "bg-white shadow-lg",
    flat: "bg-white border border-gray-200",
    primary: "bg-primary-light border border-primary",
    accent: "bg-accent-light border border-accent",
  };

  // Padding classes
  const paddingClasses = {
    none: "",
    sm: "p-3",
    default: "p-6",
    lg: "p-8",
  };

  // Combine all classes
  const cardClasses = `
    ${baseClasses}
    ${variantClasses[variant] || variantClasses.default}
    ${paddingClasses[padding] || paddingClasses.default}
    ${className}
  `.trim();

  return (
    <div className={cardClasses} {...props}>
      {children}
    </div>
  );
};

Card.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf([
    "default",
    "elevated",
    "flat",
    "primary",
    "accent",
  ]),
  padding: PropTypes.oneOf(["none", "sm", "default", "lg"]),
  className: PropTypes.string,
};

export default Card;
