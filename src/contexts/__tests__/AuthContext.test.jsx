import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth } from "../AuthContext";

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

// Test component to access AuthContext
const TestComponent = () => {
  const auth = useAuth();
  return (
    <div>
      <div data-testid="user">{auth.user ? auth.user.email : "null"}</div>
      <div data-testid="authenticated">{auth.isAuthenticated.toString()}</div>
      <div data-testid="loading">{auth.loading.toString()}</div>
      <button onClick={() => auth.login("test@example.com", "password")}>
        Login
      </button>
      <button
        onClick={() => auth.signup("test@example.com", "password", "Test User")}
      >
        Signup
      </button>
      <button onClick={() => auth.logout()}>Logout</button>
    </div>
  );
};

describe("AuthContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetch.mockClear();
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  const renderWithAuthProvider = () => {
    return render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
  };

  it("provides initial auth state", () => {
    localStorageMock.getItem.mockReturnValue(null);
    renderWithAuthProvider();

    expect(screen.getByTestId("user")).toHaveTextContent("null");
    expect(screen.getByTestId("authenticated")).toHaveTextContent("false");
    expect(screen.getByTestId("loading")).toHaveTextContent("true");
  });

  it("checks for existing token on initialization", async () => {
    const mockToken = "mock-jwt-token";
    const mockUser = { email: "test@example.com", name: "Test User" };

    localStorageMock.getItem.mockReturnValue(mockToken);
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ user: mockUser }),
    });

    renderWithAuthProvider();

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("false");
    });

    expect(localStorageMock.getItem).toHaveBeenCalledWith("authToken");
    expect(fetch).toHaveBeenCalledWith("/api/auth/me", {
      headers: {
        Authorization: `Bearer ${mockToken}`,
      },
    });
  });

  it("handles successful login", async () => {
    const mockToken = "new-jwt-token";
    const mockUser = { email: "test@example.com", name: "Test User" };

    localStorageMock.getItem.mockReturnValue(null);
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ token: mockToken, user: mockUser }),
    });

    renderWithAuthProvider();

    // Wait for initial loading to complete
    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("false");
    });

    const loginButton = screen.getByText("Login");
    loginButton.click();

    await waitFor(() => {
      expect(screen.getByTestId("user")).toHaveTextContent("test@example.com");
      expect(screen.getByTestId("authenticated")).toHaveTextContent("true");
    });

    expect(fetch).toHaveBeenCalledWith("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: "test@example.com", password: "password" }),
    });

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      "authToken",
      mockToken
    );
  });

  it("handles login failure", async () => {
    localStorageMock.getItem.mockReturnValue(null);
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Invalid credentials" }),
    });

    renderWithAuthProvider();

    // Wait for initial loading to complete
    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("false");
    });

    const loginButton = screen.getByText("Login");
    loginButton.click();

    // User should remain unauthenticated
    expect(screen.getByTestId("authenticated")).toHaveTextContent("false");
    expect(localStorageMock.setItem).not.toHaveBeenCalled();
  });

  it("handles successful signup", async () => {
    const mockToken = "new-jwt-token";
    const mockUser = { email: "test@example.com", name: "Test User" };

    localStorageMock.getItem.mockReturnValue(null);
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ token: mockToken, user: mockUser }),
    });

    renderWithAuthProvider();

    // Wait for initial loading to complete
    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("false");
    });

    const signupButton = screen.getByText("Signup");
    signupButton.click();

    await waitFor(() => {
      expect(screen.getByTestId("user")).toHaveTextContent("test@example.com");
      expect(screen.getByTestId("authenticated")).toHaveTextContent("true");
    });

    expect(fetch).toHaveBeenCalledWith("/api/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "test@example.com",
        password: "password",
        name: "Test User",
      }),
    });

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      "authToken",
      mockToken
    );
  });

  it("handles logout", async () => {
    const mockToken = "mock-jwt-token";
    const mockUser = { email: "test@example.com", name: "Test User" };

    // Start with authenticated user
    localStorageMock.getItem.mockReturnValue(mockToken);
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ user: mockUser }),
    });

    renderWithAuthProvider();

    await waitFor(() => {
      expect(screen.getByTestId("authenticated")).toHaveTextContent("true");
    });

    const logoutButton = screen.getByText("Logout");
    logoutButton.click();

    expect(screen.getByTestId("user")).toHaveTextContent("null");
    expect(screen.getByTestId("authenticated")).toHaveTextContent("false");
    expect(localStorageMock.removeItem).toHaveBeenCalledWith("authToken");
  });

  it("handles network errors gracefully", async () => {
    localStorageMock.getItem.mockReturnValue(null);
    fetch.mockRejectedValueOnce(new Error("Network error"));

    renderWithAuthProvider();

    // Wait for initial loading to complete
    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("false");
    });

    const loginButton = screen.getByText("Login");
    loginButton.click();

    // Should remain unauthenticated
    expect(screen.getByTestId("authenticated")).toHaveTextContent("false");
  });

  it("removes invalid token from localStorage", async () => {
    const mockToken = "invalid-token";

    localStorageMock.getItem.mockReturnValue(mockToken);
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
    });

    renderWithAuthProvider();

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("false");
    });

    expect(localStorageMock.removeItem).toHaveBeenCalledWith("authToken");
    expect(screen.getByTestId("authenticated")).toHaveTextContent("false");
  });

  it("throws error when useAuth is used outside AuthProvider", () => {
    // Mock console.error to avoid test output noise
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => {
      render(<TestComponent />);
    }).toThrow("useAuth must be used within an AuthProvider");

    consoleSpy.mockRestore();
  });
});
