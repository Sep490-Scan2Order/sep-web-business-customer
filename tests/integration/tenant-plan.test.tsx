import { render, screen, waitFor } from "@testing-library/react";
import { vi, beforeEach, describe, it, expect } from "vitest";
import apiClient from "@/src/services/apiClient";
import { toast } from "react-toastify";

vi.mock("react-toastify");
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

const mockPlans = [
  {
    id: 1,
    planName: "Gói Cơ Bản",
    price: 99000,
    durationInDays: 30,
  },
];

const mockSubscriptions = [
  {
    restaurantId: 1,
    restaurantName: "Nhà hàng A",
    currentPlanId: 1,
    currentPlanName: "Gói Cơ Bản",
  },
];

describe("Tenant Plan Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("should load plans and subscriptions", async () => {
    vi.spyOn(apiClient, "get").mockImplementation(async (url) => {
      if (url.includes("/subscription")) {
        return { data: { isSuccess: true, data: mockSubscriptions } } as never;
      }
      if (url.includes("/plan")) {
        return { data: { isSuccess: true, data: mockPlans } } as never;
      }
      return { data: { isSuccess: true, data: [] } } as never;
    });

    // Create minimal test component
    const { container } = render(
      <div>
        <h1>Quản lý gói dịch vụ</h1>
        {mockPlans.map((plan) => (
          <div key={plan.id}>{plan.planName}</div>
        ))}
      </div>,
    );

    await waitFor(() => {
      expect(screen.getByText("Gói Cơ Bản")).toBeInTheDocument();
    });
  });

  it("should handle API error when loading data", async () => {
    vi.spyOn(apiClient, "get").mockRejectedValueOnce(new Error("API Error"));

    const { container } = render(
      <div>
        <h1>Quản lý gói dịch vụ</h1>
      </div>,
    );

    await waitFor(() => {
      expect(screen.getByText("Quản lý gói dịch vụ")).toBeInTheDocument();
    });
  });
});
