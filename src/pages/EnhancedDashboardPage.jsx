import React, { useState, useEffect } from "react";
import {
  Sidebar,
  DashboardHeader,
  Container,
  Typography,
  Button,
  MetricCard,
  DataChart,
  DashboardOverview,
} from "../components/ui";
import { useNavigate, useLocation } from "react-router-dom";

// Sample logo component
const Logo = (isCollapsed) => (
  <div className="flex items-center">
    {isCollapsed ? (
      <svg
        className="w-10 h-10 text-white"
        fill="currentColor"
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clipRule="evenodd"
        />
      </svg>
    ) : (
      <>
        <svg
          className="w-10 h-10 text-white"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
        <span className="ml-2 text-xl font-bold text-white">Jawbreaker</span>
      </>
    )}
  </div>
); // Sample
// menu icons
const DashboardIcon = () => (
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
      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
    />
  </svg>
);

const DocumentsIcon = () => (
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
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
);

const PatientsIcon = () => (
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
      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
    />
  </svg>
);

const AnalyticsIcon = () => (
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
      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
    />
  </svg>
);

const SettingsIcon = () => (
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
      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);

// Sample user avatar
const UserAvatar = () => (
  <div className="w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center font-bold">
    DR
  </div>
);

// Sample chart data
const getChartData = (type) => {
  switch (type) {
    case "documents":
      return [
        { label: "Mon", value: 12 },
        { label: "Tue", value: 19 },
        { label: "Wed", value: 15 },
        { label: "Thu", value: 22 },
        { label: "Fri", value: 30 },
        { label: "Sat", value: 18 },
        { label: "Sun", value: 14 },
      ];
    case "analyzed":
      return [
        { label: "Mon", value: 10 },
        { label: "Tue", value: 15 },
        { label: "Wed", value: 13 },
        { label: "Thu", value: 18 },
        { label: "Fri", value: 25 },
        { label: "Sat", value: 15 },
        { label: "Sun", value: 12 },
      ];
    default:
      return [];
  }
};

