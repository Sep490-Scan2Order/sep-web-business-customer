import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import OverviewPage from "@/src/app/admin/overview/page";

vi.mock("@/src/components/ui/admin/stat-cards/StatCards", () => ({
  default: () => <div data-testid="stat-cards" />,
}));
vi.mock("@/src/components/ui/admin/charts/RevenueChart", () => ({
  default: () => <div data-testid="revenue-chart" />,
}));
vi.mock("@/src/components/ui/admin/charts/PlanDistributionChart", () => ({
  default: () => <div data-testid="plan-chart" />,
}));
vi.mock("@/src/components/ui/admin/tables/TopRestaurantsTable", () => ({
  default: () => <div data-testid="top-restaurants" />,
}));
vi.mock("@/src/components/ui/admin/tables/ExpiringSubscriptionsTable", () => ({
  default: () => <div data-testid="expiring-subscriptions" />,
}));

describe("Integration: Admin Overview Route", () => {
  it("renders overview widgets", () => {
    render(<OverviewPage />);

    expect(screen.getByTestId("stat-cards")).toBeInTheDocument();
    expect(screen.getByTestId("revenue-chart")).toBeInTheDocument();
    expect(screen.getByTestId("plan-chart")).toBeInTheDocument();
    expect(screen.getByTestId("top-restaurants")).toBeInTheDocument();
    expect(screen.getByTestId("expiring-subscriptions")).toBeInTheDocument();
  });
});
