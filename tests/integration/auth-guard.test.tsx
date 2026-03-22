import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import React, { useEffect } from "react";
import { AuthProvider } from "@/src/components/providers/AuthProvider";
import { useAuthStore, isTokenExpired } from "@/src/store/authStore";
import { useRouter } from "next/navigation";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
  usePathname: vi.fn(() => "/tenant/dashboard"),
}));

/**
 * Mock protected page component
 * Should only render if user is authenticated
 */
function MockProtectedPage() {
  const { user, isAuthenticated } = useAuthStore();

  return (
    <div>
      <h1>Protected Dashboard</h1>
      {isAuthenticated && user ? (
        <p data-testid="welcome-message">Welcome, {user.name}!</p>
      ) : (
        <p data-testid="no-access">No access</p>
      )}
    </div>
  );
}

/**
 * Test wrapper with all necessary providers
 */
function TestWrapper({ children }: { children: React.ReactNode }) {
  return <AuthProvider requiredRole="tenant">{children}</AuthProvider>;
}

describe("Integration: Auth Guard Flow", () => {
  const mockRouter = {
    push: vi.fn(),
    replace: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useRouter).mockReturnValue(mockRouter as any);

    // Reset auth store
    useAuthStore.setState({
      user: null,
      token: null,
      isAuthenticated: false,
      _hasHydrated: true,
    });

    localStorage.clear();
  });

  it("should allow access to protected page when authenticated", async () => {
    // Setup: Simulate authenticated user
    const mockUser = {
      id: "tenant-1",
      email: "tenant@example.com",
      name: "Test Tenant",
      role: "tenant",
      avatar: null,
    };

    const mockToken =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjk5OTk5OTk5OTksInN1YiI6InRlc3QtdXNlciIsImVtYWlsIjoidGVzdEB0ZXN0LmNvbSIsImlhdCI6MTcxNjM5Njc0N30.mock";

    useAuthStore.setState({
      user: mockUser,
      token: mockToken,
      isAuthenticated: true,
      _hasHydrated: true,
    });

    render(
      <TestWrapper>
        <MockProtectedPage />
      </TestWrapper>
    );

    // Page should render with welcome message
    await waitFor(() => {
      expect(screen.getByTestId("welcome-message")).toBeInTheDocument();
      expect(screen.getByText(/Welcome, Test Tenant/)).toBeInTheDocument();
    });

    // Router should not redirect
    expect(mockRouter.replace).not.toHaveBeenCalled();
  });

  it("should redirect when user is not authenticated", async () => {
    // No user logged in
    render(
      <TestWrapper>
        <MockProtectedPage />
      </TestWrapper>
    );

    // Wait for redirect
    await waitFor(() => {
      expect(mockRouter.replace).toHaveBeenCalledWith("/");
    });
  });

  it("should redirect when token is expired", async () => {
    // Setup: Expired token (exp in the past)
    const expiredToken =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2MDAwMDAwMDAsInN1YiI6InRlc3QtdXNlciIsImVtYWlsIjoidGVzdEB0ZXN0LmNvbSIsImlhdCI6MTcxNjM5Njc0N30.mock";

    useAuthStore.setState({
      user: {
        id: "tenant-1",
        email: "tenant@example.com",
        name: "Test Tenant",
        role: "tenant",
        avatar: null,
      },
      token: expiredToken,
      isAuthenticated: true,
      _hasHydrated: true,
    });

    // Verify token is actually expired
    expect(isTokenExpired(expiredToken)).toBe(true);

    render(
      <TestWrapper>
        <MockProtectedPage />
      </TestWrapper>
    );

    // Should redirect and clear auth state
    await waitFor(() => {
      expect(mockRouter.replace).toHaveBeenCalledWith("/");
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
      expect(useAuthStore.getState().user).toBeNull();
    });
  });

  it("should enforce role-based access control", async () => {
    // Setup: User with wrong role
    useAuthStore.setState({
      user: {
        id: "admin-1",
        email: "admin@example.com",
        name: "Admin User",
        role: "admin", // Wrong role - test expects 'tenant'
        avatar: null,
      },
      token:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjk5OTk5OTk5OTksInN1YiI6ImFkbWluLXVzZXIiLCJlbWFpbCI6ImFkbWluQHRlc3QuY29tIiwiaWF0IjoxNzE2Mzk2NzQ3fQ.mock",
      isAuthenticated: true,
      _hasHydrated: true,
    });

    render(
      <TestWrapper>
        <MockProtectedPage />
      </TestWrapper>
    );

    // Should redirect due to insufficient role
    await waitFor(() => {
      expect(mockRouter.replace).toHaveBeenCalledWith("/");
    });
  });

  it("should persist login state across page reloads", async () => {
    const mockUser = {
      id: "tenant-1",
      email: "tenant@example.com",
      name: "Test Tenant",
      role: "tenant",
      avatar: null,
    };

    const mockToken =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjk5OTk5OTk5OTksInN1YiI6InRlc3QtdXNlciIsImVtYWlsIjoidGVzdEB0ZXN0LmNvbSIsImlhdCI6MTcxNjM5Njc0N30.mock";

    useAuthStore.setState({
      user: mockUser,
      token: mockToken,
      isAuthenticated: true,
      _hasHydrated: true,
    });

    const { rerender } = render(
      <TestWrapper>
        <MockProtectedPage />
      </TestWrapper>
    );

    // First render - should show protected content
    await waitFor(() => {
      expect(screen.getByTestId("welcome-message")).toBeInTheDocument();
    });

    // Simulate page reload - state should persist
    rerender(
      <TestWrapper>
        <MockProtectedPage />
      </TestWrapper>
    );

    // Protected content should still be there
    expect(screen.getByTestId("welcome-message")).toBeInTheDocument();
    expect(screen.getByText(/Welcome, Test Tenant/)).toBeInTheDocument();
  });
});
