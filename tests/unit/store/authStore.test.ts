import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";

const { mockGetTenantById } = vi.hoisted(() => ({
  mockGetTenantById: vi.fn(),
}));

vi.mock("@/src/services/tenantService", () => ({
  getTenantById: mockGetTenantById,
}));

import { isTokenExpired, useAuthStore, useHasHydrated } from "@/src/store/authStore";

function createJwtWithExp(expSeconds: number) {
  const header = Buffer.from(JSON.stringify({ alg: "none", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(JSON.stringify({ exp: expSeconds })).toString("base64url");
  return `${header}.${payload}.signature`;
}

describe("authStore", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));
    mockGetTenantById.mockReset();
    useAuthStore.getState().setHasHydrated(false);
    useAuthStore.getState().logout();
    vi.advanceTimersByTime(1000);
    localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("isTokenExpired returns false for valid token and true for expired token", () => {
    const nowSec = Math.floor(Date.now() / 1000);
    const validToken = createJwtWithExp(nowSec + 3600);
    const expiredToken = createJwtWithExp(nowSec - 60);

    expect(isTokenExpired(validToken)).toBe(false);
    expect(isTokenExpired(expiredToken)).toBe(true);
  });

  it("isTokenExpired returns true for malformed token", () => {
    expect(isTokenExpired("not-a-jwt")).toBe(true);
  });

  it("setAuth and logout update store and persisted storage", () => {
    const user = { id: "tenant-1", email: "tenant@example.com" };

    useAuthStore.getState().setAuth(user, "token-123");
    const stateAfterLogin = useAuthStore.getState();

    expect(stateAfterLogin.user?.id).toBe("tenant-1");
    expect(stateAfterLogin.token).toBe("token-123");
    expect(stateAfterLogin.isAuthenticated).toBe(true);

    const persisted = localStorage.getItem("auth-storage");
    expect(persisted).toContain("token-123");

    useAuthStore.getState().logout();
    const stateAfterLogout = useAuthStore.getState();

    expect(stateAfterLogout.user).toBeNull();
    expect(stateAfterLogout.token).toBeNull();
    expect(stateAfterLogout.isAuthenticated).toBe(false);
    expect(stateAfterLogout.isLoggingOut).toBe(true);

    vi.advanceTimersByTime(1000);
    expect(useAuthStore.getState().isLoggingOut).toBe(false);
  });

  it("refreshUserInfo returns null when user id is missing", async () => {
    useAuthStore.getState().setAuth(null, "token-123");

    const result = await useAuthStore.getState().refreshUserInfo();

    expect(result).toBeNull();
    expect(mockGetTenantById).not.toHaveBeenCalled();
  });

  it("refreshUserInfo updates user with latest profile", async () => {
    useAuthStore.getState().setAuth(
      { id: "tenant-1", email: "old@example.com" },
      "token-123",
    );

    mockGetTenantById.mockResolvedValue({
      id: "tenant-1",
      email: "new@example.com",
      fullName: "Updated Name",
    });

    const result = await useAuthStore.getState().refreshUserInfo();

    expect(mockGetTenantById).toHaveBeenCalledWith("tenant-1");
    expect(result).toEqual({
      id: "tenant-1",
      email: "new@example.com",
      fullName: "Updated Name",
    });
    expect(useAuthStore.getState().user?.email).toBe("new@example.com");
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
  });

  it("refreshUserInfo returns null and keeps previous state when API fails", async () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    useAuthStore.getState().setAuth(
      { id: "tenant-1", email: "tenant@example.com" },
      "token-123",
    );
    mockGetTenantById.mockRejectedValue(new Error("boom"));

    const result = await useAuthStore.getState().refreshUserInfo();

    expect(result).toBeNull();
    expect(useAuthStore.getState().user?.email).toBe("tenant@example.com");
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  it("setUser updates auth flag based on user presence", () => {
    useAuthStore.getState().setUser({ id: "tenant-9", email: "u@example.com" });
    expect(useAuthStore.getState().isAuthenticated).toBe(true);

    useAuthStore.getState().setUser(null);
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });

  it("setToken updates only token without changing current user", () => {
    useAuthStore.getState().setUser({ id: "tenant-1", email: "tenant@example.com" });
    useAuthStore.getState().setToken("new-token");

    expect(useAuthStore.getState().token).toBe("new-token");
    expect(useAuthStore.getState().user?.id).toBe("tenant-1");
  });

  it("restoreAuthFromStorage is a no-op for backward compatibility", async () => {
    const store = await import("@/src/store/authStore");

    expect(store.restoreAuthFromStorage()).toBeUndefined();
  });

  it("useHasHydrated reflects hydration flag from store", () => {
    useAuthStore.getState().setHasHydrated(true);
    const { result } = renderHook(() => useHasHydrated());

    expect(result.current).toBe(true);

    useAuthStore.getState().setHasHydrated(false);
    const { result: result2 } = renderHook(() => useHasHydrated());
    expect(result2.current).toBe(false);
  });

  it("rehydrate triggers logout when persisted token is expired", async () => {
    const nowSec = Math.floor(Date.now() / 1000);
    const expiredToken = createJwtWithExp(nowSec - 3600);

    localStorage.setItem(
      "auth-storage",
      JSON.stringify({
        state: {
          user: { id: "tenant-1", email: "tenant@example.com" },
          token: expiredToken,
          isAuthenticated: true,
        },
        version: 0,
      }),
    );

    await (useAuthStore as unknown as { persist: { rehydrate: () => Promise<void> } }).persist.rehydrate();

    const state = useAuthStore.getState();
    expect(state.token).toBeNull();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isLoggingOut).toBe(true);

    vi.advanceTimersByTime(1000);
    expect(useAuthStore.getState().isLoggingOut).toBe(false);
  });
});
