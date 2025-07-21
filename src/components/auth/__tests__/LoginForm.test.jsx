import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginForm from "../LoginForm";
import { AuthProvider } from "../../../contexts/AuthContext";

// Mock the AuthContext
const mockLogin = vi.fn();
const mockAuthContext = {
  login: mockLogin,
  user: null,
  isAuthenticated: false,
  loading: false,
  signup: vi.fn(),
  logout: vi.fn(),
  checkAuth: vi.fn(),
  refreshToken: vi.fn(),
};

vi.mock("../../../contexts/AuthContext", () => ({
  useAuth: () => mockAuthContext,
  AuthProvider: ({ children }) => children,
}));

describe("LoginForm", () => {
  const mockOnSuccess = vi.fn();
  const mockOnError = vi.fn();
  const mockSetLoading = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderLoginForm = (props = {}) => {
    return render(
      <LoginForm
        onSuccess={mockOnSuccess}
        onError={mockOnError}
        loading={false}
        setLoading={mockSetLoading}
        {...props}
      />
    );
  };

  it("renders login form with email and password fields", () => {
    renderLoginForm();

    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign in/i })
    ).toBeInTheDocument();
  });

  it("shows validation errors for empty fields", async () => {
    const user = userEvent.setup();
    renderLoginForm();

    const submitButton = screen.getByRole("button", { name: /sign in/i });
    await user.click(submitButton);

    expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    expect(screen.getByText(/password is required/i)).toBeInTheDocument();
  });

  it("shows validation error for invalid email format", async () => {
    const user = userEvent.setup();
    renderLoginForm();

    const emailInput = screen.getByLabelText(/email address/i);
    await user.type(emailInput, "invalid-email");

    const submitButton = screen.getByRole("button", { name: /sign in/i });
    await user.click(submitButton);

    expect(
      screen.getByText(/please enter a valid email address/i)
    ).toBeInTheDocument();
  });

  it("clears validation errors when user starts typing", async () => {
    const user = userEvent.setup();
    renderLoginForm();

    const emailInput = screen.getByLabelText(/email address/i);
    const submitButton = screen.getByRole("button", { name: /sign in/i });

    // Trigger validation error
    await user.click(submitButton);
    expect(screen.getByText(/email is required/i)).toBeInTheDocument();

    // Start typing to clear error
    await user.type(emailInput, "test@example.com");
    expect(screen.queryByText(/email is required/i)).not.toBeInTheDocument();
  });

  it("calls login function with correct credentials on form submission", async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValue({ success: true });

    renderLoginForm();

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole("button", { name: /sign in/i });

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "password123");
    await user.click(submitButton);

    expect(mockSetLoading).toHaveBeenCalledWith(true);
    expect(mockLogin).toHaveBeenCalledWith("test@example.com", "password123");
  });

  it("calls onSuccess when login is successful", async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValue({ success: true });

    renderLoginForm();

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole("button", { name: /sign in/i });

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "password123");
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it("calls onError when login fails", async () => {
    const user = userEvent.setup();
    const errorMessage = "Invalid credentials";
    mockLogin.mockResolvedValue({ success: false, error: errorMessage });

    renderLoginForm();

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole("button", { name: /sign in/i });

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "wrongpassword");
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith(errorMessage);
    });
  });

  it("handles network errors gracefully", async () => {
    const user = userEvent.setup();
    mockLogin.mockRejectedValue(new Error("Network error"));

    renderLoginForm();

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole("button", { name: /sign in/i });

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "password123");
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith(
        "Network error. Please check your connection and try again."
      );
    });
  });

  it("disables form fields when loading", () => {
    renderLoginForm({ loading: true });

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole("button", { name: /signing in/i });

    expect(emailInput).toBeDisabled();
    expect(passwordInput).toBeDisabled();
    expect(submitButton).toBeDisabled();
  });

  it("shows loading spinner when submitting", () => {
    renderLoginForm({ loading: true });

    expect(screen.getByText(/signing in/i)).toBeInTheDocument();
    expect(screen.getByRole("button")).toBeDisabled();
  });
});
