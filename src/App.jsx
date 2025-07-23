import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ThemeProvider from "./contexts/ThemeContext";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import AboutUs from "./pages/AboutUs";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";
import FileDetailPage from "./pages/FileDetailPage";
import ErrorBoundary from "./components/ErrorBoundary";
import { ToastProvider } from "./contexts/ToastContext";

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <Router>
              <Routes>
                <Route path="/" element={<Layout />}>
                  <Route index element={<Home />} />
                  <Route path="about" element={<AboutUs />} />
                  <Route
                    path="file/:id"
                    element={
                      <ProtectedRoute>
                        <FileDetailPage />
                      </ProtectedRoute>
                    }
                  />
                </Route>
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/auth/callback" element={<AuthPage />} />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </Router>
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
