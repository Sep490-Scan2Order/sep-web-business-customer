import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import FeaturesPage from "@/src/app/pages/public/features/page";

describe("Integration: Public Features Route", () => {
  it("renders feature sections and CTAs", () => {
    render(<FeaturesPage />);

    expect(
      screen.getByRole("heading", { name: /Tính năng mạnh mẽ cho/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Dùng thử miễn phí/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Tìm hiểu các gói/i }),
    ).toBeInTheDocument();
  });
});
