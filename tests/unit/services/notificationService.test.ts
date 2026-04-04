import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockGet, mockPost, mockPut } = vi.hoisted(() => ({
  mockGet: vi.fn(),
  mockPost: vi.fn(),
  mockPut: vi.fn(),
}));

vi.mock("@/src/services/apiClient", () => ({
  default: {
    get: mockGet,
    post: mockPost,
    put: mockPut,
  },
}));

import { API } from "@/src/constants/api";
import { notificationService } from "@/src/services/notificationService";

describe("notificationService", () => {
  beforeEach(() => {
    mockGet.mockReset();
    mockPost.mockReset();
    mockPut.mockReset();
  });

  it("getAllNotifications calls expected endpoint with defaults", async () => {
    mockGet.mockResolvedValue({ data: { isSuccess: true, data: {} } });

    await notificationService.getAllNotifications();

    expect(mockGet).toHaveBeenCalledWith(API.NOTIFICATION.GET_ALL(1, 7));
  });

  it("createNotification posts payload to notification endpoint", async () => {
    const payload = { title: "System", content: "Hello" };
    mockPost.mockResolvedValue({ data: { isSuccess: true, data: {} } });

    await notificationService.createNotification(payload as never);

    expect(mockPost).toHaveBeenCalledWith(API.NOTIFICATION.POST, payload);
  });

  it("assignTenants posts payload", async () => {
    const payload = { notificationId: 1, tenantIds: ["t-1"] };
    mockPost.mockResolvedValue({ data: { isSuccess: true, data: true } });

    await notificationService.assignTenants(payload as never);

    expect(mockPost).toHaveBeenCalledWith(API.NOTIFY_TENANT.POST, payload);
  });

  it("getAllTenants calls tenant list endpoint", async () => {
    mockGet.mockResolvedValue({ data: { isSuccess: true, data: [] } });

    await notificationService.getAllTenants();

    expect(mockGet).toHaveBeenCalledWith(API.TENANT.GET_ALL);
  });

  it("getAllBlogs calls endpoint with default pagination", async () => {
    mockGet.mockResolvedValue({ data: { isSuccess: true, data: {} } });

    await notificationService.getAllBlogs();

    expect(mockGet).toHaveBeenCalledWith(API.BLOG.GET_ALL(1, 100));
  });

  it("getAllNotifyTenants calls endpoint", async () => {
    mockGet.mockResolvedValue({ data: { isSuccess: true, data: [] } });

    await notificationService.getAllNotifyTenants();

    expect(mockGet).toHaveBeenCalledWith(API.NOTIFY_TENANT.GET_ALL);
  });

  it("countNotifyTenantsByStatus builds status endpoint", async () => {
    mockGet.mockResolvedValue({ data: { isSuccess: true, data: 3 } });

    await notificationService.countNotifyTenantsByStatus("tenant-1", 0);

    expect(mockGet).toHaveBeenCalledWith(API.NOTIFY_TENANT.COUNT_BY_TENANT_ID("tenant-1", 0));
  });

  it("updateReadByTenant calls PUT endpoint", async () => {
    const payload = { tenantId: "tenant-1" };
    mockPut.mockResolvedValue({ data: { isSuccess: true, data: "ok" } });

    await notificationService.updateReadByTenant(payload as never);

    expect(mockPut).toHaveBeenCalledWith(API.NOTIFY_TENANT.UPDATE_READ_BY_TENANT_ID, payload);
  });

  it("getNotifyTenantDetails uses provided pagination", async () => {
    mockGet.mockResolvedValue({ data: { isSuccess: true, data: {} } });

    await notificationService.getNotifyTenantDetails(2, 9);

    expect(mockGet).toHaveBeenCalledWith(API.NOTIFY_TENANT.DETAILS(2, 9));
  });
});
