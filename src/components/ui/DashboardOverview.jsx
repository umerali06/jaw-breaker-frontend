import React from "react";
import PropTypes from "prop-types";
import {
  Card,
  Typography,
  Button,
  Badge,
  DataChart,
  SummaryCard,
  StatusCard,
} from "./index";

/**
 * DashboardOverview component for displaying dashboard overview components
 */
const DashboardOverview = ({ className = "" }) => {
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

  return (
    <div className={`space-y-8 ${className}`}>
      {/* System Status Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System Status */}
        <StatusCard
          title="System Status"
          status="success"
          statusText="Operational"
          description="All systems are running normally. Last checked 5 minutes ago."
          icon={
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
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          }
          actions={
            <Button variant="text" size="sm">
              View Details
            </Button>
          }
          className="transform transition-all duration-300 hover:translate-y-[-4px]"
        />

        {/* AI Processing */}
        <SummaryCard
          title="AI Processing"
          value={
            <div className="flex items-center">
              <span className="text-2xl font-bold mr-2">98.5%</span>
              <Badge variant="success">Excellent</Badge>
            </div>
          }
          description="Average accuracy rate for document analysis"
          icon={
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
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          }
          color="accent"
          className="transform transition-all duration-300 hover:translate-y-[-4px]"
        />

        {/* Storage Usage */}
        <SummaryCard
          title="Storage Usage"
          value={
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2 mb-4">
              <div
                className="bg-primary h-2.5 rounded-full"
                style={{ width: "45%" }}
              ></div>
            </div>
          }
          description="4.5 GB used of 10 GB (45%)"
          icon={
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
                d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
              />
            </svg>
          }
          className="transform transition-all duration-300 hover:translate-y-[-4px]"
        />
      </div>

      {/* Data Visualization */}
      <Card className="transition-all duration-300 hover:shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <svg
              className="w-6 h-6 text-primary mr-2"
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
            <Typography variant="h5">Weekly Document Activity</Typography>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              This Week
            </Button>
            <Button variant="text" size="sm">
              Last Week
            </Button>
          </div>
        </div>

        <div className="h-64">
          <DataChart
            data={getChartData("documents")}
            type="area"
            color="primary"
            height="h-full"
            showLabels={true}
            showGrid={true}
          />
        </div>
      </Card>

      {/* Activity Timeline */}
      <div>
        <div className="flex items-center mb-6">
          <svg
            className="w-6 h-6 text-primary mr-2"
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
          <Typography variant="h5">Recent Activity</Typography>
        </div>

        <Card className="transition-all duration-300 hover:shadow-lg">
          <div className="space-y-4">
            {/* Activity Item 1 */}
            <div className="flex">
              <div className="flex-shrink-0 mr-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-light text-primary">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
              <div>
                <Typography variant="subtitle2">
                  Document Analysis Completed
                </Typography>
                <Typography variant="caption" color="gray">
                  Patient Assessment - John Doe
                </Typography>
                <Typography variant="caption" color="gray" className="block">
                  Today, 2:30 PM
                </Typography>
              </div>
            </div>

            {/* Activity Item 2 */}
            <div className="flex">
              <div className="flex-shrink-0 mr-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-accent-light text-accent">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
              <div>
                <Typography variant="subtitle2">
                  New Document Uploaded
                </Typography>
                <Typography variant="caption" color="gray">
                  Lab Results - Robert Johnson
                </Typography>
                <Typography variant="caption" color="gray" className="block">
                  Today, 10:15 AM
                </Typography>
              </div>
            </div>

            {/* Activity Item 3 */}
            <div className="flex">
              <div className="flex-shrink-0 mr-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-yellow-100 text-yellow-600">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
              <div>
                <Typography variant="subtitle2">Processing Error</Typography>
                <Typography variant="caption" color="gray">
                  Medical History - Jane Smith
                </Typography>
                <Typography variant="caption" color="gray" className="block">
                  Yesterday, 4:45 PM
                </Typography>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

DashboardOverview.propTypes = {
  className: PropTypes.string,
};

export default DashboardOverview;
