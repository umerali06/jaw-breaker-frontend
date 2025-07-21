import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import GoogleAuthButton from "../GoogleAuthButton";

describe("GoogleAuthButton", () => {
  const mockOnAuth = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderGoogleAuthButton = (props = {}) => {
    return render(
      <GoogleAuthButton
        onAuth={mockOnAuth}
        loading={false}
        disabled={false}
        {...props}
      />
    );
  };

  it("renders Google auth button with correct text and icon", () => {
    renderGoogleAuthButton();

    const button = screen.getByRole("button", {
      name: /continue with google/i,
    });
    expect(button).toBeInTheDocument();

    // Check for Google logo (SVG)
    const svg = button.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("calls onAuth when clicked", async () => {
    const user = userEvent.setup();
    renderGoogleAuthButton();

    const button = screen.getByRole("button", {
      name: /continue with google/i,
    });
    await user.click(button);

    expect(mockOnAuth).toHaveBeenCalledTimes(1);
  });

  it("does not call onAuth when disabled", async () => {
    const user = userEvent.setup();
    renderGoogleAuthButton({ disabled: true });

    const button = screen.getByRole("button");
    await user.click(button);

    expect(mockOnAuth).not.toHaveBeenCalled();
  });

  it("does not call onAuth when loading", async () => {
    const user = userEvent.setup();
    renderGoogleAuthButton({ loading: true });

    const button = screen.getByRole("button");
    await user.click(button);

    expect(mockOnAuth).not.toHaveBeenCalled();
  });

  it("shows loading state with spinner and text", () => {
    renderGoogleAuthButton({ loading: true });

    expect(screen.getByText(/connecting to google/i)).toBeInTheDocument();

    // Check for loading spinner
    const button = screen.getByRole("button");
    const spinner = button.querySelector("svg.animate-spin");
    expect(spinner).toBeInTheDocument();
  });

  it("is disabled when loading prop is true", () => {
    renderGoogleAuthButton({ loading: true });

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
  });

  it("is disabled when disabled prop is true", () => {
    renderGoogleAuthButton({ disabled: true });

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
  });

  it("has correct CSS classes for styling", () => {
    renderGoogleAuthButton();

    const button = screen.getByRole("button");
    expect(button).toHaveClass(
      "w-full",
      "flex",
      "justify-center",
      "items-center"
    );
  });

  it("has correct CSS classes when disabled", () => {
    renderGoogleAuthButton({ disabled: true });

    const button = screen.getByRole("button");
    expect(button).toHaveClass("opacity-50", "cursor-not-allowed");
  });

  it("has correct CSS classes when loading", () => {
    renderGoogleAuthButton({ loading: true });

    const button = screen.getByRole("button");
    expect(button).toHaveClass("opacity-50", "cursor-not-allowed");
  });

  it("shows Google logo with correct colors", () => {
    renderGoogleAuthButton();

    const button = screen.getByRole("button");
    const svg = button.querySelector("svg");

    // Check for Google brand colors in SVG paths
    const bluePath = svg.querySelector('path[fill="#4285F4"]');
    const greenPath = svg.querySelector('path[fill="#34A853"]');
    const yellowPath = svg.querySelector('path[fill="#FBBC05"]');
    const redPath = svg.querySelector('path[fill="#EA4335"]');

    expect(bluePath).toBeInTheDocument();
    expect(greenPath).toBeInTheDocument();
    expect(yellowPath).toBeInTheDocument();
    expect(redPath).toBeInTheDocument();
  });
});
