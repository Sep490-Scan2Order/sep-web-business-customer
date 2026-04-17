import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import AboutUsPage from "@/src/app/pages/public/about-us/page";

describe("Integration: Public About Us Route", () => {
  it("renders hero and CTA links", () => {
    render(<AboutUsPage />);

    expect(
      screen.getByRole("heading", { name: /Định nghĩa lại cách vận hành/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Khám phá giải pháp/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Bảng giá dịch vụ/i }),
    ).toBeInTheDocument();
  });
});
