import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, beforeEach, describe, it, expect } from "vitest";
import apiClient from "@/src/services/apiClient";
import TemplateManagementPage from "@/src/app/admin/template-management/page";
import { toast } from "react-toastify";

vi.mock("react-toastify");
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
}));

const mockTemplates = [
  {
    id: 1,
    templateName: "Mẫu cơ bản",
    themeColor: "#FFFFFF",
    fontFamily: "Arial",
    backgroundImageUrl: null,
    layoutConfigJson: JSON.stringify({ version: 1 }),
    isActive: true,
  },
];

describe("Admin Template Management Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("should load templates on page load", async () => {
    vi.spyOn(apiClient, "get").mockImplementation(async (url) => {
      if (url.includes("/MenuTemplate")) {
        return { data: { isSuccess: true, data: mockTemplates } } as never;
      }
      return { data: { isSuccess: true, data: [] } } as never;
    });

    render(<TemplateManagementPage />);

    await waitFor(() => {
      expect(screen.getByText("Mẫu cơ bản")).toBeInTheDocument();
    });
  });

  it("should handle API error when loading templates", async () => {
    vi.spyOn(apiClient, "get").mockRejectedValueOnce(new Error("API Error"));

    render(<TemplateManagementPage />);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled();
    });
  });
});
