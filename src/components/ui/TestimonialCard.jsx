import React from "react";
import PropTypes from "prop-types";
import { Card, Typography } from "./index";

/**
 * TestimonialCard component for displaying user testimonials
 */
const TestimonialCard = ({
  quote,
  author,
  role,
  avatar,
  rating = 5,
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
      {/* Rating Stars */}
      <div className="flex mb-4 text-accent">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            className={`w-5 h-5 ${
              i < rating ? "text-accent" : "text-gray-300"
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>

      {/* Quote */}
      <Typography variant="body1" className="mb-6 italic">
        "{quote}"
      </Typography>

      {/* Author Info */}
      <div className="flex items-center">
        {avatar && (
          <div className="mr-4">
            <img
              src={avatar}
              alt={author}
              className="w-12 h-12 rounded-full object-cover"
            />
          </div>
        )}

        <div>
          <Typography variant="subtitle2" className="mb-1">
            {author}
          </Typography>

          {role && (
            <Typography variant="caption" color="gray">
              {role}
            </Typography>
          )}
        </div>
      </div>
    </Card>
  );
};

TestimonialCard.propTypes = {
  quote: PropTypes.string.isRequired,
  author: PropTypes.string.isRequired,
  role: PropTypes.string,
  avatar: PropTypes.string,
  rating: PropTypes.number,
  className: PropTypes.string,
};

export default TestimonialCard;
