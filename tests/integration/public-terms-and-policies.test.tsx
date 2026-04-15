import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import TermsAndPoliciesPage from "@/src/app/pages/public/terms-and-policies/page";

describe("Integration: Public Terms And Policies Route", () => {
  it("renders policy page and contact form", () => {
    render(<TermsAndPoliciesPage />);

    expect(
      screen.getByRole("heading", { name: /Cam kết minh bạch/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Xem PDF trực tuyến/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Tải PDF/i })).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/emailcuatoi@gmail.com/i),
    ).toBeInTheDocument();
  });
});
