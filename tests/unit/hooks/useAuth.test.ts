import { describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";

const mockedState = {
  user: { id: "tenant-1", email: "tenant@example.com" },
  token: "token-123",
  isAuthenticated: true,
  logout: vi.fn(),
  refreshUserInfo: vi.fn(),
};

const mockUseAuthStore = vi.fn(() => mockedState);

vi.mock("@/src/store/authStore", () => ({
  useAuthStore: () => mockUseAuthStore(),
}));

import { useAuth } from "@/src/hooks/useAuth";

describe("useAuth", () => {
  it("returns auth state and actions from authStore", () => {
    const { result } = renderHook(() => useAuth());

    expect(result.current.user?.id).toBe("tenant-1");
    expect(result.current.token).toBe("token-123");
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.logout).toBe(mockedState.logout);
    expect(result.current.refreshUserInfo).toBe(mockedState.refreshUserInfo);
  });
});
