import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

import BillingSubscriptionsPage from "@/src/app/admin/billing-subscriptions/page";
import { API } from "@/src/constants/api";
import apiClient from "@/src/services/apiClient";
import { PlanApiItem } from "@/src/types/type";

const createPlan = (overrides: Partial<PlanApiItem> = {}): PlanApiItem => ({
  id: 1,
  name: "Standard",
  monthlyPrice: 100000,
  yearlyPrice: 1000000,
  durationInDays: 30,
  dailyRateMonth: 0,
  dailyRateYear: 0,
  level: 1,
  status: "active",
  features: {
    canUseAIUpsell: false,
    canRecommendationOnTop: false,
    canUsePromotions: true,
    canCustomMenuTemplate: false,
  },
  ...overrides,
});

describe("Integration: Admin Billing Subscriptions Flow", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it("loads plans and supports search filtering", async () => {
    vi.spyOn(apiClient, "get").mockResolvedValue({
      data: {
        isSuccess: true,
        data: [
          createPlan(),
          createPlan({ id: 2, name: "Premium", level: 3, status: "inactive" }),
        ],
      },
    } as never);

    const user = userEvent.setup();
    render(<BillingSubscriptionsPage />);

    await waitFor(() => {
      expect(screen.getByText("Thanh toán & Gói dịch vụ")).toBeInTheDocument();
      expect(screen.getByText("Standard")).toBeInTheDocument();
      expect(screen.getByText("Premium")).toBeInTheDocument();
    });

    await user.type(
      screen.getByPlaceholderText("Tìm theo tên gói, cấp độ hoặc trạng thái"),
      "premium",
    );

    await waitFor(() => {
      expect(screen.getByText("Premium")).toBeInTheDocument();
      expect(screen.queryByText("Standard")).not.toBeInTheDocument();
    });
  });

  it("creates a new plan from modal", async () => {
    const getSpy = vi.spyOn(apiClient, "get").mockResolvedValue({
      data: {
        isSuccess: true,
        data: [],
      },
    } as never);

    const postSpy = vi.spyOn(apiClient, "post").mockResolvedValue({
      data: {
        isSuccess: true,
        message: "Tạo thành công",
      },
    } as never);

    const user = userEvent.setup();
    render(<BillingSubscriptionsPage />);

    await waitFor(() => {
      expect(screen.getByText("Không có gói phù hợp.")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "Thêm gói" }));

    await waitFor(() => {
      expect(screen.getByText("Thêm gói mới")).toBeInTheDocument();
    });

    await user.type(
      screen.getByPlaceholderText("Ví dụ: Premium Plus"),
      "Business Plus",
    );

    const numberInputs = screen.getAllByRole("spinbutton");
    await user.clear(numberInputs[0]);
    await user.type(numberInputs[0], "2");
    await user.clear(numberInputs[1]);
    await user.type(numberInputs[1], "200000");
    await user.clear(numberInputs[2]);
    await user.type(numberInputs[2], "2000000");
    await user.clear(numberInputs[3]);
    await user.type(numberInputs[3], "90");

    await user.click(screen.getByRole("button", { name: "Tạo gói" }));

    await waitFor(() => {
      expect(postSpy).toHaveBeenCalledWith(API.PLAN.CREATE, {
        name: "Business Plus",
        monthlyPrice: 200000,
        yearlyPrice: 2000000,
        durationInDays: 90,
        level: 2,
        features: {
          canUseAIUpsell: false,
          canRecommendationOnTop: false,
          canUsePromotions: false,
          canCustomMenuTemplate: false,
        },
      });
    });

    expect(getSpy).toHaveBeenCalledWith(API.PLAN.GETALL);
    expect(getSpy.mock.calls.length).toBeGreaterThanOrEqual(2);
  });

  it("opens edit modal and updates an existing plan", async () => {
    vi.spyOn(apiClient, "get").mockImplementation((url: string) => {
      if (url === API.PLAN.GETALL) {
        return Promise.resolve({
          data: {
            isSuccess: true,
            data: [createPlan({ id: 5, name: "Starter" })],
          },
        } as never);
      }

      if (url === API.PLAN.GET_BY_ID(5)) {
        return Promise.resolve({
          data: {
            isSuccess: true,
            data: {
              id: 5,
              name: "Starter",
              monthlyPrice: 150000,
              yearlyPrice: 1500000,
              durationInDays: 30,
              dailyRateMonth: 0,
              dailyRateYear: 0,
              level: 1,
              status: "active",
              features: {
                canUseAIUpsell: false,
                canRecommendationOnTop: false,
                canUsePromotions: true,
                canCustomMenuTemplate: false,
              },
            },
          },
        } as never);
      }

      return Promise.reject(new Error(`Unexpected GET ${url}`));
    });

    const putSpy = vi.spyOn(apiClient, "put").mockResolvedValue({
      data: {
        isSuccess: true,
        message: "Cập nhật thành công",
      },
    } as never);

    const user = userEvent.setup();
    render(<BillingSubscriptionsPage />);

    await waitFor(() => {
      expect(screen.getByText("Starter")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "Cập nhật" }));

    await waitFor(() => {
      expect(screen.getByText("Cập nhật gói #5")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Starter")).toBeInTheDocument();
    });

    const nameInput = screen.getByPlaceholderText("Ví dụ: Premium Plus");
    await user.clear(nameInput);
    await user.type(nameInput, "Starter Updated");

    await user.click(screen.getByRole("button", { name: "Lưu thay đổi" }));

    await waitFor(() => {
      expect(putSpy).toHaveBeenCalledWith(API.PLAN.UPDATE(5), {
        name: "Starter Updated",
        monthlyPrice: 150000,
        yearlyPrice: 1500000,
        durationInDays: 30,
        level: 1,
        features: {
          canUseAIUpsell: false,
          canRecommendationOnTop: false,
          canUsePromotions: true,
          canCustomMenuTemplate: false,
        },
      });
    });
  });

  it("shows empty state when load plans API fails", async () => {
    vi.spyOn(apiClient, "get").mockRejectedValue(new Error("network error"));

    render(<BillingSubscriptionsPage />);

    await waitFor(() => {
      expect(screen.getByText("Không có gói phù hợp.")).toBeInTheDocument();
    });
  });

  it("does not submit create when validation fails", async () => {
    vi.spyOn(apiClient, "get").mockResolvedValue({
      data: {
        isSuccess: true,
        data: [],
      },
    } as never);

    const postSpy = vi.spyOn(apiClient, "post");
    const user = userEvent.setup();
    render(<BillingSubscriptionsPage />);

    await waitFor(() => {
      expect(screen.getByText("Không có gói phù hợp.")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "Thêm gói" }));

    await waitFor(() => {
      expect(screen.getByText("Thêm gói mới")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "Tạo gói" }));

    expect(postSpy).not.toHaveBeenCalled();
  });

  it("retries loading plans when clicking refresh", async () => {
    let callCount = 0;

    vi.spyOn(apiClient, "get").mockImplementation((url: string) => {
      if (url !== API.PLAN.GETALL) {
        return Promise.reject(new Error(`Unexpected GET ${url}`));
      }

      callCount += 1;
      if (callCount === 1) {
        return Promise.reject(new Error("temporary error"));
      }

      return Promise.resolve({
        data: {
          isSuccess: true,
          data: [createPlan({ id: 10, name: "Retry Plan" })],
        },
      } as never);
    });

    const user = userEvent.setup();
    render(<BillingSubscriptionsPage />);

    await waitFor(() => {
      expect(screen.getByText("Không có gói phù hợp.")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "Làm mới" }));

    await waitFor(() => {
      expect(screen.getByText("Retry Plan")).toBeInTheDocument();
    });

    expect(callCount).toBe(2);
  });
});
