# Environment Setup Guide

This document explains how to set up and run the application in different environments.

## Environment Configuration

The application supports two environments:

1. **Development** - For local development with a local backend server
2. **Production** - For production deployment with the hosted backend server

## Environment Variables

The following environment variables are used:

- `VITE_API_BASE_URL` - The base URL of the API server
- `VITE_ENV` - The current environment (`development` or `production`)
- `VITE_FRONTEND_URL` - The URL of the frontend application
- `VITE_USE_REAL_API` - Whether to use the real API (`true` or `false`)

## Running in Different Environments

### Local Development (with local backend)

```bash
# Switch to development environment
npm run use:dev

# Start the development server
npm run dev
```

This will:

- Start the frontend server on port 5174
- Connect to the local backend server at http://localhost:5000

### Production Build

```bash
# Switch to production environment
npm run use:prod

# Build the application
npm run build
```

This will create a production build that connects to the production backend server.

## Switching Environments

You can switch between environments using the following commands:

```bash
# Switch to development environment
npm run use:dev

# Switch to production environment
npm run use:prod
```

## Port Configuration

The frontend server runs on port 5174 by default. This is configured in the `vite.config.js` file.

## API Endpoints

API endpoints are configured in `src/config/api.js`. The application uses different endpoints based on the current environment:

- In development, it uses relative paths that work with the Vite proxy
- In production, it uses absolute URLs with the production API base URL

## Troubleshooting

### API Errors

If you encounter API errors:

1. Make sure your backend server is running
2. Check that the proxy configuration in `vite.config.js` is correct
3. Verify that the environment variables are set correctly
4. Check the browser console for detailed error messages
