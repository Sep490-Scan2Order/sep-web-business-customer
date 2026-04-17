import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import apiClient from "@/src/services/apiClient";
import PublicPlanPage from "@/src/app/pages/public/plan/page";

vi.mock("@/src/services/apiClient", () => ({
  default: {
    get: vi.fn(),
  },
}));

describe("Integration: Public Plan Route", () => {
  it("loads and displays pricing plans", async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      status: 200,
      data: {
        isSuccess: true,
        data: [
          {
            id: 1,
            name: "Basic",
            monthlyPrice: 99000,
            features: {
              canRecommendationOnTop: true,
              canUseAIUpsell: false,
              canCustomMenuTemplate: false,
              canUsePromotions: true,
            },
          },
        ],
      },
    } as never);

    render(<PublicPlanPage />);

    await waitFor(() => {
      expect(screen.getByText("Basic")).toBeInTheDocument();
      expect(screen.getByText("99.000đ")).toBeInTheDocument();
    });
  });
});
