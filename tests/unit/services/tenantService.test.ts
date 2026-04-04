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
import { getTenantById, getTenantDashboardRevenue } from "@/src/services/tenantService";

describe("tenantService", () => {
  beforeEach(() => {
    mockGet.mockReset();
  });

  it("getTenantById returns payload directly when API does not wrap response", async () => {
    const user = { id: "tenant-1", email: "tenant@example.com" };
    mockGet.mockResolvedValue({ data: user });

    const result = await getTenantById("tenant-1");

    expect(mockGet).toHaveBeenCalledWith(API.TENANT.GET_TENANT_BY_ID("tenant-1"));
    expect(result).toEqual(user);
  });

  it("getTenantById returns wrapped data when isSuccess is true", async () => {
    const wrappedUser = { id: "tenant-2", email: "tenant2@example.com" };
    mockGet.mockResolvedValue({
      data: {
        isSuccess: true,
        message: "ok",
        data: wrappedUser,
      },
    });

    const result = await getTenantById("tenant-2");

    expect(result).toEqual(wrappedUser);
  });

  it("getTenantById throws when wrapped response is unsuccessful", async () => {
    mockGet.mockResolvedValue({
      data: {
        isSuccess: false,
        message: "Tenant not found",
        data: null,
      },
    });

    await expect(getTenantById("missing-id")).rejects.toThrow("Tenant not found");
  });

  it("getTenantDashboardRevenue builds query string from filter and returns data", async () => {
    const revenueData = {
      totalRevenue: 1000,
      growthRate: 12,
      chartData: [],
      topBranches: [],
    };

    mockGet.mockResolvedValue({
      data: {
        isSuccess: true,
        message: "ok",
        data: revenueData,
      },
    });

    const result = await getTenantDashboardRevenue({
      tenantId: "tenant-1",
      preset: "last7days",
      startDate: "2026-01-01",
      endDate: "2026-01-07",
    });

    expect(mockGet).toHaveBeenCalledWith(
      `${API.TENANT.DASHBOARD_REVENUE}?tenantId=tenant-1&preset=last7days&startDate=2026-01-01&endDate=2026-01-07`,
    );
    expect(result).toEqual(revenueData);
  });

  it("getTenantDashboardRevenue throws when API returns failure", async () => {
    mockGet.mockResolvedValue({
      data: {
        isSuccess: false,
        message: "Revenue unavailable",
        data: null,
      },
    });

    await expect(getTenantDashboardRevenue()).rejects.toThrow("Revenue unavailable");
  });

  it("getTenantById uses default message when wrapped response has no message", async () => {
    mockGet.mockResolvedValue({
      data: {
        isSuccess: false,
        data: null,
      },
    });

    await expect(getTenantById("missing-id")).rejects.toThrow(
      "Failed to fetch tenant information",
    );
  });

  it("getTenantDashboardRevenue uses default message when API omits message", async () => {
    mockGet.mockResolvedValue({
      data: {
        isSuccess: false,
        data: null,
      },
    });

    await expect(getTenantDashboardRevenue()).rejects.toThrow(
      "Failed to fetch tenant dashboard revenue",
    );
  });
});
