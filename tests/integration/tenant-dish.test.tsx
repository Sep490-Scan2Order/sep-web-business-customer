import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

import DishPage from "@/src/app/tenant/meals/dish/page";
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

const mockCategory = {
  id: 10,
  tenantId: "tenant-1",
  categoryName: "Main",
  isActive: true,
  createdAt: "2026-04-06T00:00:00Z",
};

const createDish = (overrides: Partial<Record<string, unknown>> = {}) =>
  ({
    id: 101,
    categoryId: 10,
    categoryName: "Main",
    dishName: "Pho Bo",
    price: 50000,
    description: "Vietnamese noodle soup",
    type: 0,
    isAvailable: true,
    ...overrides,
  }) as never;

describe("Integration: Tenant Dish Flow", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();

    useAuthStore.setState({
      user: mockTenantUser,
      token: "token-123",
      isAuthenticated: true,
    });
  });

  it("loads categories and dishes then renders the dish list", async () => {
    vi.spyOn(apiClient, "get").mockImplementation((url: string) => {
      if (url === API.CATEGORY.GET_ALL_BY_TENANT_ID("tenant-1")) {
        return Promise.resolve({
          data: {
            isSuccess: true,
            data: [mockCategory],
          },
        } as never);
      }

      if (url === API.DISHES.GET_ALL_BY_TENANT_ID("tenant-1")) {
        return Promise.resolve({
          data: {
            isSuccess: true,
            data: [createDish()],
          },
        } as never);
      }

      return Promise.reject(new Error(`Unexpected GET ${url}`));
    });

    render(<DishPage />);

    await waitFor(() => {
      expect(screen.getByText("Pho Bo")).toBeInTheDocument();
      expect(screen.getByText("Quản lý món ăn")).toBeInTheDocument();
    });

    expect(apiClient.get).toHaveBeenCalledWith(
      API.CATEGORY.GET_ALL_BY_TENANT_ID("tenant-1"),
    );
    expect(apiClient.get).toHaveBeenCalledWith(
      API.DISHES.GET_ALL_BY_TENANT_ID("tenant-1"),
    );
  });

  it("shows prerequisite empty state when tenant has no categories", async () => {
    vi.spyOn(apiClient, "get").mockImplementation((url: string) => {
      if (url === API.CATEGORY.GET_ALL_BY_TENANT_ID("tenant-1")) {
        return Promise.resolve({
          data: {
            isSuccess: true,
            data: [],
          },
        } as never);
      }

      if (url === API.DISHES.GET_ALL_BY_TENANT_ID("tenant-1")) {
        return Promise.resolve({
          data: {
            isSuccess: true,
            data: [],
          },
        } as never);
      }

      return Promise.reject(new Error(`Unexpected GET ${url}`));
    });

    render(<DishPage />);

    await waitFor(() => {
      expect(
        screen.getByText("Bạn cần tạo danh mục trước"),
      ).toBeInTheDocument();
      expect(
        screen.getByText("Vui lòng tạo danh mục món ăn trước khi thêm món ăn"),
      ).toBeInTheDocument();
    });

    expect(
      screen.queryByRole("button", { name: "Tạo món ăn" }),
    ).not.toBeInTheDocument();
  });

  it("filters dishes by search keyword and shows no-result state", async () => {
    vi.spyOn(apiClient, "get").mockImplementation((url: string) => {
      if (url === API.CATEGORY.GET_ALL_BY_TENANT_ID("tenant-1")) {
        return Promise.resolve({
          data: {
            isSuccess: true,
            data: [mockCategory],
          },
        } as never);
      }

      if (url === API.DISHES.GET_ALL_BY_TENANT_ID("tenant-1")) {
        return Promise.resolve({
          data: {
            isSuccess: true,
            data: [
              createDish({ id: 101, dishName: "Pho Bo" }),
              createDish({ id: 102, dishName: "Com Tam", price: 55000 }),
            ],
          },
        } as never);
      }

      return Promise.reject(new Error(`Unexpected GET ${url}`));
    });

    const user = userEvent.setup();
    render(<DishPage />);

    await waitFor(() => {
      expect(screen.getByText("Pho Bo")).toBeInTheDocument();
      expect(screen.getByText("Com Tam")).toBeInTheDocument();
    });

    await user.type(
      screen.getByPlaceholderText("Tìm kiếm..."),
      "khong-ton-tai",
    );

    await waitFor(() => {
      expect(screen.getByText("Không tìm thấy món ăn")).toBeInTheDocument();
      expect(screen.queryByText("Pho Bo")).not.toBeInTheDocument();
      expect(screen.queryByText("Com Tam")).not.toBeInTheDocument();
    });

    await user.clear(screen.getByPlaceholderText("Tìm kiếm..."));

    await waitFor(() => {
      expect(screen.getByText("Pho Bo")).toBeInTheDocument();
      expect(screen.getByText("Com Tam")).toBeInTheDocument();
    });
  });

  it("creates a new dish from empty state", async () => {
    vi.spyOn(apiClient, "get").mockImplementation((url: string) => {
      if (url === API.CATEGORY.GET_ALL_BY_TENANT_ID("tenant-1")) {
        return Promise.resolve({
          data: {
            isSuccess: true,
            data: [mockCategory],
          },
        } as never);
      }

      if (url === API.DISHES.GET_ALL_BY_TENANT_ID("tenant-1")) {
        return Promise.resolve({
          data: {
            isSuccess: true,
            data: [],
          },
        } as never);
      }

      return Promise.reject(new Error(`Unexpected GET ${url}`));
    });

    vi.spyOn(apiClient, "post").mockResolvedValue({
      data: {
        isSuccess: true,
        data: createDish({ id: 102, dishName: "Bun Cha", price: 60000 }),
      },
    } as never);

    const user = userEvent.setup();
    render(<DishPage />);

    await waitFor(() => {
      expect(
        screen.getByText("Tạo món ăn đầu tiên của bạn"),
      ).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "Tạo món ăn" }));

    await waitFor(() => {
      expect(screen.getByText("Tạo món ăn mới")).toBeInTheDocument();
    });

    await user.type(
      screen.getByPlaceholderText("Nhập tên món ăn..."),
      "Bun Cha",
    );
    await user.type(screen.getByPlaceholderText("Nhập giá tiền..."), "60000");
    await user.type(
      screen.getByPlaceholderText("Nhập mô tả món ăn..."),
      "Grilled pork with noodles",
    );

    await user.click(screen.getByRole("button", { name: "Tạo mới" }));

    await waitFor(() => {
      expect(screen.getByText("Bun Cha")).toBeInTheDocument();
    });

    expect(apiClient.post).toHaveBeenCalledWith(
      API.DISHES.CREATE(10),
      expect.any(FormData),
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    const [, submittedFormData] = vi.mocked(apiClient.post).mock.calls[0] as [
      string,
      FormData,
      unknown,
    ];

    expect(submittedFormData.get("dishName")).toBe("Bun Cha");
    expect(submittedFormData.get("price")).toBe("60000");
    expect(submittedFormData.get("description")).toBe(
      "Grilled pork with noodles",
    );
  });

  it("deletes a dish after confirmation", async () => {
    vi.spyOn(apiClient, "get").mockImplementation((url: string) => {
      if (url === API.CATEGORY.GET_ALL_BY_TENANT_ID("tenant-1")) {
        return Promise.resolve({
          data: {
            isSuccess: true,
            data: [mockCategory],
          },
        } as never);
      }

      if (url === API.DISHES.GET_ALL_BY_TENANT_ID("tenant-1")) {
        return Promise.resolve({
          data: {
            isSuccess: true,
            data: [createDish()],
          },
        } as never);
      }

      return Promise.reject(new Error(`Unexpected GET ${url}`));
    });

    vi.spyOn(apiClient, "delete").mockResolvedValue({
      data: {
        isSuccess: true,
        message: "Delete success",
      },
    } as never);

    const user = userEvent.setup();
    render(<DishPage />);

    await waitFor(() => {
      expect(screen.getByText("Pho Bo")).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByTitle("Xóa món ăn");
    await user.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByText("Xác nhận xóa món ăn")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "Xóa" }));

    await waitFor(() => {
      expect(screen.queryByText("Pho Bo")).not.toBeInTheDocument();
    });

    expect(apiClient.delete).toHaveBeenCalledWith(
      API.DISHES.DELETE_DISH(10, 101),
    );
  });

  it("updates an existing dish from dish list", async () => {
    vi.spyOn(apiClient, "get").mockImplementation((url: string) => {
      if (url === API.CATEGORY.GET_ALL_BY_TENANT_ID("tenant-1")) {
        return Promise.resolve({
          data: {
            isSuccess: true,
            data: [mockCategory],
          },
        } as never);
      }

      if (url === API.DISHES.GET_ALL_BY_TENANT_ID("tenant-1")) {
        return Promise.resolve({
          data: {
            isSuccess: true,
            data: [createDish()],
          },
        } as never);
      }

      return Promise.reject(new Error(`Unexpected GET ${url}`));
    });

    vi.spyOn(apiClient, "put").mockResolvedValue({
      data: {
        isSuccess: true,
        data: createDish({
          dishName: "Pho Bo Special",
          price: 70000,
          description: "Updated noodle soup",
        }),
      },
    } as never);

    const user = userEvent.setup();
    render(<DishPage />);

    await waitFor(() => {
      expect(screen.getByText("Pho Bo")).toBeInTheDocument();
    });

    const editButtons = screen.getAllByTitle("Chỉnh sửa món ăn");
    await user.click(editButtons[0]);

    await waitFor(() => {
      expect(screen.getByText("Cập nhật món ăn")).toBeInTheDocument();
    });

    const nameInput = screen.getByPlaceholderText("Nhập tên món ăn...");
    const priceInput = screen.getByPlaceholderText("Nhập giá tiền...");
    const descriptionInput = screen.getByPlaceholderText(
      "Nhập mô tả món ăn...",
    );

    await user.clear(nameInput);
    await user.type(nameInput, "Pho Bo Special");
    await user.clear(priceInput);
    await user.type(priceInput, "70000");
    await user.clear(descriptionInput);
    await user.type(descriptionInput, "Updated noodle soup");

    await user.click(screen.getByRole("button", { name: "Cập nhật" }));

    await waitFor(() => {
      expect(screen.getByText("Pho Bo Special")).toBeInTheDocument();
    });

    expect(apiClient.put).toHaveBeenCalledWith(
      API.DISHES.UPDATE_DISH(10, 101),
      expect.any(FormData),
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    const [, submittedFormData] = vi.mocked(apiClient.put).mock.calls[0] as [
      string,
      FormData,
      unknown,
    ];

    expect(submittedFormData.get("dishName")).toBe("Pho Bo Special");
    expect(submittedFormData.get("price")).toBe("70000");
    expect(submittedFormData.get("description")).toBe("Updated noodle soup");
  });

  it("imports dishes from Excel file and refreshes dish list", async () => {
    let dishListCallCount = 0;

    vi.spyOn(apiClient, "get").mockImplementation((url: string) => {
      if (url === API.CATEGORY.GET_ALL_BY_TENANT_ID("tenant-1")) {
        return Promise.resolve({
          data: {
            isSuccess: true,
            data: [mockCategory],
          },
        } as never);
      }

      if (url === API.DISHES.GET_ALL_BY_TENANT_ID("tenant-1")) {
        dishListCallCount += 1;
        return Promise.resolve({
          data: {
            isSuccess: true,
            data:
              dishListCallCount === 1
                ? [createDish()]
                : [
                    createDish(),
                    createDish({ id: 202, dishName: "Com Tam", price: 55000 }),
                  ],
          },
        } as never);
      }

      return Promise.reject(new Error(`Unexpected GET ${url}`));
    });

    vi.spyOn(apiClient, "post").mockResolvedValue({
      data: {
        isSuccess: true,
        message: "Import success",
      },
    } as never);

    const user = userEvent.setup();
    render(<DishPage />);

    await waitFor(() => {
      expect(screen.getByText("Pho Bo")).toBeInTheDocument();
    });

    await user.click(
      screen.getByRole("button", { name: "Nhập món ăn bằng file Excel" }),
    );

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Nhập món ăn bằng file Excel" }),
      ).toBeInTheDocument();
    });

    const popup = screen.getByRole("dialog", { name: "Nhập món ăn bằng file" });
    const fileInput = popup.querySelector(
      "input[type='file']",
    ) as HTMLInputElement | null;
    expect(fileInput).not.toBeNull();

    const excelFile = new File(["fake excel content"], "dishes.xlsx", {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    await user.upload(fileInput as HTMLInputElement, excelFile);
    await user.click(screen.getByRole("button", { name: "Nhập món ăn" }));

    await waitFor(() => {
      expect(screen.getByText("Com Tam")).toBeInTheDocument();
    });

    expect(apiClient.post).toHaveBeenCalledWith(
      API.DISHES.IMPORT_DISHES,
      expect.any(FormData),
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    expect(apiClient.get).toHaveBeenCalledWith(
      API.DISHES.GET_ALL_BY_TENANT_ID("tenant-1"),
    );
    expect(dishListCallCount).toBe(2);
  });
});
