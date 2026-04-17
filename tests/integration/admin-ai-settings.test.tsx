import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import AISettingsPage from "@/src/app/admin/ai-settings/page";

describe("Integration: Admin AI Settings Route", () => {
  it("renders the AI settings header", () => {
    render(<AISettingsPage />);

    expect(
      screen.getByRole("heading", { name: "Cài đặt AI" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Cấu hình tính năng AI và mô hình sử dụng"),
    ).toBeInTheDocument();
  });
});
