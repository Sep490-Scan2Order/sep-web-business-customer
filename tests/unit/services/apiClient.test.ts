import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockGetState, mockIsTokenExpired } = vi.hoisted(() => ({
  mockGetState: vi.fn(),
  mockIsTokenExpired: vi.fn(),
}));

vi.mock("@/src/store/authStore", () => ({
  useAuthStore: {
    getState: mockGetState,
  },
  isTokenExpired: (token: string) => mockIsTokenExpired(token),
}));

vi.mock("react-toastify", () => ({
  toast: {
    error: vi.fn(),
  },
}));

import apiClient from "@/src/services/apiClient";

describe("apiClient interceptors", () => {
  beforeEach(() => {
    mockGetState.mockReset();
    mockIsTokenExpired.mockReset();
  });

  it("attaches Authorization header when token is available and valid", async () => {
    mockGetState.mockReturnValue({ token: "valid-token" });
    mockIsTokenExpired.mockReturnValue(false);

    const requestHandler = (apiClient.interceptors.request as unknown as { handlers: Array<{ fulfilled: (cfg: Record<string, unknown>) => Promise<Record<string, unknown>> | Record<string, unknown> }> }).handlers[0].fulfilled;

    const config = await requestHandler({ headers: {} });
    const headers = config.headers as Record<string, string>;

    expect(headers.Authorization).toBe("Bearer valid-token");
  });

  it("does not attach Authorization header when token is missing", async () => {
    mockGetState.mockReturnValue({ token: null });

    const requestHandler = (apiClient.interceptors.request as unknown as { handlers: Array<{ fulfilled: (cfg: Record<string, unknown>) => Promise<Record<string, unknown>> | Record<string, unknown> }> }).handlers[0].fulfilled;

    const config = await requestHandler({ headers: {} });
    const headers = config.headers as Record<string, string>;

    expect(headers.Authorization).toBeUndefined();
  });
});
