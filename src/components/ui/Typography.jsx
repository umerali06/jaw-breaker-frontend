import React from "react";
import PropTypes from "prop-types";

/**
 * Typography component for consistent text styling
 */
const Typography = ({
  variant = "body1",
  component,
  color = "default",
  align = "left",
  className = "",
  children,
  ...props
}) => {
  // Variant specific classes and default component
  const variantMap = {
    h1: {
      component: "h1",
      className: "text-4xl sm:text-5xl font-bold",
    },
    h2: {
      component: "h2",
      className: "text-3xl sm:text-4xl font-bold",
    },
    h3: {
      component: "h3",
      className: "text-2xl sm:text-3xl font-bold",
    },
    h4: {
      component: "h4",
      className: "text-xl sm:text-2xl font-bold",
    },
    h5: {
      component: "h5",
      className: "text-lg sm:text-xl font-bold",
    },
    h6: {
      component: "h6",
      className: "text-base sm:text-lg font-bold",
    },
    subtitle1: {
      component: "h6",
      className: "text-lg font-bold",
    },
    subtitle2: {
      component: "h6",
      className: "text-base font-bold",
    },
    body1: {
      component: "p",
      className: "text-base font-bold",
    },
    body2: {
      component: "p",
      className: "text-sm font-bold",
    },
    caption: {
      component: "span",
      className: "text-xs font-bold",
    },
    overline: {
      component: "span",
      className: "text-xs uppercase tracking-wider font-bold",
    },
  };

  // Color classes
  const colorClasses = {
    default: "text-neutral-dark",
    primary: "text-primary",
    accent: "text-accent",
    light: "text-neutral-light",
    white: "text-white",
    gray: "text-gray-500",
  };

  // Text alignment classes
  const alignClasses = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
    justify: "text-justify",
  };

  // Get the component to render
  const Component = component || variantMap[variant].component;

  // Combine all classes
  const typographyClasses = `
    ${variantMap[variant].className}
    ${colorClasses[color]}
    ${alignClasses[align]}
    ${className}
  `.trim();

  return (
    <Component className={typographyClasses} {...props}>
      {children}
    </Component>
  );
};

Typography.propTypes = {
  variant: PropTypes.oneOf([
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "subtitle1",
    "subtitle2",
    "body1",
    "body2",
    "caption",
    "overline",
  ]),
  component: PropTypes.elementType,
  color: PropTypes.oneOf([
    "default",
    "primary",
    "accent",
    "light",
    "white",
    "gray",
  ]),
  align: PropTypes.oneOf(["left", "center", "right", "justify"]),
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
};

export default Typography;
