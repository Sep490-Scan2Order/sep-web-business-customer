import { describe, expect, it } from "vitest";
import HeroSection from "@/src/components/ui/HeroSection";
import { render, screen } from "@/tests/setup/test-utils";

describe("HeroSection", () => {
  it("renders hero headline and CTA link", () => {
    render(<HeroSection />);

    expect(screen.getByText("QUẢN LÝ NHÀ HÀNG THÔNG MINH")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Dùng thử miễn phí" })).toBeInTheDocument();
  });

  it("renders all hero images with accessible alt text", () => {
    render(<HeroSection />);

    expect(screen.getByAltText("Scan QR")).toBeInTheDocument();
    expect(screen.getByAltText("Mobile menu")).toBeInTheDocument();
    expect(screen.getByAltText("Dashboard")).toBeInTheDocument();
  });
});
