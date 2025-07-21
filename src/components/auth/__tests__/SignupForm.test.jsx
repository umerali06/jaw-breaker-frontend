import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SignupForm from "../SignupForm";

// Mock the AuthContext
const mockSignup = vi.fn();
const mockAuthContext = {
  signup: mockSignup,
  user: null,
  isAuthenticated: false,
  loading: false,
  login: vi.fn(),
  logout: vi.fn(),
  checkAuth: vi.fn(),
  refreshToken: vi.fn(),
};

vi.mock("../../../contexts/AuthContext", () => ({
  useAuth: () => mockAuthContext,
  AuthProvider: ({ children }) => children,
}));

describe("SignupForm", () => {
  const mockOnSuccess = vi.fn();
  const mockOnError = vi.fn();
  const mockSetLoading = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderSignupForm = (props = {}) => {
    return render(
      <SignupForm
        onSuccess={mockOnSuccess}
        onError={mockOnError}
        loading={false}
        setLoading={mockSetLoading}
        {...props}
      />
    );
  };

  it("renders signup form with all required fields", () => {
    renderSignupForm();

    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /create account/i })
    ).toBeInTheDocument();
  });

  it("shows validation errors for empty fields", async () => {
    const user = userEvent.setup();
    renderSignupForm();

    const submitButton = screen.getByRole("button", {
      name: /create account/i,
    });
    await user.click(submitButton);

    expect(screen.getByText(/name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    expect(
      screen.getByText(/please confirm your password/i)
    ).toBeInTheDocument();
  });

  it("validates name length", async () => {
    const user = userEvent.setup();
    renderSignupForm();

    const nameInput = screen.getByLabelText(/full name/i);
    await user.type(nameInput, "A");

    const submitButton = screen.getByRole("button", {
      name: /create account/i,
    });
    await user.click(submitButton);

    expect(
      screen.getByText(/name must be at least 2 characters long/i)
    ).toBeInTheDocument();
  });

  it("validates email format", async () => {
    const user = userEvent.setup();
    renderSignupForm();

    const emailInput = screen.getByLabelText(/email address/i);
    await user.type(emailInput, "invalid-email");

    const submitButton = screen.getByRole("button", {
      name: /create account/i,
    });
    await user.click(submitButton);

    expect(
      screen.getByText(/please enter a valid email address/i)
    ).toBeInTheDocument();
  });

  it("validates password strength", async () => {
    const user = userEvent.setup();
    renderSignupForm();

    const passwordInput = screen.getByLabelText(/^password$/i);
    await user.type(passwordInput, "123");

    const submitButton = screen.getByRole("button", {
      name: /create account/i,
    });
    await user.click(submitButton);

    expect(
      screen.getByText(/password must be at least 8 characters long/i)
    ).toBeInTheDocument();
  });

  it("validates password complexity", async () => {
    const user = userEvent.setup();
    renderSignupForm();

    const passwordInput = screen.getByLabelText(/^password$/i);
    await user.type(passwordInput, "password");

    const submitButton = screen.getByRole("button", {
      name: /create account/i,
    });
    await user.click(submitButton);

    expect(
      screen.getByText(
        /password must contain at least one uppercase letter, one lowercase letter, and one number/i
      )
    ).toBeInTheDocument();
  });

  it("validates password confirmation matching", async () => {
    const user = userEvent.setup();
    renderSignupForm();

    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

    await user.type(passwordInput, "Password123");
    await user.type(confirmPasswordInput, "DifferentPassword123");

    const submitButton = screen.getByRole("button", {
      name: /create account/i,
    });
    await user.click(submitButton);

    expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
  });

  it("shows password strength indicator", async () => {
    const user = userEvent.setup();
    renderSignupForm();

    const passwordInput = screen.getByLabelText(/^password$/i);

    // Weak password
    await user.type(passwordInput, "password");
    expect(screen.getByText(/password strength: weak/i)).toBeInTheDocument();

    // Clear and type strong password
    await user.clear(passwordInput);
    await user.type(passwordInput, "StrongPassword123!");
    expect(screen.getByText(/password strength: strong/i)).toBeInTheDocument();
  });

  it("calls signup function with correct data on form submission", async () => {
    const user = userEvent.setup();
    mockSignup.mockResolvedValue({ success: true });

    renderSignupForm();

    const nameInput = screen.getByLabelText(/full name/i);
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole("button", {
      name: /create account/i,
    });

    await user.type(nameInput, "John Doe");
    await user.type(emailInput, "john@example.com");
    await user.type(passwordInput, "Password123");
    await user.type(confirmPasswordInput, "Password123");
    await user.click(submitButton);

    expect(mockSetLoading).toHaveBeenCalledWith(true);
    expect(mockSignup).toHaveBeenCalledWith(
      "john@example.com",
      "Password123",
      "John Doe"
    );
  });

  it("calls onSuccess when signup is successful", async () => {
    const user = userEvent.setup();
    mockSignup.mockResolvedValue({ success: true });

    renderSignupForm();

    const nameInput = screen.getByLabelText(/full name/i);
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole("button", {
      name: /create account/i,
    });

    await user.type(nameInput, "John Doe");
    await user.type(emailInput, "john@example.com");
    await user.type(passwordInput, "Password123");
    await user.type(confirmPasswordInput, "Password123");
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it("calls onError when signup fails", async () => {
    const user = userEvent.setup();
    const errorMessage = "Email already exists";
    mockSignup.mockResolvedValue({ success: false, error: errorMessage });

    renderSignupForm();

    const nameInput = screen.getByLabelText(/full name/i);
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole("button", {
      name: /create account/i,
    });

    await user.type(nameInput, "John Doe");
    await user.type(emailInput, "existing@example.com");
    await user.type(passwordInput, "Password123");
    await user.type(confirmPasswordInput, "Password123");
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith(errorMessage);
    });
  });

  it("disables form fields when loading", () => {
    renderSignupForm({ loading: true });

    const nameInput = screen.getByLabelText(/full name/i);
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole("button", {
      name: /creating account/i,
    });

    expect(nameInput).toBeDisabled();
    expect(emailInput).toBeDisabled();
    expect(passwordInput).toBeDisabled();
    expect(confirmPasswordInput).toBeDisabled();
    expect(submitButton).toBeDisabled();
  });
});
