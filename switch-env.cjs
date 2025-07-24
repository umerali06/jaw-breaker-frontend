/**
 * Script to switch between development and production environments
 * Usage: node switch-env.js [dev|prod]
 */

const fs = require("fs");
const path = require("path");

// Get the environment from command line arguments
const args = process.argv.slice(2);
const env = args[0]?.toLowerCase();

if (!env || (env !== "dev" && env !== "prod")) {
  console.error("Please specify environment: dev or prod");
  console.log("Usage: node switch-env.js [dev|prod]");
  process.exit(1);
}

// Define environment variables
const envVars = {
  dev: {
    VITE_API_BASE_URL: "http://localhost:5000",
    VITE_ENV: "development",
    VITE_FRONTEND_URL: "http://localhost:5174",
    VITE_USE_SAMPLE_DATA: "false",
    VITE_USE_REAL_API: "true",
  },
  prod: {
    VITE_API_BASE_URL: "https://jaw-breaker-backend.onrender.com",
    VITE_ENV: "production",
    VITE_FRONTEND_URL: "https://jaw-breaker-06.netlify.app",
    VITE_USE_SAMPLE_DATA: "false",
    VITE_USE_REAL_API: "true",
  },
};

// Create .env file content
const envContent = Object.entries(envVars[env])
  .map(([key, value]) => `${key}=${value}`)
  .join("\n");

// Write to .env file
fs.writeFileSync(path.join(__dirname, ".env"), envContent);

console.log(
  `Environment switched to ${env === "dev" ? "development" : "production"}`
);
console.log("Environment variables:");
console.log(envVars[env]);
