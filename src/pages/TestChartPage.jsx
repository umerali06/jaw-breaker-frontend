import React from "react";
import TestChart from "../components/dashboard/TestChart";
import SimpleBarChart from "../components/dashboard/SimpleBarChart";

const TestChartPage = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Chart Test Page</h1>

      <div className="mb-8">
        <h2 className="text-xl font-bold mb-2">Test Chart</h2>
        <TestChart />
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-bold mb-2">Simple Bar Chart</h2>
        <div className="bg-white p-4 rounded-lg shadow">
          <SimpleBarChart />
        </div>
      </div>
    </div>
  );
};

export default TestChartPage;
