import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "../../contexts/AuthContext";
import AuthPage from "../../pages/AuthPage";
import ProtectedRoute from "../../components/ProtectedRoute";

// Mock fetch
global.fetch = vi.fn();

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock;

// Mock window.location
delete window.location;
window.location = { href: "" };

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useSearchParams: () => [new URLSearchParams()],
  };
});

describe("Authentication Flow Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetch.mockClear();
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
    mockNavigate.mockClear();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  const renderAuthPage = () => {
    return render(
      <BrowserRouter>
        <AuthProvider>
          <AuthPage />
        </AuthProvider>
      </BrowserRouter>
    );
  };

  const renderProtectedComponent = () => {
    const TestProtectedComponent = () => <div>Protected Content</div>;

    return render(
      <BrowserRouter>
        <AuthProvider>
          <ProtectedRoute>
            <TestProtectedComponent />
          </ProtectedRoute>
        </AuthProvider>
      </BrowserRouter>
    );
  };

  describe("Complete Login Flow", () => {
    it("successfully logs in user and redirects to dashboard", async () => {
      const user = userEvent.setup();
      const mockToken = "jwt-token";
      const mockUser = { email: "test@example.com", name: "Test User" };

      // Mock initial auth check (no token)
      localStorageMock.getItem.mockReturnValue(null);

      // Mock successful login
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ token: mockToken, user: mockUser }),
      });

      renderAuthPage();

      // Wait for page to load
      await waitFor(() => {
        expect(
          screen.getByText(/sign in to your account/i)
        ).toBeInTheDocument();
      });

      // Fill in login form
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole("button", { name: /sign in/i });

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "password123");
      await user.click(submitButton);

      // Verify API call
      expect(fetch).toHaveBeenCalledWith("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "test@example.com",
          password: "password123",
        }),
      });

      // Verify token storage and navigation
      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          "authToken",
          mockToken
        );
        expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
      });
    });

    it("shows error message for invalid credentials", async () => {
      const user = userEvent.setup();

      localStorageMock.getItem.mockReturnValue(null);

      // Mock failed login
      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: "Invalid credentials" }),
      });

      renderAuthPage();

      await waitFor(() => {
        expect(
          screen.getByText(/sign in to your account/i)
        ).toBeInTheDocument();
      });

      // Fill in login form with wrong credentials
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole("button", { name: /sign in/i });

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "wrongpassword");
      await user.click(submitButton);

      // Verify error message appears
      await waitFor(() => {
        expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
      });

      // Verify no token was stored and no navigation occurred
      expect(localStorageMock.setItem).not.toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe("Complete Signup Flow", () => {
    it("successfully creates account and redirects to dashboard", async () => {
      const user = userEvent.setup();
      const mockToken = "jwt-token";
      const mockUser = { email: "newuser@example.com", name: "New User" };

      localStorageMock.getItem.mockReturnValue(null);

      // Mock successful signup
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ token: mockToken, user: mockUser }),
      });

      renderAuthPage();

      await waitFor(() => {
        expect(
          screen.getByText(/sign in to your account/i)
        ).toBeInTheDocument();
      });

      // Switch to signup mode
      const switchToSignup = screen.getByText(
        /don't have an account\? sign up/i
      );
      await user.click(switchToSignup);

      expect(screen.getByText(/create your account/i)).toBeInTheDocument();

      // Fill in signup form
      const nameInput = screen.getByLabelText(/full name/i);
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole("button", {
        name: /create account/i,
      });

      await user.type(nameInput, "New User");
      await user.type(emailInput, "newuser@example.com");
      await user.type(passwordInput, "Password123");
      await user.type(confirmPasswordInput, "Password123");
      await user.click(submitButton);

      // Verify API call
      expect(fetch).toHaveBeenCalledWith("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "newuser@example.com",
          password: "Password123",
          name: "New User",
        }),
      });

      // Verify token storage and navigation
      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          "authToken",
          mockToken
        );
        expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
      });
    });

    it("shows error for duplicate email during signup", async () => {
      const user = userEvent.setup();

      localStorageMock.getItem.mockReturnValue(null);

      // Mock signup failure
      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: "Email address is already registered" }),
      });

      renderAuthPage();

      await waitFor(() => {
        expect(
          screen.getByText(/sign in to your account/i)
        ).toBeInTheDocument();
      });

      // Switch to signup mode
      const switchToSignup = screen.getByText(
        /don't have an account\? sign up/i
      );
      await user.click(switchToSignup);

      // Fill in signup form
      const nameInput = screen.getByLabelText(/full name/i);
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole("button", {
        name: /create account/i,
      });

      await user.type(nameInput, "Existing User");
      await user.type(emailInput, "existing@example.com");
      await user.type(passwordInput, "Password123");
      await user.type(confirmPasswordInput, "Password123");
      await user.click(submitButton);

      // Verify error message appears
      await waitFor(() => {
        expect(
          screen.getByText(/email address is already registered/i)
        ).toBeInTheDocument();
      });

      expect(localStorageMock.setItem).not.toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe("Form Mode Switching", () => {
    it("switches between login and signup modes correctly", async () => {
      const user = userEvent.setup();

      localStorageMock.getItem.mockReturnValue(null);
      renderAuthPage();

      await waitFor(() => {
        expect(
          screen.getByText(/sign in to your account/i)
        ).toBeInTheDocument();
      });

      // Initially in login mode
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.queryByLabelText(/full name/i)).not.toBeInTheDocument();

      // Switch to signup
      const switchToSignup = screen.getByText(
        /don't have an account\? sign up/i
      );
      await user.click(switchToSignup);

      expect(screen.getByText(/create your account/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();

      // Switch back to login
      const switchToLogin = screen.getByText(
        /already have an account\? sign in/i
      );
      await user.click(switchToLogin);

      expect(screen.getByText(/sign in to your account/i)).toBeInTheDocument();
      expect(screen.queryByLabelText(/full name/i)).not.toBeInTheDocument();
      expect(
        screen.queryByLabelText(/confirm password/i)
      ).not.toBeInTheDocument();
    });
  });

  describe("Protected Route Access", () => {
    it("redirects unauthenticated users to auth page", async () => {
      localStorageMock.getItem.mockReturnValue(null);

      renderProtectedComponent();

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/auth");
      });
    });

    it("allows authenticated users to access protected content", async () => {
      const mockToken = "valid-token";
      const mockUser = { email: "test@example.com", name: "Test User" };

      localStorageMock.getItem.mockReturnValue(mockToken);
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: mockUser }),
      });

      renderProtectedComponent();

      await waitFor(() => {
        expect(screen.getByText("Protected Content")).toBeInTheDocument();
      });

      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it("shows loading spinner while checking authentication", () => {
      const mockToken = "valid-token";

      localStorageMock.getItem.mockReturnValue(mockToken);
      // Don't resolve the fetch to keep it in loading state
      fetch.mockImplementation(() => new Promise(() => {}));

      renderProtectedComponent();

      expect(screen.getByText(/checking authentication/i)).toBeInTheDocument();
    });
  });

  describe("Authentication State Persistence", () => {
    it("restores authentication state from localStorage on app load", async () => {
      const mockToken = "stored-token";
      const mockUser = { email: "stored@example.com", name: "Stored User" };

      localStorageMock.getItem.mockReturnValue(mockToken);
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: mockUser }),
      });

      renderAuthPage();

      // Should redirect to dashboard since user is already authenticated
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
      });

      expect(fetch).toHaveBeenCalledWith("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${mockToken}`,
        },
      });
    });

    it("clears invalid token and shows auth page", async () => {
      const mockToken = "invalid-token";

      localStorageMock.getItem.mockReturnValue(mockToken);
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      renderAuthPage();

      await waitFor(() => {
        expect(
          screen.getByText(/sign in to your account/i)
        ).toBeInTheDocument();
      });

      expect(localStorageMock.removeItem).toHaveBeenCalledWith("authToken");
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});
