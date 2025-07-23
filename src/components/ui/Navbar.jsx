import React, { useState } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { Button, Container } from "./index";

/**
 * Responsive Navbar component for the homepage
 */
const Navbar = ({
  logo,
  links = [],
  actions = [],
  transparent = false,
  className = "",
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Base classes for navbar
  const baseClasses = "py-4 transition-all duration-300";

  // Variant classes based on transparency
  const variantClasses = transparent
    ? "bg-transparent text-white"
    : "bg-white shadow-sm text-neutral-dark";

  // Combine classes
  const navbarClasses = `
    ${baseClasses}
    ${variantClasses}
    ${className}
  `.trim();

  return (
    <nav className={navbarClasses}>
      <Container>
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center">
              {logo}
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {/* Navigation Links */}
            <div className="flex items-center space-x-6">
              {links.map((link, index) => (
                <Link
                  key={index}
                  to={link.to}
                  className="font-bold hover:text-primary transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-4">
              {actions.map((action, index) => (
                <Button
                  key={index}
                  variant={action.variant || "primary"}
                  size="md"
                  onClick={action.onClick}
                  {...(action.to ? { as: Link, to: action.to } : {})}
                >
                  {action.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-neutral-dark hover:text-primary hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <svg
                  className="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-gray-200 animate-fade-in">
            <div className="flex flex-col space-y-4 pb-4">
              {links.map((link, index) => (
                <Link
                  key={index}
                  to={link.to}
                  className="font-bold hover:text-primary transition-colors px-2 py-1"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="flex flex-col space-y-3 pt-4 border-t border-gray-200">
              {actions.map((action, index) => (
                <Button
                  key={index}
                  variant={action.variant || "primary"}
                  size="md"
                  fullWidth
                  onClick={(e) => {
                    setIsMenuOpen(false);
                    action.onClick && action.onClick(e);
                  }}
                  {...(action.to ? { as: Link, to: action.to } : {})}
                >
                  {action.label}
                </Button>
              ))}
            </div>
          </div>
        )}
      </Container>
    </nav>
  );
};

Navbar.propTypes = {
  logo: PropTypes.node.isRequired,
  links: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      to: PropTypes.string.isRequired,
    })
  ),
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      variant: PropTypes.string,
      to: PropTypes.string,
      onClick: PropTypes.func,
    })
  ),
  transparent: PropTypes.bool,
  className: PropTypes.string,
};

export default Navbar;
