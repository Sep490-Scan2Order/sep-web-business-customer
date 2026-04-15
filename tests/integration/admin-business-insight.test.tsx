import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import BusinessInsightPage from "@/src/app/admin/business-insight/page";

vi.mock("@/src/components/ui/admin/tables/TopTenantsTable", () => ({
  default: () => <div data-testid="top-tenants-table" />,
}));

describe("Integration: Admin Business Insight Route", () => {
  it("renders the business insight header", () => {
    render(<BusinessInsightPage />);

    expect(
      screen.getByRole("heading", { name: "Business Insight" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Theo dõi doanh thu theo Tenant và Nhà hàng/i),
    ).toBeInTheDocument();
    expect(screen.getByTestId("top-tenants-table")).toBeInTheDocument();
  });
});
