import React, { useState } from "react";
import PropTypes from "prop-types";
import { Container, Typography } from "./index";
import TestimonialCard from "./TestimonialCard";

/**
 * Testimonials section component for the homepage
 */
const TestimonialsSection = ({
  title,
  subtitle,
  testimonials = [],
  className = "",
}) => {
  const [activeIndex, setActiveIndex] = useState(0);

  // Calculate the number of testimonials to show based on screen size
  // This will be handled by CSS, but we need to know for pagination
  const itemsPerView = 3;
  const totalPages = Math.ceil(testimonials.length / itemsPerView);

  // Navigate to previous page
  const prevPage = () => {
    setActiveIndex((prev) => (prev === 0 ? totalPages - 1 : prev - 1));
  };

  // Navigate to next page
  const nextPage = () => {
    setActiveIndex((prev) => (prev === totalPages - 1 ? 0 : prev + 1));
  };

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

        {/* Testimonials Carousel */}
        <div className="relative">
          {/* Testimonials Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className={`transition-opacity duration-300 ${
                  Math.floor(index / itemsPerView) === activeIndex
                    ? "opacity-100"
                    : "hidden lg:block opacity-0 absolute"
                }`}
              >
                <TestimonialCard
                  quote={testimonial.quote}
                  author={testimonial.author}
                  role={testimonial.role}
                  avatar={testimonial.avatar}
                  rating={testimonial.rating}
                  className="h-full"
                />
              </div>
            ))}
          </div>

          {/* Navigation Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-12 space-x-4">
              {/* Previous Button */}
              <button
                onClick={prevPage}
                className="p-2 rounded-full bg-white border border-gray-200 text-neutral-dark hover:bg-primary-light hover:text-primary transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>

              {/* Pagination Dots */}
              <div className="flex space-x-2">
                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveIndex(index)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      activeIndex === index
                        ? "bg-primary"
                        : "bg-gray-300 hover:bg-primary-light"
                    }`}
                  />
                ))}
              </div>

              {/* Next Button */}
              <button
                onClick={nextPage}
                className="p-2 rounded-full bg-white border border-gray-200 text-neutral-dark hover:bg-primary-light hover:text-primary transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>
      </Container>
    </section>
  );
};

TestimonialsSection.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  testimonials: PropTypes.arrayOf(
    PropTypes.shape({
      quote: PropTypes.string.isRequired,
      author: PropTypes.string.isRequired,
      role: PropTypes.string,
      avatar: PropTypes.string,
      rating: PropTypes.number,
    })
  ).isRequired,
  className: PropTypes.string,
};

export default TestimonialsSection;
