import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

import UsersPage from "@/src/app/tenant/users/page";
import { API } from "@/src/constants/api";
import apiClient from "@/src/services/apiClient";
import { useAuthStore } from "@/src/store/authStore";

const mockTenantUser = {
  id: "tenant-1",
  email: "tenant@example.com",
  name: "Test Tenant",
  role: "tenant",
  avatar: null,
};

describe("Integration: Tenant Users Flow", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();

    useAuthStore.setState({
      user: mockTenantUser,
      token: "token-123",
      isAuthenticated: true,
    });
  });

  it("loads restaurants, selects one, and renders its staff list", async () => {
    vi.spyOn(apiClient, "get").mockImplementation((url: string) => {
      if (url === API.RESTAURANT.GET_ALL_RESTAURANT_BY_TENANT_ID) {
        return Promise.resolve({
          data: {
            isSuccess: true,
            data: [
              {
                id: 101,
                tenantId: "tenant-1",
                restaurantName: "Nhà hàng A",
                address: "123 Đường A",
                image: "",
              },
            ],
          },
        } as never);
      }

      if (url === `${API.STAFF.GET_ALL}?restaurantId=101&page=1&pageSize=100`) {
        return Promise.resolve({
          status: 200,
          data: {
            items: [
              {
                id: "staff-1",
                accountId: "acc-1",
                restaurantId: 101,
                restaurantName: "Nhà hàng A",
                name: "Nguyen Van A",
                role: "Thu ngân",
                avatar: "",
                isActive: true,
                createdAt: "2026-04-06T00:00:00Z",
              },
            ],
          },
        } as never);
      }

      return Promise.reject(new Error(`Unexpected GET ${url}`));
    });

    const user = userEvent.setup();
    render(<UsersPage />);

    await waitFor(() => {
      expect(screen.getByText("Nhà hàng A")).toBeInTheDocument();
    });

    await user.click(screen.getByText("Nhà hàng A"));

    await waitFor(() => {
      expect(screen.getByText("Danh sách nhân viên")).toBeInTheDocument();
      expect(screen.getByText("Nguyen Van A")).toBeInTheDocument();
    });

    expect(apiClient.get).toHaveBeenNthCalledWith(
      1,
      API.RESTAURANT.GET_ALL_RESTAURANT_BY_TENANT_ID,
    );
    expect(apiClient.get).toHaveBeenNthCalledWith(
      2,
      `${API.STAFF.GET_ALL}?restaurantId=101&page=1&pageSize=100`,
    );
  });

  it("creates a new staff member from the selected restaurant", async () => {
    vi.spyOn(apiClient, "get").mockImplementation((url: string) => {
      if (url === API.RESTAURANT.GET_ALL_RESTAURANT_BY_TENANT_ID) {
        return Promise.resolve({
          data: {
            isSuccess: true,
            data: [
              {
                id: 101,
                tenantId: "tenant-1",
                restaurantName: "Nhà hàng A",
                address: "123 Đường A",
                image: "",
              },
            ],
          },
        } as never);
      }

      if (url === `${API.STAFF.GET_ALL}?restaurantId=101&page=1&pageSize=100`) {
        return Promise.resolve({
          status: 200,
          data: {
            items: [],
          },
        } as never);
      }

      return Promise.reject(new Error(`Unexpected GET ${url}`));
    });

    vi.spyOn(apiClient, "post").mockResolvedValue({
      data: {
        isSuccess: true,
        data: {
          id: "staff-2",
          accountId: "acc-2",
          restaurantId: 101,
          restaurantName: "Nhà hàng A",
          name: "Tran Thi B",
          role: "Nhân viên",
          avatar: "",
          isActive: true,
          createdAt: "2026-04-06T00:00:00Z",
        },
      },
    } as never);

    const user = userEvent.setup();
    render(<UsersPage />);

    await waitFor(() => {
      expect(screen.getByText("Nhà hàng A")).toBeInTheDocument();
    });

    await user.click(screen.getByText("Nhà hàng A"));

    await waitFor(() => {
      expect(screen.getByText("Thêm nhân viên")).toBeInTheDocument();
    });

    await user.click(screen.getByText("Thêm nhân viên"));

    await waitFor(() => {
      expect(screen.getByText("Tạo nhân viên mới")).toBeInTheDocument();
    });

    await user.type(
      screen.getByPlaceholderText("Nhập tên nhân viên..."),
      "Tran Thi B",
    );
    await user.type(
      screen.getByPlaceholderText("Nhập email..."),
      "staff@example.com",
    );
    await user.type(
      screen.getByPlaceholderText("Nhập số điện thoại..."),
      "0987654321",
    );

    await user.click(screen.getByRole("button", { name: "Tạo mới" }));

    await waitFor(() => {
      expect(screen.getByText("Tran Thi B")).toBeInTheDocument();
    });

    expect(apiClient.post).toHaveBeenCalledWith(API.STAFF.CREATE, {
      restaurantId: 101,
      email: "staff@example.com",
      name: "Tran Thi B",
      phone: "0987654321",
    });
  });

  it("shows empty state when tenant has no restaurants", async () => {
    vi.spyOn(apiClient, "get").mockResolvedValue({
      data: {
        isSuccess: true,
        data: [],
      },
    } as never);

    render(<UsersPage />);

    await waitFor(() => {
      expect(screen.getByText("Chưa có nhà hàng nào")).toBeInTheDocument();
    });

    expect(
      screen.getByText("Vui lòng tạo nhà hàng trước khi quản lý nhân viên"),
    ).toBeInTheDocument();
  });

  it("shows empty staff state for selected restaurant and supports going back", async () => {
    vi.spyOn(apiClient, "get").mockImplementation((url: string) => {
      if (url === API.RESTAURANT.GET_ALL_RESTAURANT_BY_TENANT_ID) {
        return Promise.resolve({
          data: {
            isSuccess: true,
            data: [
              {
                id: 101,
                tenantId: "tenant-1",
                restaurantName: "Nhà hàng A",
                address: "123 Đường A",
                image: "",
              },
            ],
          },
        } as never);
      }

      if (url === `${API.STAFF.GET_ALL}?restaurantId=101&page=1&pageSize=100`) {
        return Promise.resolve({
          status: 200,
          data: {
            items: [],
          },
        } as never);
      }

      return Promise.reject(new Error(`Unexpected GET ${url}`));
    });

    const user = userEvent.setup();
    render(<UsersPage />);

    await waitFor(() => {
      expect(screen.getByText("Nhà hàng A")).toBeInTheDocument();
    });

    await user.click(screen.getByText("Nhà hàng A"));

    await waitFor(() => {
      expect(screen.getByText("Chưa có nhân viên nào")).toBeInTheDocument();
      expect(
        screen.getByText("Nhấn nút “Thêm nhân viên” để bắt đầu"),
      ).toBeInTheDocument();
    });

    await user.click(
      screen.getByRole("button", { name: "Quay lại chọn nhà hàng" }),
    );

    await waitFor(() => {
      expect(
        screen.getByText("Chọn nhà hàng để quản lý nhân viên"),
      ).toBeInTheDocument();
      expect(screen.getByText("Nhà hàng A")).toBeInTheDocument();
    });
  });

  it("opens update modal and supports searching staff list", async () => {
    vi.spyOn(apiClient, "get").mockImplementation((url: string) => {
      if (url === API.RESTAURANT.GET_ALL_RESTAURANT_BY_TENANT_ID) {
        return Promise.resolve({
          data: {
            isSuccess: true,
            data: [
              {
                id: 101,
                tenantId: "tenant-1",
                restaurantName: "Nhà hàng A",
                address: "123 Đường A",
                image: "",
              },
            ],
          },
        } as never);
      }

      if (url === `${API.STAFF.GET_ALL}?restaurantId=101&page=1&pageSize=100`) {
        return Promise.resolve({
          status: 200,
          data: {
            items: [
              {
                id: "staff-1",
                accountId: "acc-1",
                restaurantId: 101,
                restaurantName: "Nhà hàng A",
                name: "Nguyen Van A",
                role: "Thu ngân",
                avatar: "",
                isActive: true,
                createdAt: "2026-04-06T00:00:00Z",
              },
            ],
          },
        } as never);
      }

      return Promise.reject(new Error(`Unexpected GET ${url}`));
    });

    const user = userEvent.setup();
    render(<UsersPage />);

    await waitFor(() => {
      expect(screen.getByText("Nhà hàng A")).toBeInTheDocument();
    });

    await user.click(screen.getByText("Nhà hàng A"));

    await waitFor(() => {
      expect(screen.getByText("Nguyen Van A")).toBeInTheDocument();
    });

    await user.type(
      screen.getByPlaceholderText("Tìm kiếm..."),
      "khong-ton-tai",
    );

    await waitFor(() => {
      expect(screen.getByText("Không tìm thấy nhân viên")).toBeInTheDocument();
    });

    await user.clear(screen.getByPlaceholderText("Tìm kiếm..."));

    await waitFor(() => {
      expect(screen.getByText("Nguyen Van A")).toBeInTheDocument();
    });

    await user.click(screen.getByText("Nguyen Van A"));

    await waitFor(() => {
      expect(screen.getByText("Cập nhật nhân viên")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Nguyen Van A")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Cập nhật" }),
      ).toBeInTheDocument();
    });
  });
});
