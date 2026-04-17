import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

import NotificationManagementPage from "@/src/app/admin/notification-management/page";
import { notificationService } from "@/src/services/notificationService";

const baseNotificationsResponse = {
  data: {
    isSuccess: true,
    data: {
      items: [
        {
          notificationId: 1,
          notifyTitle: "Thông báo A",
          notifySub: "Nội dung A",
          notifyStatus: 1,
          systemBlogUrl: "https://scan2order.id.vn/pages/public/blogs/11",
          sentAt: "2026-04-14T00:00:00Z",
          notifyTenants: [],
          isDeleted: false,
          createdAt: "2026-04-14T00:00:00Z",
          id: 1,
          updatedAt: null,
        },
      ],
      totalCount: 1,
      page: 1,
      pageSize: 7,
    },
  },
};

const baseTenantsResponse = {
  data: {
    isSuccess: true,
    data: [
      {
        id: "tenant-1",
        accountId: "acc-1",
        name: "Tenant A",
        phone: "0987654321",
      },
      {
        id: "tenant-2",
        accountId: "acc-2",
        name: "Tenant B",
        phone: "0911111111",
      },
    ],
  },
};

const baseBlogsResponse = {
  data: {
    isSuccess: true,
    data: {
      items: [
        {
          systemBlogId: 11,
          title: "Blog A",
        },
      ],
    },
  },
};

const baseNotifyTenantsResponse = {
  data: {
    isSuccess: true,
    data: [],
  },
};

describe("Integration: Admin Notification Management Flow", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();

    vi.spyOn(notificationService, "getAllNotifications").mockResolvedValue(
      baseNotificationsResponse as never,
    );
    vi.spyOn(notificationService, "getAllTenants").mockResolvedValue(
      baseTenantsResponse as never,
    );
    vi.spyOn(notificationService, "getAllBlogs").mockResolvedValue(
      baseBlogsResponse as never,
    );
    vi.spyOn(notificationService, "getAllNotifyTenants").mockResolvedValue(
      baseNotifyTenantsResponse as never,
    );
  });

  it("loads notification dashboard data and list", async () => {
    render(<NotificationManagementPage />);

    await waitFor(() => {
      expect(screen.getByText("Quản lý thông báo")).toBeInTheDocument();
      expect(screen.getByText("Thông báo A")).toBeInTheDocument();
      expect(screen.getByText("Tổng thông báo")).toBeInTheDocument();
      expect(screen.getByText("Tổng tenant")).toBeInTheDocument();
    });
  });

  it("validates empty create notification form and does not call API", async () => {
    const createSpy = vi.spyOn(notificationService, "createNotification");

    const user = userEvent.setup();
    render(<NotificationManagementPage />);

    await waitFor(() => {
      expect(screen.getByText("Thông báo A")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "Tạo thông báo" }));

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Tạo thông báo" }),
      ).toBeInTheDocument();
    });

    const titleInput = screen.getByPlaceholderText("Nhập tiêu đề");
    const subInput = screen.getByPlaceholderText("Nhập nội dung thông báo");
    await user.clear(titleInput);
    await user.clear(subInput);

    await user.click(
      screen.getByRole("button", { name: "Tạo và chọn bên thuê" }),
    );

    expect(createSpy).not.toHaveBeenCalled();
  });

  it("creates notification then assigns selected tenants", async () => {
    vi.spyOn(notificationService, "createNotification").mockResolvedValue({
      data: {
        isSuccess: true,
        data: {
          id: 99,
        },
      },
    } as never);

    const assignSpy = vi
      .spyOn(notificationService, "assignTenants")
      .mockResolvedValue({
        data: {
          isSuccess: true,
        },
      } as never);

    const user = userEvent.setup();
    render(<NotificationManagementPage />);

    await waitFor(() => {
      expect(screen.getByText("Thông báo A")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "Tạo thông báo" }));

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Tạo thông báo" }),
      ).toBeInTheDocument();
    });

    await user.type(
      screen.getByPlaceholderText("Nhập tiêu đề"),
      "Thông báo mới",
    );
    await user.type(
      screen.getByPlaceholderText("Nhập nội dung thông báo"),
      "Nội dung mới",
    );

    await user.click(
      screen.getByRole("button", { name: "Tạo và chọn bên thuê" }),
    );

    await waitFor(() => {
      expect(
        screen.getByText("Chỉ định bên thuê nhận thông báo"),
      ).toBeInTheDocument();
      expect(screen.getByText("Thông báo ID: #99")).toBeInTheDocument();
    });

    const tenantCheckboxes = screen.getAllByRole("checkbox");
    await user.click(tenantCheckboxes[1]);

    await user.click(
      screen.getByRole("button", { name: "Gửi đến bên thuê đã chọn" }),
    );

    await waitFor(() => {
      expect(assignSpy).toHaveBeenCalledWith({
        notificationId: 99,
        tenantIds: ["tenant-1"],
      });
    });
  });

  it("retries fetch when clicking refresh after first load error", async () => {
    let notificationCallCount = 0;

    vi.spyOn(notificationService, "getAllNotifications").mockImplementation(
      () => {
        notificationCallCount += 1;
        if (notificationCallCount === 1) {
          return Promise.reject(new Error("temporary error"));
        }
        return Promise.resolve(baseNotificationsResponse as never);
      },
    );

    const user = userEvent.setup();
    render(<NotificationManagementPage />);

    await waitFor(() => {
      expect(screen.getByText("Chưa có thông báo nào")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "Làm mới" }));

    await waitFor(() => {
      expect(screen.getByText("Thông báo A")).toBeInTheDocument();
    });

    expect(notificationCallCount).toBe(2);
  });
});
