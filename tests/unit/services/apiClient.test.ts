import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { mockGetState, mockIsTokenExpired } = vi.hoisted(() => ({
  mockGetState: vi.fn(),
  mockIsTokenExpired: vi.fn(),
}));

const { mockToastError } = vi.hoisted(() => ({
  mockToastError: vi.fn(),
}));

vi.mock("@/src/store/authStore", () => ({
  useAuthStore: {
    getState: mockGetState,
  },
  isTokenExpired: (token: string) => mockIsTokenExpired(token),
}));

vi.mock("react-toastify", () => ({
  toast: {
    error: mockToastError,
  },
}));

import apiClient, { updateRestaurantLocation } from "@/src/services/apiClient";
type RequestHandler = (cfg: Record<string, unknown>) => Promise<Record<string, unknown>> | Record<string, unknown>;
type ResponseRejectedHandler = (error: { response?: { status?: number } }) => Promise<unknown>;

describe("apiClient interceptors", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockGetState.mockReset();
    mockIsTokenExpired.mockReset();
    mockToastError.mockReset();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("attaches Authorization header when token is available and valid", async () => {
    mockGetState.mockReturnValue({ token: "valid-token" });
    mockIsTokenExpired.mockReturnValue(false);

    const requestHandler = (apiClient.interceptors.request as unknown as { handlers: Array<{ fulfilled: RequestHandler }> }).handlers[0].fulfilled;

    const config = await requestHandler({ headers: {} });
    const headers = config.headers as Record<string, string>;

    expect(headers.Authorization).toBe("Bearer valid-token");
  });

  it("does not attach Authorization header when token is missing", async () => {
    mockGetState.mockReturnValue({ token: null });

    const requestHandler = (apiClient.interceptors.request as unknown as { handlers: Array<{ fulfilled: RequestHandler }> }).handlers[0].fulfilled;

    const config = await requestHandler({ headers: {} });
    const headers = config.headers as Record<string, string>;

    expect(headers.Authorization).toBeUndefined();
  });

  it("rejects request and redirects to admin login when token is expired", async () => {
    const logout = vi.fn();

    mockGetState.mockReturnValue({
      token: "expired-token",
      logout,
      user: { role: "Administrator" },
    });
    mockIsTokenExpired.mockReturnValue(true);

    const requestHandler = (apiClient.interceptors.request as unknown as { handlers: Array<{ fulfilled: RequestHandler }> }).handlers[0].fulfilled;

    await expect(requestHandler({ headers: {} })).rejects.toThrow("Token hết hạn");
    expect(logout).toHaveBeenCalledTimes(1);
    expect(mockToastError).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(5000);
  });

  it("handles 401 response by triggering token expiry flow for tenant user", async () => {
    const logout = vi.fn();
    mockGetState.mockReturnValue({
      token: "token-123",
      logout,
      user: { role: "Tenant" },
    });

    const responseRejected = (apiClient.interceptors.response as unknown as {
      handlers: Array<{ rejected: ResponseRejectedHandler }>;
    }).handlers[0].rejected;

    await expect(responseRejected({ response: { status: 401 } })).rejects.toEqual({
      response: { status: 401 },
    });

    expect(logout).toHaveBeenCalledTimes(1);
    expect(mockToastError).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(5000);
  });

  it("returns response unchanged in success interceptor", async () => {
    const responseFulfilled = (apiClient.interceptors.response as unknown as {
      handlers: Array<{ fulfilled: (response: unknown) => unknown }>;
    }).handlers[0].fulfilled;

    const response = { data: { ok: true }, status: 200 };

    expect(responseFulfilled(response)).toEqual(response);
  });

  it("does not trigger expiry flow for non-401 response errors", async () => {
    const logout = vi.fn();
    mockGetState.mockReturnValue({
      token: "token-123",
      logout,
      user: { role: "Tenant" },
    });

    const responseRejected = (apiClient.interceptors.response as unknown as {
      handlers: Array<{ rejected: ResponseRejectedHandler }>;
    }).handlers[0].rejected;

    await expect(responseRejected({ response: { status: 500 } })).rejects.toEqual({
      response: { status: 500 },
    });

    expect(logout).not.toHaveBeenCalled();
    expect(mockToastError).not.toHaveBeenCalled();
  });
});

describe("updateRestaurantLocation", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("sends multipart form data and returns API response", async () => {
    const putSpy = vi.spyOn(apiClient, "put").mockResolvedValue({
      data: {
        isSuccess: true,
        message: "Updated",
        data: { id: 1, restaurantName: "Demo Restaurant" },
      },
    });

    const payload = {
      id: 1,
      restaurantName: "Demo Restaurant",
      address: "123 Street",
      phone: "0123456789",
      description: "Description",
      latitude: 10.123,
      longitude: 106.789,
    };

    const result = await updateRestaurantLocation(payload);

    expect(putSpy).toHaveBeenCalledTimes(1);
    const [url, formData, config] = putSpy.mock.calls[0];

    expect(url).toBe("/Restaurant/1");
    expect(formData).toBeInstanceOf(FormData);
    expect((formData as FormData).get("RestaurantName")).toBe("Demo Restaurant");
    expect((formData as FormData).get("Latitude")).toBe("10.123");
    expect((formData as FormData).get("Longitude")).toBe("106.789");
    expect(config).toEqual({
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    expect(result).toEqual({
      isSuccess: true,
      message: "Updated",
      data: { id: 1, restaurantName: "Demo Restaurant" },
    });
  });
});
