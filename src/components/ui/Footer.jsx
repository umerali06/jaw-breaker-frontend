import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { Container, Typography } from "./index";

/**
 * Footer component for the website
 */
const Footer = ({
  logo,
  description,
  links = [],
  socialLinks = [],
  copyright,
  className = "",
}) => {
  return (
    <footer className={`bg-neutral-light py-12 md:py-16 ${className}`}>
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Logo and Description */}
          <div>
            <div className="mb-4">{logo}</div>
            {description && (
              <Typography variant="body2" color="gray" className="mb-6">
                {description}
              </Typography>
            )}

            {/* Social Links */}
            {socialLinks.length > 0 && (
              <div className="flex space-x-4">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-500 hover:text-primary transition-colors"
                    aria-label={social.name}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Link Columns */}
          {links.map((column, columnIndex) => (
            <div key={columnIndex}>
              <Typography variant="subtitle2" className="mb-4">
                {column.title}
              </Typography>

              <ul className="space-y-3">
                {column.items.map((item, itemIndex) => (
                  <li key={itemIndex}>
                    <Link
                      to={item.to}
                      className="text-gray-500 hover:text-primary transition-colors font-bold"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-gray-200 text-center md:text-left">
          <Typography variant="caption" color="gray">
            {copyright ||
              `© ${new Date().getFullYear()} Jawbreaker. All rights reserved.`}
          </Typography>
        </div>
      </Container>
    </footer>
  );
};

Footer.propTypes = {
  logo: PropTypes.node.isRequired,
  description: PropTypes.string,
  links: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      items: PropTypes.arrayOf(
        PropTypes.shape({
          label: PropTypes.string.isRequired,
          to: PropTypes.string.isRequired,
        })
      ).isRequired,
    })
  ),
  socialLinks: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      url: PropTypes.string.isRequired,
      icon: PropTypes.node.isRequired,
    })
  ),
  copyright: PropTypes.string,
  className: PropTypes.string,
};

export default Footer;
