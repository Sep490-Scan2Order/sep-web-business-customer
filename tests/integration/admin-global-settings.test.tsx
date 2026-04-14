import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

import GlobalSettingsPage from "@/src/app/admin/global-settings/page";
import { configurationService } from "@/src/services/configurationService";
import apiClient from "@/src/services/apiClient";
import { API } from "@/src/constants/api";

describe("Integration: Admin Global Settings Flow", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it("loads configuration and updates commission rate", async () => {
    vi.spyOn(configurationService, "getAll").mockResolvedValue({
      isSuccess: true,
      message: "ok",
      data: {
        id: 1,
        commissionRate: 3,
      },
    } as never);

    const updateSpy = vi
      .spyOn(configurationService, "update")
      .mockResolvedValue({
        isSuccess: true,
        message: "updated",
        data: {
          id: 1,
          commissionRate: 5,
        },
      } as never);

    const user = userEvent.setup();
    render(<GlobalSettingsPage />);

    await waitFor(() => {
      expect(screen.getByText("Cài đặt hệ thống")).toBeInTheDocument();
      expect(screen.getByDisplayValue("3")).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText("Ví dụ: 3");
    await user.clear(input);
    await user.type(input, "5");
    await user.click(screen.getByRole("button", { name: "Lưu thay đổi" }));

    await waitFor(() => {
      expect(updateSpy).toHaveBeenCalledWith(1, { commissionRate: 5 });
    });
  });

  it("prevents save when commission rate is invalid", async () => {
    vi.spyOn(configurationService, "getAll").mockResolvedValue({
      isSuccess: true,
      message: "ok",
      data: {
        id: 1,
        commissionRate: 3,
      },
    } as never);

    const updateSpy = vi.spyOn(configurationService, "update");
    const user = userEvent.setup();
    render(<GlobalSettingsPage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue("3")).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText("Ví dụ: 3");
    await user.clear(input);
    await user.type(input, "0");
    await user.click(screen.getByRole("button", { name: "Lưu thay đổi" }));

    expect(updateSpy).not.toHaveBeenCalled();
  });

  it("loads empty state when configuration fetch fails and handles cronjob test error", async () => {
    vi.spyOn(configurationService, "getAll").mockRejectedValue(
      new Error("network error"),
    );
    vi.spyOn(apiClient, "post").mockRejectedValue(new Error("cronjob error"));

    const user = userEvent.setup();
    render(<GlobalSettingsPage />);

    await waitFor(() => {
      expect(
        screen.getByText(
          "Chưa có cấu hình nào. Hãy tạo một row cấu hình ở backend trước.",
        ),
      ).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "Chạy test cronjob" }));

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith(API.ADMIN.TEST_CRONJOBS);
      expect(
        screen.getByRole("button", { name: "Chạy test cronjob" }),
      ).toBeInTheDocument();
    });
  });
});
