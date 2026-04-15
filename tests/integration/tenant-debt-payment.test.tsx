import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import DebtPaymentPage from "@/src/app/tenant/debt-payment/page";

vi.mock("@/src/hooks/useAuth", () => ({
  useAuth: () => ({
    user: {
      id: "tenant-1",
      name: "Test Tenant",
      email: "tenant@example.com",
      role: "tenant",
      totalDebtAmount: 125000,
      debtStartedAt: "2026-04-01T00:00:00Z",
      lastWarningSentAt: "2026-04-10T00:00:00Z",
      isSuspended: false,
    },
    refreshUserInfo: vi.fn().mockResolvedValue(undefined),
  }),
}));
vi.mock("@/src/components/ui/tenant/DebtReminderPopup", () => ({
  __esModule: true,
  default: () => <div data-testid="debt-reminder-popup" />,
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

describe("Integration: Tenant Debt Payment Route", () => {
  it("renders debt payment page", async () => {
    render(<DebtPaymentPage />);

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Thanh toán nợ hoa hồng" }),
      ).toBeInTheDocument();
      const debtValues = screen.getAllByText(/125\.000/);
      expect(debtValues.length).toBeGreaterThan(0);
      expect(screen.getByTestId("debt-reminder-popup")).toBeInTheDocument();
    });
  });
});
