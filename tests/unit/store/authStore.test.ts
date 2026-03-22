import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { isTokenExpired, useAuthStore } from "@/src/store/authStore";

function createJwtWithExp(expSeconds: number) {
  const header = Buffer.from(JSON.stringify({ alg: "none", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(JSON.stringify({ exp: expSeconds })).toString("base64url");
  return `${header}.${payload}.signature`;
}

describe("authStore", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));
    useAuthStore.getState().logout();
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
  });
});
