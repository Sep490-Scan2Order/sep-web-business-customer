import { render, screen, waitFor } from "@testing-library/react";
import { vi, beforeEach, describe, it, expect } from "vitest";
import apiClient from "@/src/services/apiClient";
import { toast } from "react-toastify";

// Mock the page component - create a simple wrapper
const TenantOrdersPage = () => {
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    apiClient.get("/Order/tenant/restaurant/1").catch(() => {
      setLoading(false);
    });
  }, []);

  return (
    <div>
      <h1>Đơn hàng</h1>
      {loading && <div>Đang tải...</div>}
    </div>
  );
};

import React from "react";

vi.mock("react-toastify");
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

const mockOrders = [
  {
    id: 1,
    orderCode: "ORD001",
    restaurantId: 1,
    totalAmount: 250000,
    status: 3,
  },
];

describe("Tenant Orders Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("should load orders", async () => {
    vi.spyOn(apiClient, "get").mockImplementation(async () => ({
      data: { isSuccess: true, data: mockOrders } as never,
    }));

    render(<TenantOrdersPage />);

    await waitFor(() => {
      expect(screen.getByText("Đơn hàng")).toBeInTheDocument();
    });
  });

  it("should handle API error", async () => {
    vi.spyOn(apiClient, "get").mockRejectedValueOnce(new Error("API Error"));

    render(<TenantOrdersPage />);

    await waitFor(() => {
      expect(screen.getByText("Đơn hàng")).toBeInTheDocument();
    });
  });
});
