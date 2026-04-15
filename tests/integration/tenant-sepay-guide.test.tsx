import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import SepayGuidePage from "@/src/app/tenant/sepay-guide/page";

describe("Integration: Tenant Sepay Guide Route", () => {
  it("renders guide content and navigation links", () => {
    render(<SepayGuidePage />);

    expect(
      screen.getByRole("heading", {
        name: /Hướng dẫn liên kết ngân hàng với Sepay/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Quay lại/i })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Đi tới trang webhook guide/i }),
    ).toBeInTheDocument();
  });
});
