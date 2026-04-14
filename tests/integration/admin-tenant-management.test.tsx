import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

import TenantManagementPage from "@/src/app/admin/tenant-management/page";
import { API } from "@/src/constants/api";
import apiClient from "@/src/services/apiClient";

type TenantApiItem = {
  id: string;
  name: string;
  accountId: string;
  email: string;
  phone: string;
  avatar: string | null;
  role: string;
  verified: boolean;
  isActive: boolean;
  taxNumber: string | null;
  bankId: string | null;
  cardNumber: string | null;
  bankName: string | null;
  bankLogo: string | null;
  isVerifyBank: boolean;
  isVerifyTax: boolean;
  debtStartedAt: Date | null;
  subscriptionExpiryDate: Date | null;
  lastWarningSentAt: Date | null;
  totalDebtAmount: number;
  isSuspended: boolean;
  suspendedAt: Date | null;
};

const createTenant = (
  overrides: Partial<TenantApiItem> = {},
): TenantApiItem => ({
  id: "tenant-1",
  name: "Tenant A",
  accountId: "acc-tenant-a",
  email: "tenant-a@example.com",
  phone: "0987654321",
  avatar: null,
  role: "tenant",
  verified: true,
  isActive: true,
  taxNumber: null,
  bankId: null,
  cardNumber: null,
  bankName: null,
  bankLogo: null,
  isVerifyBank: false,
  isVerifyTax: false,
  debtStartedAt: null,
  subscriptionExpiryDate: null,
  lastWarningSentAt: null,
  totalDebtAmount: 100000,
  isSuspended: false,
  suspendedAt: null,
  ...overrides,
});

describe("Integration: Admin Tenant Management Flow", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it("loads tenant list and renders table rows", async () => {
    vi.spyOn(apiClient, "get").mockResolvedValue({
      status: 200,
      data: {
        isSuccess: true,
        message: "Success",
        data: [
          createTenant(),
          createTenant({
            id: "tenant-2",
            name: "Tenant B",
            accountId: "acc-tenant-b",
            phone: "0911111111",
          }),
        ],
        errors: [],
        timestamp: "2026-04-14T00:00:00Z",
      },
    } as never);

    render(<TenantManagementPage />);

    await waitFor(() => {
      expect(screen.getByText("Quản lý bên thuê")).toBeInTheDocument();
      expect(screen.getByText("Tenant A")).toBeInTheDocument();
      expect(screen.getByText("Tenant B")).toBeInTheDocument();
    });

    expect(apiClient.get).toHaveBeenCalledWith(API.TENANT.GET_ALL);
  });

  it("filters tenants by search query", async () => {
    vi.spyOn(apiClient, "get").mockResolvedValue({
      status: 200,
      data: {
        isSuccess: true,
        message: "Success",
        data: [
          createTenant(),
          createTenant({
            id: "tenant-2",
            name: "Tenant B",
            accountId: "acc-tenant-b",
            phone: "0911111111",
          }),
        ],
        errors: [],
        timestamp: "2026-04-14T00:00:00Z",
      },
    } as never);

    const user = userEvent.setup();
    render(<TenantManagementPage />);

    await waitFor(() => {
      expect(screen.getByText("Tenant A")).toBeInTheDocument();
      expect(screen.getByText("Tenant B")).toBeInTheDocument();
    });

    await user.type(screen.getByPlaceholderText("Tìm kiếm"), "khong-ton-tai");

    await waitFor(() => {
      expect(screen.getByText("Không tìm thấy bên thuê")).toBeInTheDocument();
      expect(screen.queryByText("Tenant A")).not.toBeInTheDocument();
      expect(screen.queryByText("Tenant B")).not.toBeInTheDocument();
    });
  });

  it("selects all tenants on current page", async () => {
    vi.spyOn(apiClient, "get").mockResolvedValue({
      status: 200,
      data: {
        isSuccess: true,
        message: "Success",
        data: [
          createTenant(),
          createTenant({
            id: "tenant-2",
            name: "Tenant B",
            accountId: "acc-tenant-b",
            phone: "0911111111",
          }),
        ],
        errors: [],
        timestamp: "2026-04-14T00:00:00Z",
      },
    } as never);

    const user = userEvent.setup();
    render(<TenantManagementPage />);

    await waitFor(() => {
      expect(screen.getByText("Tenant A")).toBeInTheDocument();
    });

    const checkboxes = screen.getAllByRole("checkbox") as HTMLInputElement[];
    expect(checkboxes.length).toBe(3);

    await user.click(checkboxes[0]);

    expect(checkboxes[1].checked).toBe(true);
    expect(checkboxes[2].checked).toBe(true);
  });

  it("suspends tenant after confirm action", async () => {
    vi.spyOn(apiClient, "get").mockResolvedValue({
      status: 200,
      data: {
        isSuccess: true,
        message: "Success",
        data: [createTenant()],
        errors: [],
        timestamp: "2026-04-14T00:00:00Z",
      },
    } as never);

    vi.spyOn(apiClient, "put").mockResolvedValue({
      status: 200,
      data: {
        isSuccess: true,
      },
    } as never);

    const user = userEvent.setup();
    render(<TenantManagementPage />);

    await waitFor(() => {
      expect(screen.getByText("Tenant A")).toBeInTheDocument();
      expect(screen.getByText("Hoạt động")).toBeInTheDocument();
    });

    const row = screen.getByText("Tenant A").closest("tr");
    expect(row).not.toBeNull();

    const dropdownIcon = row?.querySelector("svg.lucide-ellipsis");
    const dropdownButton = dropdownIcon?.closest(
      "button",
    ) as HTMLButtonElement | null;
    expect(dropdownButton).not.toBeNull();

    await user.click(dropdownButton as HTMLButtonElement);
    await user.click(screen.getByText("Đình chỉ bên thuê"));

    await waitFor(() => {
      expect(
        screen.getByText("Xác nhận đình chỉ bên thuê"),
      ).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "Đình chỉ" }));

    await waitFor(() => {
      expect(screen.getByText("Bị đình chỉ")).toBeInTheDocument();
    });

    expect(apiClient.put).toHaveBeenCalledWith(
      API.TENANT.IS_SUSPENDED("tenant-1", true),
    );
  });
});
