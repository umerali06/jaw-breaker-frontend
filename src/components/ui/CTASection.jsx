import React from "react";
import PropTypes from "prop-types";
import { Container, Typography, Button } from "./index";

/**
 * Call to Action section component for the homepage
 */
const CTASection = ({
  title,
  subtitle,
  buttonText,
  buttonLink,
  onClick,
  className = "",
}) => {
  return (
    <section className={`py-16 md:py-24 bg-primary ${className}`}>
      <Container>
        <div className="text-center">
          {/* Title */}
          <Typography variant="h2" color="white" className="mb-4">
            {title}
          </Typography>

          {/* Subtitle */}
          {subtitle && (
            <Typography
              variant="subtitle1"
              color="white"
              className="mb-8 opacity-90 max-w-3xl mx-auto"
            >
              {subtitle}
            </Typography>
          )}

          {/* CTA Button */}
          <Button
            variant="accent"
            size="xl"
            onClick={onClick}
            {...(buttonLink ? { as: "a", href: buttonLink } : {})}
            className="shadow-xl"
          >
            {buttonText}
          </Button>
        </div>
      </Container>
    </section>
  );
};

CTASection.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  buttonText: PropTypes.string.isRequired,
  buttonLink: PropTypes.string,
  onClick: PropTypes.func,
  className: PropTypes.string,
};

export default CTASection;
