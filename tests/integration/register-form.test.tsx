import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React, { useState } from "react";
import { useAuthStore } from "@/src/store/authStore";
import { ToastContainer } from "react-toastify";

/**
 * Mock register form component for integration testing
 * Simulates actual register page behavior
 */
function MockRegisterForm() {
  const { setAuth } = useAuthStore();
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/Tenant/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, name, email, password, confirmPassword }),
      });

      const data = await response.json();

      if (data.isSuccess && data.data) {
        const { accessToken, refreshToken, userInfo } = data.data;
        setAuth(userInfo, accessToken);

        if (typeof window !== "undefined") {
          localStorage.setItem("refreshToken", refreshToken);
        }
      } else {
        console.error("Registration failed:", data.message);
      }
    } catch (error) {
      console.error("Registration error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <input
          data-testid="name-input"
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          data-testid="phone-input"
          type="tel"
          placeholder="Phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <input
          data-testid="email-input"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          data-testid="password-input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          data-testid="confirm-password-input"
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <button type="submit" disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button>
      </form>
      <ToastContainer />
    </>
  );
}

describe("Integration: Register Form Flow", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});

    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        json: async () => ({
          isSuccess: true,
          data: {
            accessToken: "mock_access_token",
            refreshToken: "refresh_token_mock",
            userInfo: {
              id: "tenant-1",
              email: "tenant@example.com",
              name: "Test Tenant",
            },
          },
        }),
      }))
    );

    // Reset auth store before each test
    useAuthStore.setState({
      user: null,
      token: null,
      isAuthenticated: false,
    });
    // Clear localStorage
    localStorage.clear();
  });

  it("should register successfully with valid credentials", async () => {
    const user = userEvent.setup();
    render(<MockRegisterForm />);

    // Fill in register form
    const emailInput = screen.getByTestId("email-input");
    const passwordInput = screen.getByTestId("password-input");
    const confirmPasswordInput = screen.getByTestId("confirm-password-input");
    const submitButton = screen.getByRole("button", { name: /register/i });

    await user.type(screen.getByTestId("name-input"), "Test Tenant");
    await user.type(screen.getByTestId("phone-input"), "0123456789");
    await user.type(emailInput, "tenant@example.com");
    await user.type(passwordInput, "password123");
    await user.type(confirmPasswordInput, "password123");
    await user.click(submitButton);

    expect(fetch).toHaveBeenCalledWith("/Tenant/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone: "0123456789",
        name: "Test Tenant",
        email: "tenant@example.com",
        password: "password123",
        confirmPassword: "password123",
      }),
    });

    // Wait for async registration to complete
    await waitFor(() => {
      const authState = useAuthStore.getState();
      expect(authState.isAuthenticated).toBe(true);
      expect(authState.user?.email).toBe("tenant@example.com");
      expect(authState.token).toBe("mock_access_token");
    });

    // Verify tokens stored in localStorage
    expect(localStorage.getItem("refreshToken")).toBe("refresh_token_mock");

    // Verify button returns to normal state
    expect(submitButton).toHaveTextContent("Register");
    expect(submitButton).not.toBeDisabled();
  });

  it("should handle registration failure with invalid credentials", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        json: async () => ({
          isSuccess: false,
          message: "Registration failed",
        }),
      }))
    );

    const user = userEvent.setup();
    render(<MockRegisterForm />);

    const emailInput = screen.getByTestId("email-input");
    const passwordInput = screen.getByTestId("password-input");
    const confirmPasswordInput = screen.getByTestId("confirm-password-input");
    const submitButton = screen.getByRole("button", { name: /register/i });

    await user.type(emailInput, "wrong@example.com");
    await user.type(passwordInput, "wrongpassword");
    await user.type(confirmPasswordInput, "wrongpassword");
    await user.type(screen.getByTestId("name-input"), "Wrong User");
    await user.type(screen.getByTestId("phone-input"), "0999999999");
    await user.click(submitButton);

    // Wait for async operation
    await waitFor(() => {
      const authState = useAuthStore.getState();
      expect(authState.isAuthenticated).toBe(false);
      expect(authState.user).toBeNull();
      expect(authState.token).toBeNull();
    });

    // Verify no tokens stored
    expect(localStorage.getItem("refreshToken")).toBeNull();
  });

  it("should show loading state during form submission", async () => {
    let resolveRequest: ((value: unknown) => void) | null = null;

    vi.stubGlobal(
      "fetch",
      vi.fn(
        () =>
          new Promise((resolve) => {
            resolveRequest = resolve;
          })
      )
    );

    const user = userEvent.setup();
    render(<MockRegisterForm />);

    const submitButton = screen.getByRole("button", { name: /register/i });

    // Before any interaction
    expect(submitButton).not.toBeDisabled();
    expect(submitButton).toHaveTextContent("Register");

    // Fill and submit form
    await user.type(screen.getByTestId("email-input"), "tenant@example.com");
    await user.type(screen.getByTestId("password-input"), "password123");
    await user.type(screen.getByTestId("confirm-password-input"), "password123");
    await user.type(screen.getByTestId("name-input"), "John Doe");
    await user.type(screen.getByTestId("phone-input"), "1234567890");

    await user.click(submitButton);

    await waitFor(() => {
      expect(submitButton).toHaveTextContent("Registering...");
      expect(submitButton).toBeDisabled();
    });

    resolveRequest?.({
      json: async () => ({
        isSuccess: true,
        data: {
          accessToken: "mock_access_token",
          refreshToken: "refresh_token_mock",
          userInfo: {
            id: "tenant-1",
            email: "tenant@example.com",
            name: "John Doe",
          },
        },
      }),
    });

    // After form submission completes successfully,
    // button should return to normal state
    await waitFor(() => {
      expect(submitButton).toHaveTextContent("Register");
      expect(submitButton).not.toBeDisabled();
    });

    // Verify auth state was updated
    const authState = useAuthStore.getState();
    expect(authState.isAuthenticated).toBe(true);
  });
});
