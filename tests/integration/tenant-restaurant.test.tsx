import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

import RestaurantPage from "@/src/app/tenant/restaurant/page";
import { API } from "@/src/constants/api";
import apiClient from "@/src/services/apiClient";

const mockRouterPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockRouterPush,
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

vi.mock("@/src/components/ui/tenant/RestaurantLocationMap", () => ({
  default: () => <div data-testid="restaurant-location-map-mock" />,
}));

const createRestaurant = (overrides: Partial<Record<string, unknown>> = {}) =>
  ({
    id: 101,
    tenantId: "tenant-1",
    restaurantName: "Nhà hàng A",
    address: "123 Đường A",
    longitude: 106.7009,
    latitude: 10.7769,
    image: "",
    phone: "0900000001",
    description: "Mô tả A",
    openTime: "08:00",
    closeTime: "22:00",
    profileUrl: "",
    slug: "nha-hang-a",
    qrMenu: "",
    isActive: true,
    isOpened: true,
    isReceivingOrders: true,
    totalOrder: 0,
    createdAt: "2026-04-06T00:00:00Z",
    distanceKm: null,
    minCashAmount: 0,
    ...overrides,
  }) as never;

describe("Integration: Tenant Restaurant Management Flow", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mockRouterPush.mockReset();
    localStorage.clear();

    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: false,
        json: async () => [],
      })),
    );
  });

  it("shows empty state and opens create restaurant modal", async () => {
    vi.spyOn(apiClient, "get").mockResolvedValue({
      data: {
        isSuccess: true,
        data: [],
      },
    } as never);

    const user = userEvent.setup();
    render(<RestaurantPage />);

    await waitFor(() => {
      expect(screen.getByText("Tạo nhà hàng của bạn")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "Tạo nhà hàng" }));

    await waitFor(() => {
      expect(screen.getByText("Tạo nhà hàng mới")).toBeInTheDocument();
      expect(screen.getByLabelText("Tên nhà hàng *")).toBeInTheDocument();
      expect(screen.getByLabelText("Số điện thoại *")).toBeInTheDocument();
      expect(screen.getByLabelText("Giờ mở cửa")).toBeInTheDocument();
      expect(screen.getByLabelText("Giờ đóng cửa")).toBeInTheDocument();
      expect(screen.getByLabelText("Địa chỉ")).toBeInTheDocument();
    });
  });

  it("creates a restaurant from empty state and adds it to the list", async () => {
    vi.spyOn(apiClient, "get").mockResolvedValue({
      data: {
        isSuccess: true,
        data: [],
      },
    } as never);

    vi.spyOn(apiClient, "post").mockResolvedValue({
      data: {
        isSuccess: true,
        message: "Tạo nhà hàng thành công!",
        data: createRestaurant({
          id: 202,
          restaurantName: "Nhà hàng Mới",
          address: "456 Đường B",
          slug: "nha-hang-moi",
          openTime: "08:30",
          closeTime: "21:30",
        }),
      },
    } as never);

    const user = userEvent.setup();
    render(<RestaurantPage />);

    await waitFor(() => {
      expect(screen.getByText("Tạo nhà hàng của bạn")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "Tạo nhà hàng" }));

    await waitFor(() => {
      expect(screen.getByText("Tạo nhà hàng mới")).toBeInTheDocument();
    });

    await user.type(screen.getByLabelText("Tên nhà hàng *"), "Nhà hàng Mới");
    await user.type(screen.getByLabelText("Số điện thoại *"), "0988777666");
    await user.type(screen.getByLabelText("Giờ mở cửa"), "08:30");
    await user.type(screen.getByLabelText("Giờ đóng cửa"), "21:30");
    await user.type(screen.getByLabelText("Địa chỉ"), "456 Đường B");
    await user.type(screen.getByLabelText("Mô tả"), "Nhà hàng thử nghiệm");

    await user.click(screen.getByRole("button", { name: "Tạo mới" }));

    await waitFor(() => {
      expect(screen.getByText("Nhà hàng Mới")).toBeInTheDocument();
      expect(
        screen.getByText((content, element) => {
          return (
            element?.tagName === "P" &&
            content.includes("Giờ mở cửa:") &&
            content.includes("08:30") &&
            content.includes("21:30")
          );
        }),
      ).toBeInTheDocument();
    });

    expect(apiClient.post).toHaveBeenCalledWith(
      API.RESTAURANT.CREATE,
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
    expect(submittedFormData.get("RestaurantName")).toBe("Nhà hàng Mới");
    expect(submittedFormData.get("Phone")).toBe("0988777666");
    expect(submittedFormData.get("OpenTime")).toBe("08:30");
    expect(submittedFormData.get("CloseTime")).toBe("21:30");
    expect(submittedFormData.get("Address")).toBe("456 Đường B");
    expect(submittedFormData.get("Description")).toBe("Nhà hàng thử nghiệm");
  });

  it("searches and updates an existing restaurant", async () => {
    vi.spyOn(apiClient, "get").mockResolvedValue({
      data: {
        isSuccess: true,
        data: [createRestaurant()],
      },
    } as never);

    vi.spyOn(apiClient, "put").mockResolvedValue({
      data: {
        isSuccess: true,
        message: "Cập nhật nhà hàng thành công!",
        data: createRestaurant({
          restaurantName: "Nhà hàng A - Updated",
          address: "789 Đường C",
        }),
      },
    } as never);

    const user = userEvent.setup();
    render(<RestaurantPage />);

    await waitFor(() => {
      expect(screen.getByText("Nhà hàng A")).toBeInTheDocument();
      expect(
        screen.getByText((content, element) => {
          return (
            element?.tagName === "P" &&
            content.includes("Giờ mở cửa:") &&
            content.includes("08:00") &&
            content.includes("22:00")
          );
        }),
      ).toBeInTheDocument();
    });

    await user.type(screen.getByPlaceholderText("Tìm kiếm nhà hàng..."), "A");
    expect(screen.getByText("Nhà hàng A")).toBeInTheDocument();

    await user.click(screen.getByLabelText("Sửa thông tin Nhà hàng A"));

    await waitFor(() => {
      expect(screen.getByText("Cập nhật nhà hàng")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Nhà hàng A")).toBeInTheDocument();
      expect(screen.getByDisplayValue("08:00")).toBeInTheDocument();
      expect(screen.getByDisplayValue("22:00")).toBeInTheDocument();
    });

    const nameInput = screen.getByLabelText("Tên nhà hàng *");
    const addressInput = screen.getByLabelText("Địa chỉ");
    const openTimeInput = screen.getByLabelText("Giờ mở cửa");
    const closeTimeInput = screen.getByLabelText("Giờ đóng cửa");

    await user.clear(nameInput);
    await user.type(nameInput, "Nhà hàng A - Updated");
    await user.clear(addressInput);
    await user.type(addressInput, "789 Đường C");
    await user.clear(openTimeInput);
    await user.type(openTimeInput, "09:00");
    await user.clear(closeTimeInput);
    await user.type(closeTimeInput, "23:00");

    await user.click(screen.getByRole("button", { name: "Cập nhật" }));

    await waitFor(() => {
      expect(screen.getByText("Nhà hàng A - Updated")).toBeInTheDocument();
    });

    expect(apiClient.put).toHaveBeenCalledWith(
      API.RESTAURANT.UPDATE("101"),
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
    expect(submittedFormData.get("RestaurantName")).toBe(
      "Nhà hàng A - Updated",
    );
    expect(submittedFormData.get("Address")).toBe("789 Đường C");
    expect(submittedFormData.get("OpenTime")).toBe("09:00");
    expect(submittedFormData.get("CloseTime")).toBe("23:00");
  });

  it("opens create restaurant modal from list view", async () => {
    vi.spyOn(apiClient, "get").mockResolvedValue({
      data: {
        isSuccess: true,
        data: [createRestaurant()],
      },
    } as never);

    const user = userEvent.setup();
    render(<RestaurantPage />);

    await waitFor(() => {
      expect(screen.getByText("Nhà hàng A")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "Thêm nhà hàng" }));

    await waitFor(() => {
      expect(screen.getByText("Tạo nhà hàng mới")).toBeInTheDocument();
      expect(screen.getByLabelText("Tên nhà hàng *")).toBeInTheDocument();
    });
  });

  it("filters restaurants by search keyword and renders no-result state", async () => {
    vi.spyOn(apiClient, "get").mockResolvedValue({
      data: {
        isSuccess: true,
        data: [
          createRestaurant(),
          createRestaurant({
            id: 102,
            restaurantName: "Nhà hàng B",
            slug: "nha-hang-b",
          }),
        ],
      },
    } as never);

    const user = userEvent.setup();
    render(<RestaurantPage />);

    await waitFor(() => {
      expect(screen.getByText("Nhà hàng A")).toBeInTheDocument();
      expect(screen.getByText("Nhà hàng B")).toBeInTheDocument();
    });

    await user.type(
      screen.getByPlaceholderText("Tìm kiếm nhà hàng..."),
      "khong-ton-tai",
    );

    await waitFor(() => {
      expect(screen.getByText("Không tìm thấy nhà hàng")).toBeInTheDocument();
      expect(screen.queryByText("Nhà hàng A")).not.toBeInTheDocument();
      expect(screen.queryByText("Nhà hàng B")).not.toBeInTheDocument();
    });

    await user.clear(screen.getByPlaceholderText("Tìm kiếm nhà hàng..."));

    await waitFor(() => {
      expect(screen.getByText("Nhà hàng A")).toBeInTheDocument();
      expect(screen.getByText("Nhà hàng B")).toBeInTheDocument();
    });
  });

  it("navigates to restaurant detail when clicking restaurant card", async () => {
    vi.spyOn(apiClient, "get").mockResolvedValue({
      data: {
        isSuccess: true,
        data: [createRestaurant({ slug: "nha-hang-a" })],
      },
    } as never);

    const user = userEvent.setup();
    render(<RestaurantPage />);

    await waitFor(() => {
      expect(screen.getByText("Nhà hàng A")).toBeInTheDocument();
    });

    await user.click(screen.getByText("Nhà hàng A"));

    expect(mockRouterPush).toHaveBeenCalledWith(
      "/tenant/restaurant/nha-hang-a",
    );
  });
});
