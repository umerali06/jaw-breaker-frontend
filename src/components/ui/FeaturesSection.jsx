import React from "react";
import PropTypes from "prop-types";
import { Container, Typography } from "./index";
import FeatureCard from "./FeatureCard";

/**
 * Features section component for the homepage
 */
const FeaturesSection = ({
  title,
  subtitle,
  features = [],
  className = "",
}) => {
  return (
    <section className={`py-16 md:py-24 bg-neutral-light ${className}`}>
      <Container>
        {/* Section Header */}
        <div className="text-center mb-16">
          <Typography variant="h2" className="mb-4">
            {title}
          </Typography>

          {subtitle && (
            <Typography
              variant="subtitle1"
              color="gray"
              className="max-w-3xl mx-auto"
            >
              {subtitle}
            </Typography>
          )}
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              className="h-full"
            />
          ))}
        </div>
      </Container>
    </section>
  );
};

FeaturesSection.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  features: PropTypes.arrayOf(
    PropTypes.shape({
      icon: PropTypes.node.isRequired,
      title: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
    })
  ).isRequired,
  className: PropTypes.string,
};

export default FeaturesSection;
