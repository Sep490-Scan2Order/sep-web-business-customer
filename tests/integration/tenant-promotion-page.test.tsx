import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

import PromotionPage from "@/src/app/tenant/promotion/page";
import { API } from "@/src/constants/api";
import apiClient from "@/src/services/apiClient";
import { PromotionDto } from "@/src/types/type";

const mockRouterPush = vi.fn();
let mockSearchParams = "pageNumber=1&pageSize=10";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockRouterPush,
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/tenant/promotion",
  useSearchParams: () => new URLSearchParams(mockSearchParams),
}));

const createPromotion = (
  overrides: Partial<PromotionDto> = {},
): PromotionDto => ({
  id: 101,
  isActive: true,
  name: "Giảm trưa",
  type: 0,
  discountType: 0,
  discountValue: 15,
  maxDiscountValue: 50000,
  minOrderValue: 0,
  startDate: "2026-04-01T00:00:00.000Z",
  endDate: "2026-04-30T23:59:59.000Z",
  dailyStartTime: null,
  dailyEndTime: null,
  daysOfWeek: 0,
  isGlobal: true,
  priority: 10,
  scope: 0,
  dishIds: null,
  restaurantIds: null,
  ...overrides,
});

describe("Integration: Tenant Promotion Page Flow", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mockRouterPush.mockReset();
    mockSearchParams = "pageNumber=1&pageSize=10";
    localStorage.clear();
  });

  it("loads promotions and renders list data", async () => {
    vi.spyOn(apiClient, "get").mockImplementation((url: string) => {
      if (url === API.PROMOTION.GET_BY_TENANT(1, 10)) {
        return Promise.resolve({
          data: {
            isSuccess: true,
            data: {
              items: [createPromotion()],
              totalCount: 1,
              pageNumber: 1,
              pageSize: 10,
              totalPages: 1,
              hasPreviousPage: false,
              hasNextPage: false,
            },
          },
        } as never);
      }

      return Promise.reject(new Error(`Unexpected GET ${url}`));
    });

    render(<PromotionPage />);

    await waitFor(() => {
      expect(screen.getByText("Khuyến mãi")).toBeInTheDocument();
      expect(screen.getByText("Giảm trưa")).toBeInTheDocument();
      expect(screen.getByText("Đang hoạt động")).toBeInTheDocument();
    });

    expect(apiClient.get).toHaveBeenCalledWith(
      API.PROMOTION.GET_BY_TENANT(1, 10),
    );
  });

  it("opens create promotion modal and loads reference data", async () => {
    vi.spyOn(apiClient, "get").mockImplementation((url: string) => {
      if (url === API.PROMOTION.GET_BY_TENANT(1, 10)) {
        return Promise.resolve({
          data: {
            isSuccess: true,
            data: {
              items: [],
              totalCount: 0,
              pageNumber: 1,
              pageSize: 10,
              totalPages: 1,
              hasPreviousPage: false,
              hasNextPage: false,
            },
          },
        } as never);
      }

      if (url === API.DISHES.GET_ALL) {
        return Promise.resolve({
          data: {
            isSuccess: true,
            data: [
              {
                id: 1,
                dishName: "Pho Bo",
                categoryName: "Main",
                price: 50000,
                type: 0,
                isAvailable: true,
              },
            ],
          },
        } as never);
      }

      if (url === API.RESTAURANT.GET_ALL_RESTAURANT_BY_TENANT_ID) {
        return Promise.resolve({
          data: {
            isSuccess: true,
            data: [{ id: 10, restaurantName: "Nhà hàng A" }],
          },
        } as never);
      }

      return Promise.reject(new Error(`Unexpected GET ${url}`));
    });

    const user = userEvent.setup();
    render(<PromotionPage />);

    await waitFor(() => {
      expect(screen.getByText("Chưa có khuyến mãi nào")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "Thêm khuyến mãi" }));

    await waitFor(() => {
      expect(screen.getByText("Tạo khuyến mãi mới")).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText("Nhập tên khuyến mãi"),
      ).toBeInTheDocument();
    });

    expect(apiClient.get).toHaveBeenCalledWith(API.DISHES.GET_ALL);
    expect(apiClient.get).toHaveBeenCalledWith(
      API.RESTAURANT.GET_ALL_RESTAURANT_BY_TENANT_ID,
    );
  });

  it("filters promotions by search keyword", async () => {
    vi.spyOn(apiClient, "get").mockResolvedValue({
      data: {
        isSuccess: true,
        data: {
          items: [
            createPromotion(),
            createPromotion({ id: 102, name: "Giảm tối" }),
          ],
          totalCount: 2,
          pageNumber: 1,
          pageSize: 10,
          totalPages: 1,
          hasPreviousPage: false,
          hasNextPage: false,
        },
      },
    } as never);

    const user = userEvent.setup();
    render(<PromotionPage />);

    await waitFor(() => {
      expect(screen.getByText("Giảm trưa")).toBeInTheDocument();
      expect(screen.getByText("Giảm tối")).toBeInTheDocument();
    });

    await user.type(
      screen.getByPlaceholderText("Tìm kiếm..."),
      "khong-ton-tai",
    );

    await waitFor(() => {
      expect(screen.getByText("Không tìm thấy khuyến mãi")).toBeInTheDocument();
      expect(screen.queryByText("Giảm trưa")).not.toBeInTheDocument();
      expect(screen.queryByText("Giảm tối")).not.toBeInTheDocument();
    });
  });

  it("deletes promotion after confirmation", async () => {
    vi.spyOn(apiClient, "get").mockResolvedValue({
      data: {
        isSuccess: true,
        data: {
          items: [createPromotion()],
          totalCount: 1,
          pageNumber: 1,
          pageSize: 10,
          totalPages: 1,
          hasPreviousPage: false,
          hasNextPage: false,
        },
      },
    } as never);

    vi.spyOn(apiClient, "delete").mockResolvedValue({
      data: {
        isSuccess: true,
      },
    } as never);

    const user = userEvent.setup();
    render(<PromotionPage />);

    await waitFor(() => {
      expect(screen.getByText("Giảm trưa")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "Xóa" }));

    await waitFor(() => {
      expect(screen.getByText("Xác nhận xóa khuyến mãi")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "Xác nhận xóa" }));

    await waitFor(() => {
      expect(screen.queryByText("Giảm trưa")).not.toBeInTheDocument();
    });

    expect(apiClient.delete).toHaveBeenCalledWith(API.PROMOTION.DELETE(101));
  });

  it("pushes next page query when clicking pagination next", async () => {
    vi.spyOn(apiClient, "get").mockResolvedValue({
      data: {
        isSuccess: true,
        data: {
          items: [createPromotion()],
          totalCount: 12,
          pageNumber: 1,
          pageSize: 10,
          totalPages: 2,
          hasPreviousPage: false,
          hasNextPage: true,
        },
      },
    } as never);

    const user = userEvent.setup();
    render(<PromotionPage />);

    await waitFor(() => {
      expect(
        screen.getByText("Trang 1/2 • Tổng 12 khuyến mãi"),
      ).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "Sau" }));

    expect(mockRouterPush).toHaveBeenCalledWith(
      "/tenant/promotion?pageNumber=2&pageSize=10",
    );
  });
});
