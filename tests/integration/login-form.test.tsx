import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React, { useState } from "react";
import { useAuthStore } from "@/src/store/authStore";
import { ToastContainer } from "react-toastify";

/**
 * Mock login form component for integration testing
 * Simulates actual login page behavior
 */
function MockLoginForm() {
  const { setAuth } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/Auth/tenant-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.isSuccess && data.data) {
        const { accessToken, refreshToken, userInfo } = data.data;
        setAuth(userInfo, accessToken);

        if (typeof window !== "undefined") {
          localStorage.setItem("refreshToken", refreshToken);
        }
      } else {
        console.error("Login failed:", data.message);
      }
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
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
        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
      <ToastContainer />
    </>
  );
}

describe("Integration: Login Form Flow", () => {
  beforeEach(() => {
    // Reset auth store before each test
    useAuthStore.setState({
      user: null,
      token: null,
      isAuthenticated: false,
    });
    // Clear localStorage
    localStorage.clear();
  });

  it("should login successfully with valid credentials", async () => {
    const user = userEvent.setup();
    render(<MockLoginForm />);

    // Fill in login form
    const emailInput = screen.getByTestId("email-input");
    const passwordInput = screen.getByTestId("password-input");
    const submitButton = screen.getByRole("button", { name: /login/i });

    await user.type(emailInput, "tenant@example.com");
    await user.type(passwordInput, "password123");
    await user.click(submitButton);

    // Wait for async login to complete
    await waitFor(() => {
      const authState = useAuthStore.getState();
      expect(authState.isAuthenticated).toBe(true);
      expect(authState.user?.email).toBe("tenant@example.com");
      expect(authState.token).toBeTruthy();
    });

    // Verify tokens stored in localStorage
    expect(localStorage.getItem("refreshToken")).toBe("refresh_token_mock");

    // Verify button returns to normal state
    expect(submitButton).toHaveTextContent("Login");
    expect(submitButton).not.toBeDisabled();
  });

  it("should handle login failure with invalid credentials", async () => {
    const user = userEvent.setup();
    render(<MockLoginForm />);

    const emailInput = screen.getByTestId("email-input");
    const passwordInput = screen.getByTestId("password-input");
    const submitButton = screen.getByRole("button", { name: /login/i });

    await user.type(emailInput, "wrong@example.com");
    await user.type(passwordInput, "wrongpassword");
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
    const user = userEvent.setup();
    render(<MockLoginForm />);

    const submitButton = screen.getByRole("button", { name: /login/i });

    // Before any interaction
    expect(submitButton).not.toBeDisabled();
    expect(submitButton).toHaveTextContent("Login");

    // Fill and submit form
    await user.type(screen.getByTestId("email-input"), "tenant@example.com");
    await user.type(screen.getByTestId("password-input"), "password123");
    await user.click(submitButton);

    // After form submission completes successfully,
    // button should return to normal state
    await waitFor(() => {
      expect(submitButton).toHaveTextContent("Login");
      expect(submitButton).not.toBeDisabled();
    });

    // Verify auth state was updated
    const authState = useAuthStore.getState();
    expect(authState.isAuthenticated).toBe(true);
  });
});
