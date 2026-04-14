import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";

import UserManagementPage from "@/src/app/admin/user-management/page";

describe("Integration: Admin User Management Flow", () => {
  it("renders static user management content", () => {
    render(<UserManagementPage />);

    expect(screen.getByText("Quản lý người dùng")).toBeInTheDocument();
    expect(
      screen.getByText("Quản lý tài khoản người dùng trong hệ thống"),
    ).toBeInTheDocument();
  });
});
