import React from "react";
import PropTypes from "prop-types";

/**
 * Button component with various variants and sizes
 */
const Button = ({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  disabled = false,
  type = "button",
  onClick,
  className = "",
  ...props
}) => {
  // Base classes for all buttons
  const baseClasses =
    "inline-flex items-center justify-center font-bold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";

  // Variant specific classes
  const variantClasses = {
    primary:
      "bg-primary text-white hover:bg-primary-dark focus:ring-primary shadow-button",
    accent:
      "bg-accent text-white hover:bg-accent-dark focus:ring-accent shadow-accent-button",
    outline:
      "border-2 border-primary text-primary hover:bg-primary-light focus:ring-primary",
    "outline-accent":
      "border-2 border-accent text-accent hover:bg-accent-light focus:ring-accent",
    ghost: "text-primary hover:bg-primary-light focus:ring-primary",
    "ghost-accent": "text-accent hover:bg-accent-light focus:ring-accent",
    white:
      "bg-white text-neutral-dark border border-gray-200 hover:bg-gray-50 focus:ring-gray-200",
  };

  // Size specific classes
  const sizeClasses = {
    sm: "text-sm px-3 py-1.5 rounded-lg",
    md: "text-base px-4 py-2 rounded-lg",
    lg: "text-lg px-6 py-3 rounded-xl",
    xl: "text-xl px-8 py-4 rounded-xl",
  };

  // Width classes
  const widthClasses = fullWidth ? "w-full" : "";

  // Disabled classes
  const disabledClasses = disabled
    ? "opacity-50 cursor-not-allowed"
    : "cursor-pointer";

  // Combine all classes
  const buttonClasses = `
    ${baseClasses}
    ${variantClasses[variant] || variantClasses.primary}
    ${sizeClasses[size] || sizeClasses.md}
    ${widthClasses}
    ${disabledClasses}
    ${className}
  `.trim();

  return (
    <button
      type={type}
      className={buttonClasses}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf([
    "primary",
    "accent",
    "outline",
    "outline-accent",
    "ghost",
    "ghost-accent",
    "white",
  ]),
  size: PropTypes.oneOf(["sm", "md", "lg", "xl"]),
  fullWidth: PropTypes.bool,
  disabled: PropTypes.bool,
  type: PropTypes.oneOf(["button", "submit", "reset"]),
  onClick: PropTypes.func,
  className: PropTypes.string,
};

export default Button;
