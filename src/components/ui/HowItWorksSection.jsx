import React from "react";
import PropTypes from "prop-types";
import { Container, Typography } from "./index";

/**
 * How It Works section component for the homepage
 */
const HowItWorksSection = ({ title, subtitle, steps = [], className = "" }) => {
  return (
    <section className={`py-16 md:py-24 ${className}`}>
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

        {/* Steps */}
        <div className="relative">
          {/* Connecting Line */}
          <div className="hidden md:block absolute top-24 left-0 right-0 h-1 bg-primary-light" />

          {/* Steps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div
                key={index}
                className="flex flex-col items-center text-center"
              >
                {/* Step Number */}
                <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold mb-6 relative z-10">
                  {index + 1}
                </div>

                {/* Step Title */}
                <Typography variant="h5" className="mb-3">
                  {step.title}
                </Typography>

                {/* Step Description */}
                <Typography variant="body1" color="gray">
                  {step.description}
                </Typography>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
};

HowItWorksSection.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  steps: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
    })
  ).isRequired,
  className: PropTypes.string,
};

export default HowItWorksSection;
