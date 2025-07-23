import React from "react";
import PropTypes from "prop-types";
import { Container, Typography, Button } from "./index";

/**
 * Hero component for the homepage
 */
const Hero = ({
  title,
  subtitle,
  primaryCTA,
  secondaryCTA,
  image,
  className = "",
}) => {
  return (
    <section className={`py-12 md:py-20 ${className}`}>
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="animate-fade-in">
            <Typography variant="h1" className="mb-6">
              {title}
            </Typography>

            <Typography variant="subtitle1" color="gray" className="mb-8">
              {subtitle}
            </Typography>

            <div className="flex flex-col sm:flex-row gap-4">
              {primaryCTA && (
                <Button
                  variant="accent"
                  size="lg"
                  onClick={primaryCTA.onClick}
                  {...(primaryCTA.to ? { as: "a", href: primaryCTA.to } : {})}
                >
                  {primaryCTA.label}
                </Button>
              )}

              {secondaryCTA && (
                <Button
                  variant="outline"
                  size="lg"
                  onClick={secondaryCTA.onClick}
                  {...(secondaryCTA.to
                    ? { as: "a", href: secondaryCTA.to }
                    : {})}
                >
                  {secondaryCTA.label}
                </Button>
              )}
            </div>
          </div>

          {/* Image */}
          <div className="animate-fade-in animation-delay-300">{image}</div>
        </div>
      </Container>
    </section>
  );
};

Hero.propTypes = {
  title: PropTypes.node.isRequired,
  subtitle: PropTypes.node.isRequired,
  primaryCTA: PropTypes.shape({
    label: PropTypes.string.isRequired,
    to: PropTypes.string,
    onClick: PropTypes.func,
  }),
  secondaryCTA: PropTypes.shape({
    label: PropTypes.string.isRequired,
    to: PropTypes.string,
    onClick: PropTypes.func,
  }),
  image: PropTypes.node.isRequired,
  className: PropTypes.string,
};

export default Hero;
