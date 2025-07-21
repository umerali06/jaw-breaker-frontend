import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    // Optionally log error to an external service here
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="container mx-auto px-4 py-16">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6">
            <strong className="font-bold">Something went wrong.</strong>
            <span className="block sm:inline ml-2">
              {this.state.error?.message ||
                "An unexpected error occurred. Please try again or contact support."}
            </span>
          </div>
          <details className="whitespace-pre-wrap text-xs text-gray-600">
            {this.state.errorInfo?.componentStack}
          </details>
          <button
            className="btn-custom btn-primary-custom mt-4"
            onClick={() => window.location.reload()}
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
