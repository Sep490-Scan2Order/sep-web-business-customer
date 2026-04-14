import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

import CategoryPage from "@/src/app/tenant/meals/category/page";
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

const createCategory = (overrides: Partial<Record<string, unknown>> = {}) =>
  ({
    id: 10,
    tenantId: "tenant-1",
    categoryName: "Món chính",
    isActive: true,
    createdAt: "2026-04-06T00:00:00Z",
    ...overrides,
  }) as never;

describe("Integration: Tenant Category Page Flow", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();

    useAuthStore.setState({
      user: mockTenantUser,
      token: "token-123",
      isAuthenticated: true,
    });
  });

  it("loads categories and supports searching from list view", async () => {
    vi.spyOn(apiClient, "get").mockResolvedValue({
      data: {
        isSuccess: true,
        data: [
          createCategory(),
          createCategory({ id: 11, categoryName: "Đồ uống" }),
        ],
      },
    } as never);

    const user = userEvent.setup();
    render(<CategoryPage />);

    await waitFor(() => {
      expect(screen.getByText("Món chính")).toBeInTheDocument();
      expect(screen.getByText("Đồ uống")).toBeInTheDocument();
      expect(screen.getByText("Danh mục món ăn")).toBeInTheDocument();
    });

    await user.type(
      screen.getByPlaceholderText("Tìm kiếm..."),
      "khong-ton-tai",
    );

    await waitFor(() => {
      expect(screen.getByText("Không tìm thấy danh mục")).toBeInTheDocument();
      expect(screen.queryByText("Món chính")).not.toBeInTheDocument();
      expect(screen.queryByText("Đồ uống")).not.toBeInTheDocument();
    });

    await user.clear(screen.getByPlaceholderText("Tìm kiếm..."));

    await waitFor(() => {
      expect(screen.getByText("Món chính")).toBeInTheDocument();
      expect(screen.getByText("Đồ uống")).toBeInTheDocument();
    });
  });

  it("creates a new category from empty state", async () => {
    vi.spyOn(apiClient, "get").mockResolvedValue({
      data: {
        isSuccess: true,
        data: [],
      },
    } as never);

    vi.spyOn(apiClient, "post").mockResolvedValue({
      data: {
        isSuccess: true,
        data: createCategory({ id: 12, categoryName: "Tráng miệng" }),
      },
    } as never);

    const user = userEvent.setup();
    render(<CategoryPage />);

    await waitFor(() => {
      expect(
        screen.getByText("Tạo danh mục món ăn đầu tiên của bạn"),
      ).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "Tạo danh mục" }));

    await waitFor(() => {
      expect(screen.getByText("Tạo danh mục mới")).toBeInTheDocument();
    });

    await user.type(
      screen.getByPlaceholderText("Nhập tên danh mục..."),
      "Tráng miệng",
    );
    await user.click(screen.getByRole("button", { name: "Tạo mới" }));

    await waitFor(() => {
      expect(screen.getByText("Tráng miệng")).toBeInTheDocument();
    });

    expect(apiClient.post).toHaveBeenCalledWith(API.CATEGORY.CREATE, {
      categoryName: "Tráng miệng",
    });
  });

  it("updates an existing category from list", async () => {
    vi.spyOn(apiClient, "get").mockResolvedValue({
      data: {
        isSuccess: true,
        data: [createCategory()],
      },
    } as never);

    vi.spyOn(apiClient, "put").mockResolvedValue({
      data: {
        isSuccess: true,
      },
    } as never);

    const user = userEvent.setup();
    render(<CategoryPage />);

    await waitFor(() => {
      expect(screen.getByText("Món chính")).toBeInTheDocument();
    });

    await user.click(screen.getByTitle("Chỉnh sửa danh mục"));

    await waitFor(() => {
      expect(screen.getByText("Cập nhật danh mục")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Món chính")).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText("Nhập tên danh mục...");
    await user.clear(input);
    await user.type(input, "Món chính mới");
    await user.click(screen.getByRole("button", { name: "Cập nhật" }));

    await waitFor(() => {
      expect(screen.getByText("Món chính mới")).toBeInTheDocument();
    });

    expect(apiClient.put).toHaveBeenCalledWith(
      API.CATEGORY.UPDATE_CATEGORY(10),
      {
        categoryName: "Món chính mới",
      },
    );
  });

  it("deletes a category after confirmation", async () => {
    vi.spyOn(apiClient, "get").mockResolvedValue({
      data: {
        isSuccess: true,
        data: [createCategory()],
      },
    } as never);

    vi.spyOn(apiClient, "delete").mockResolvedValue({
      data: {
        isSuccess: true,
        message: "Delete success",
      },
    } as never);

    const user = userEvent.setup();
    render(<CategoryPage />);

    await waitFor(() => {
      expect(screen.getByText("Món chính")).toBeInTheDocument();
    });

    await user.click(screen.getByTitle("Xóa danh mục"));

    await waitFor(() => {
      expect(screen.getByText("Xác nhận xóa danh mục")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "Xóa" }));

    await waitFor(() => {
      expect(screen.queryByText("Món chính")).not.toBeInTheDocument();
    });

    expect(apiClient.delete).toHaveBeenCalledWith(
      API.CATEGORY.DELETE_CATEGORY(10),
    );
  });
});
