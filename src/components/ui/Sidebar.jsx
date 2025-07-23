import React, { useState } from "react";
import PropTypes from "prop-types";
import { Link, useLocation } from "react-router-dom";
import { Typography } from "./index";

/**
 * Sidebar component for the dashboard
 */
const Sidebar = ({
  logo,
  menuItems = [],
  userProfile,
  isCollapsed = false,
  onToggleCollapse,
  className = "",
}) => {
  const location = useLocation();
  const [isCollapsedState, setIsCollapsedState] = useState(isCollapsed);

  // Toggle sidebar collapse state
  const toggleCollapse = () => {
    const newState = !isCollapsedState;
    setIsCollapsedState(newState);
    if (onToggleCollapse) {
      onToggleCollapse(newState);
    }
  };

  return (
    <aside
      className={`
        bg-primary text-white flex flex-col h-screen transition-all duration-300
        ${isCollapsedState ? "w-20" : "w-64"}
        ${className}
      `}
    >
      {/* Logo */}
      <div className="p-4 flex items-center justify-between border-b border-primary-dark">
        <Link to="/dashboard" className="flex items-center">
          {isCollapsedState ? (
            <div className="w-12 h-12 flex items-center justify-center">
              {typeof logo === "function" ? logo(true) : logo}
            </div>
          ) : (
            <div>{typeof logo === "function" ? logo(false) : logo}</div>
          )}
        </Link>

        {/* Collapse Toggle Button */}
        <button
          onClick={toggleCollapse}
          className="text-white p-1 rounded-md hover:bg-primary-dark transition-colors"
        >
          {isCollapsedState ? (
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
                d="M13 5l7 7-7 7M5 5l7 7-7 7"
              />
            </svg>
          ) : (
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
                d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {menuItems.map((item, index) => {
            const isActive = location.pathname === item.to;

            return (
              <li key={index}>
                <Link
                  to={item.to}
                  className={`
                    flex items-center px-3 py-3 rounded-lg transition-colors
                    ${
                      isActive
                        ? "bg-accent text-white"
                        : "text-white hover:bg-primary-dark"
                    }
                  `}
                >
                  {/* Icon */}
                  <div className={isCollapsedState ? "mx-auto" : "mr-3"}>
                    {item.icon}
                  </div>

                  {/* Label */}
                  {!isCollapsedState && (
                    <Typography variant="body1" className="whitespace-nowrap">
                      {item.label}
                    </Typography>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Profile */}
      {userProfile && (
        <div className="p-4 border-t border-primary-dark">
          <div className="flex items-center">
            {/* Avatar */}
            <div className={`${isCollapsedState ? "mx-auto" : "mr-3"}`}>
              {typeof userProfile.avatar === "string" ? (
                <img
                  src={userProfile.avatar}
                  alt={userProfile.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                userProfile.avatar
              )}
            </div>

            {/* User Info */}
            {!isCollapsedState && (
              <div className="flex-1 min-w-0">
                <Typography variant="subtitle2" className="truncate">
                  {userProfile.name}
                </Typography>
                {userProfile.role && (
                  <Typography variant="caption" className="opacity-75 truncate">
                    {userProfile.role}
                  </Typography>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </aside>
  );
};

Sidebar.propTypes = {
  logo: PropTypes.oneOfType([PropTypes.node, PropTypes.func]).isRequired,
  menuItems: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      icon: PropTypes.node.isRequired,
      to: PropTypes.string.isRequired,
    })
  ).isRequired,
  userProfile: PropTypes.shape({
    name: PropTypes.string.isRequired,
    role: PropTypes.string,
    avatar: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
  }),
  isCollapsed: PropTypes.bool,
  onToggleCollapse: PropTypes.func,
  className: PropTypes.string,
};

export default Sidebar;
