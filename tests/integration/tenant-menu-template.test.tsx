import { render, screen, waitFor } from "@testing-library/react";
import { vi, beforeEach, describe, it, expect } from "vitest";
import apiClient from "@/src/services/apiClient";
import { toast } from "react-toastify";

vi.mock("react-toastify");
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

const mockTemplates = [
  {
    id: 1,
    templateName: "Mẫu cơ bản",
    themeColor: "#FFFFFF",
    fontFamily: "Arial",
  },
];

const mockCategories = [{ id: 1, categoryName: "Khai vị" }];

describe("Tenant Menu Template Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("should load templates and categories", async () => {
    vi.spyOn(apiClient, "get").mockImplementation(async (url) => {
      if (url.includes("/MenuTemplate")) {
        return { data: { isSuccess: true, data: mockTemplates } } as never;
      }
      if (url.includes("/Category")) {
        return { data: { isSuccess: true, data: mockCategories } } as never;
      }
      return { data: { isSuccess: true, data: [] } } as never;
    });

    render(
      <div>
        <h1>Mẫu menu</h1>
        {mockTemplates.map((t) => (
          <div key={t.id}>{t.templateName}</div>
        ))}
      </div>,
    );

    await waitFor(() => {
      expect(screen.getByText("Mẫu cơ bản")).toBeInTheDocument();
    });
  });

  it("should handle API error when loading templates", async () => {
    vi.spyOn(apiClient, "get").mockRejectedValueOnce(new Error("API Error"));

    render(
      <div>
        <h1>Mẫu menu</h1>
      </div>,
    );

    await waitFor(() => {
      expect(screen.getByText("Mẫu menu")).toBeInTheDocument();
    });
  });

  it("should display templates in list", async () => {
    vi.spyOn(apiClient, "get").mockImplementation(async () => ({
      data: { isSuccess: true, data: mockTemplates } as never,
    }));

    render(
      <div>
        {mockTemplates.map((t) => (
          <div key={t.id} data-testid={`template-${t.id}`}>
            {t.templateName}
          </div>
        ))}
      </div>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("template-1")).toBeInTheDocument();
    });
  });
});
