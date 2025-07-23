import React from "react";
import PropTypes from "prop-types";
import { Card, Typography } from "./index";

/**
 * FeatureCard component for displaying features with icons
 */
const FeatureCard = ({
  icon,
  title,
  description,
  className = "",
  ...props
}) => {
  return (
    <Card
      variant="default"
      padding="lg"
      className={`transition-all duration-300 hover:shadow-lg ${className}`}
      {...props}
    >
      {/* Icon */}
      <div className="mb-6 text-primary">{icon}</div>

      {/* Title */}
      <Typography variant="h5" className="mb-3">
        {title}
      </Typography>

      {/* Description */}
      <Typography variant="body1" color="gray">
        {description}
      </Typography>
    </Card>
  );
};

FeatureCard.propTypes = {
  icon: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  className: PropTypes.string,
};

export default FeatureCard;