const EnhancedDashboardPage = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  // Track window width for responsive behavior
  const [, setWindowWidth] = useState(window.innerWidth);
  const navigate = useNavigate();
  const location = useLocation();

  // Handle responsive sidebar collapse
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      if (window.innerWidth < 768) {
        setSidebarCollapsed(true);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Initialize on mount

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Determine active section based on URL
  const getActiveSection = () => {
    const path = location.pathname;
    if (path.includes("/documents")) return "documents";
    if (path.includes("/patients")) return "patients";
    if (path.includes("/analytics")) return "analytics";
    if (path.includes("/settings")) return "settings";
    return "dashboard";
  };

  const activeSection = getActiveSection();

  // Handle quick action button click
  const handleQuickAction = (action) => {
    if (action === "upload") {
      // Scroll to upload section or open upload modal
      const uploadSection = document.getElementById("upload-section");
      if (uploadSection) {
        uploadSection.scrollIntoView({ behavior: "smooth" });
      }
    } else if (action === "new") {
      // Navigate to new document page or open new document modal
      console.log("Create new document");
    }
  };

  // Sidebar menu items
  const menuItems = [
    {
      label: "Dashboard",
      icon: <DashboardIcon />,
      to: "/dashboard",
    },
    {
      label: "Documents",
      icon: <DocumentsIcon />,
      to: "/dashboard/documents",
    },
    {
      label: "Patients",
      icon: <PatientsIcon />,
      to: "/dashboard/patients",
    },
    {
      label: "Analytics",
      icon: <AnalyticsIcon />,
      to: "/dashboard/analytics",
    },
    {
      label: "Settings",
      icon: <SettingsIcon />,
      to: "/dashboard/settings",
    },
  ];

  // User profile for sidebar
  const userProfile = {
    name: "Dr. Robert Smith",
    role: "Family Physician",
    avatar: <UserAvatar />,
  };

  // Header actions
  const headerActions = [
    {
      icon: (
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
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      ),
      label: "Search",
      onClick: () => console.log("Search clicked"),
    },
    {
      icon: (
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
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          />
        </svg>
      ),
      label: "New Document",
      onClick: () => console.log("New Document clicked"),
    },
  ];

  // Sample notifications
  const notifications = [
    {
      id: 1,
      title: "New document uploaded",
      time: "5 minutes ago",
    },
    {
      id: 2,
      title: "Analysis completed",
      time: "1 hour ago",
    },
  ];

  // User menu component
  const userMenu = (
    <div className="flex items-center">
      <div className="mr-3 text-right hidden sm:block">
        <Typography variant="subtitle2">{userProfile.name}</Typography>
        <Typography variant="caption" color="gray">
          {userProfile.role}
        </Typography>
      </div>
      {userProfile.avatar}
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 transition-all duration-300">
      {/* Sidebar - with enhanced animation */}
      <Sidebar
        logo={Logo}
        menuItems={menuItems}
        userProfile={userProfile}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={setSidebarCollapsed}
        className="shadow-lg z-20 transition-all duration-300"
      />

      {/* Main Content - with responsive adjustments */}
      <div className="flex-1 flex flex-col overflow-hidden transition-all duration-300">
        {/* Header - with enhanced styling */}
        <DashboardHeader
          title={activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
          breadcrumbs={[
            { label: "Dashboard", to: "/dashboard" },
            activeSection !== "dashboard"
              ? {
                  label:
                    activeSection.charAt(0).toUpperCase() +
                    activeSection.slice(1),
                  to: `/dashboard/${activeSection}`,
                }
              : null,
          ].filter(Boolean)}
          actions={headerActions}
          notifications={notifications}
          userMenu={userMenu}
          className="shadow-md z-10"
        />

        {/* Content - with enhanced styling and animations */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50">
          <Container className="animate-fadeIn">
            {/* Dashboard Title */}
            <div className="mb-6">
              <Typography variant="h4" className="mb-2">
                Dashboard Overview
              </Typography>
              <Typography variant="body1" color="gray">
                Welcome back! Here's a summary of your clinical documentation.
              </Typography>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap gap-3 mb-8">
              <Button
                variant="primary"
                className="flex items-center gap-2"
                onClick={() => handleQuickAction("upload")}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                Upload Document
              </Button>

              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => handleQuickAction("new")}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                New Document
              </Button>
            </div>

            {/* Metrics - with enhanced animations and styling */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
              <MetricCard
                title="Total Documents"
                value="120"
                icon={
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                }
                trend="up"
                trendValue="+12% this month"
                chart={
                  <DataChart
                    data={getChartData("documents")}
                    type="bar"
                    height="h-12"
                  />
                }
                className="transform transition-all duration-300 hover:translate-y-[-4px]"
                onClick={() => navigate("/dashboard/documents")}
              />

              <MetricCard
                title="Analyzed Documents"
                value="98"
                icon={
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                    />
                  </svg>
                }
                trend="up"
                trendValue="+8% this month"
                chart={
                  <DataChart
                    data={getChartData("analyzed")}
                    type="area"
                    color="accent"
                    height="h-12"
                  />
                }
                className="transform transition-all duration-300 hover:translate-y-[-4px]"
                onClick={() => navigate("/dashboard/documents?filter=analyzed")}
              />

              <MetricCard
                title="Pending Documents"
                value="12"
                icon={
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                }
                chart={
                  <DataChart
                    data={getChartData("pending")}
                    type="line"
                    color="primary"
                    height="h-12"
                  />
                }
                className="transform transition-all duration-300 hover:translate-y-[-4px]"
                onClick={() => navigate("/dashboard/documents?filter=pending")}
              />

              <MetricCard
                title="Error Documents"
                value="10"
                icon={
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                }
                trend="down"
                trendValue="-5% this month"
                chart={
                  <DataChart
                    data={getChartData("errors")}
                    type="bar"
                    color="gray"
                    height="h-12"
                  />
                }
                className="transform transition-all duration-300 hover:translate-y-[-4px]"
                onClick={() => navigate("/dashboard/documents?filter=error")}
              />
            </div>

            {/* Dashboard Overview Components */}
            <DashboardOverview />
          </Container>
        </div>
      </div>
    </div>
  );
};

export default EnhancedDashboardPage;
