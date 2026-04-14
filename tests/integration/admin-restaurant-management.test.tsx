import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";

import RestaurantManagementPage from "@/src/app/admin/restaurant-management/page";

describe("Integration: Admin Restaurant Management Flow", () => {
  it("renders static restaurant management content", () => {
    render(<RestaurantManagementPage />);

    expect(screen.getByText("Quản lý nhà hàng")).toBeInTheDocument();
    expect(
      screen.getByText("Quản lý toàn bộ nhà hàng của các tenant"),
    ).toBeInTheDocument();
  });
});
