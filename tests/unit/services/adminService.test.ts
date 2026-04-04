import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockGet } = vi.hoisted(() => ({
  mockGet: vi.fn(),
}));

vi.mock("@/src/services/apiClient", () => ({
  default: {
    get: mockGet,
  },
}));

import { API } from "@/src/constants/api";
import {
  getSummaryMetrics,
  getRevenueTrends,
  getPlanDistribution,
  getTopPerformingRestaurants,
  getExpiringSubscriptions,
  getTopTenants,
  getTenantDetail,
  getRestaurantRevenueSummary,
} from "@/src/services/adminService";

describe("adminService", () => {
  beforeEach(() => {
    mockGet.mockReset();
  });

  it("getSummaryMetrics returns payload data", async () => {
    const data = { totalTenants: 100 };
    mockGet.mockResolvedValue({ data: { isSuccess: true, data } });

    const result = await getSummaryMetrics();

    expect(mockGet).toHaveBeenCalledWith(API.ADMIN.SUMMARY_METRICS);
    expect(result).toEqual(data);
  });

  it("getRevenueTrends uses default months = 6", async () => {
    const data = [{ month: "2026-01", revenue: 1000 }];
    mockGet.mockResolvedValue({ data: { isSuccess: true, data } });

    const result = await getRevenueTrends();

    expect(mockGet).toHaveBeenCalledWith(API.ADMIN.REVENUE_TRENDS(6));
    expect(result).toEqual(data);
  });

  it("getPlanDistribution throws error when API response is unsuccessful", async () => {
    mockGet.mockResolvedValue({
      data: {
        isSuccess: false,
        data: null,
        message: "no plan distribution",
      },
    });

    await expect(getPlanDistribution()).rejects.toThrow("no plan distribution");
  });

  it("getTopPerformingRestaurants forwards custom top parameter", async () => {
    const data = [{ restaurantId: 1, totalRevenue: 9999 }];
    mockGet.mockResolvedValue({ data: { isSuccess: true, data } });

    const result = await getTopPerformingRestaurants(3);

    expect(mockGet).toHaveBeenCalledWith(API.ADMIN.TOP_PERFORMING_RESTAURANTS(3));
    expect(result).toEqual(data);
  });

  it("getExpiringSubscriptions returns list with default threshold", async () => {
    const data = [{ tenantId: "t-1", daysUntilExpiry: 5 }];
    mockGet.mockResolvedValue({ data: { isSuccess: true, data } });

    const result = await getExpiringSubscriptions();

    expect(mockGet).toHaveBeenCalledWith(API.ADMIN.EXPIRING_SUBSCRIPTIONS(30));
    expect(result).toEqual(data);
  });

  it("getTopTenants returns list using default top", async () => {
    const data = [{ tenantId: "tenant-1", totalRevenue: 10000 }];
    mockGet.mockResolvedValue({ data: { isSuccess: true, data } });

    const result = await getTopTenants();

    expect(mockGet).toHaveBeenCalledWith(API.ADMIN.TOP_TENANTS(10));
    expect(result).toEqual(data);
  });

  it("getTenantDetail builds endpoint with optional dates", async () => {
    const data = { tenantId: "tenant-1", branches: [] };
    mockGet.mockResolvedValue({ data: { isSuccess: true, data } });

    const result = await getTenantDetail("tenant-1", "2026-01-01", "2026-01-31");

    expect(mockGet).toHaveBeenCalledWith(
      API.ADMIN.TENANT_DETAIL("tenant-1", "2026-01-01", "2026-01-31"),
    );
    expect(result).toEqual(data);
  });

  it("getRestaurantRevenueSummary returns data", async () => {
    const data = { totalRevenue: 5000, orders: 25 };
    mockGet.mockResolvedValue({ data: { isSuccess: true, data } });

    const result = await getRestaurantRevenueSummary(1, "2026-01-01", "2026-01-31");

    expect(mockGet).toHaveBeenCalledWith(
      API.RESTAURANT.REVENUE_SUMMARY(1, "2026-01-01", "2026-01-31"),
    );
    expect(result).toEqual(data);
  });

  it("uses default error message for summary metrics when message is missing", async () => {
    mockGet.mockResolvedValue({ data: { isSuccess: false, data: null } });

    await expect(getSummaryMetrics()).rejects.toThrow("Failed to fetch summary metrics");
  });

  it("uses default error message for revenue trends when message is missing", async () => {
    mockGet.mockResolvedValue({ data: { isSuccess: false, data: null } });

    await expect(getRevenueTrends()).rejects.toThrow("Failed to fetch revenue trends");
  });

  it("uses default error message for top performing restaurants", async () => {
    mockGet.mockResolvedValue({ data: { isSuccess: false, data: null } });

    await expect(getTopPerformingRestaurants()).rejects.toThrow(
      "Failed to fetch top performing restaurants",
    );
  });

  it("uses default error message for expiring subscriptions", async () => {
    mockGet.mockResolvedValue({ data: { isSuccess: false, data: null } });

    await expect(getExpiringSubscriptions()).rejects.toThrow(
      "Failed to fetch expiring subscriptions",
    );
  });

  it("uses default error message for top tenants", async () => {
    mockGet.mockResolvedValue({ data: { isSuccess: false, data: null } });

    await expect(getTopTenants()).rejects.toThrow("Failed to fetch top tenants");
  });

  it("uses default error message for tenant detail", async () => {
    mockGet.mockResolvedValue({ data: { isSuccess: false, data: null } });

    await expect(getTenantDetail("tenant-1")).rejects.toThrow("Failed to fetch tenant detail");
  });

  it("uses default error message for revenue summary", async () => {
    mockGet.mockResolvedValue({ data: { isSuccess: false, data: null } });

    await expect(getRestaurantRevenueSummary(1)).rejects.toThrow("Failed to fetch revenue summary");
  });
});
