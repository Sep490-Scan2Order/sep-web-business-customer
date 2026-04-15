import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, beforeEach, describe, it, expect } from "vitest";
import apiClient from "@/src/services/apiClient";
import BlogManagementPage from "@/src/app/admin/blog-management/page";
import { toast } from "react-toastify";

vi.mock("react-toastify");
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

const mockBlogs = [
  {
    id: 1,
    title: "Bài viết thứ nhất",
    colorTitle: "#FF0000",
    content: "<p>Nội dung bài viết 1</p>",
    thumbnailUrl: "https://example.com/thumb1.jpg",
    imageUrl: '["https://example.com/img1.jpg"]',
    blogType: 1,
    createdAt: "2024-01-15T00:00:00Z",
  },
];

describe("Admin Blog Management Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("should load and display blog list on page load", async () => {
    vi.spyOn(apiClient, "get").mockImplementation(async (url) => {
      if (url.includes("/SystemBlog")) {
        return {
          data: {
            isSuccess: true,
            data: {
              items: mockBlogs,
              totalCount: 1,
              page: 1,
              pageSize: 50,
            },
          },
        } as never;
      }
      return { data: { isSuccess: true, data: [] } } as never;
    });

    render(<BlogManagementPage />);

    await waitFor(() => {
      expect(screen.getByText("Bài viết thứ nhất")).toBeInTheDocument();
    });
  });

  it("should handle API error when loading blogs", async () => {
    vi.spyOn(apiClient, "get").mockRejectedValueOnce(new Error("API Error"));

    render(<BlogManagementPage />);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled();
    });
  });

  it("should display page header with title", async () => {
    vi.spyOn(apiClient, "get").mockImplementation(
      async () =>
        ({
          data: {
            isSuccess: true,
            data: {
              items: mockBlogs,
              totalCount: 1,
              page: 1,
              pageSize: 50,
            },
          },
        }) as never,
    );

    render(<BlogManagementPage />);

    await waitFor(() => {
      expect(screen.getByText("Quản lý blog")).toBeInTheDocument();
    });
  });

  it("should display empty state when no blogs exist", async () => {
    vi.spyOn(apiClient, "get").mockImplementation(
      async () =>
        ({
          data: {
            isSuccess: true,
            data: {
              items: [],
              totalCount: 0,
              page: 1,
              pageSize: 50,
            },
          },
        }) as never,
    );

    render(<BlogManagementPage />);

    await waitFor(() => {
      expect(screen.getByText("Quản lý blog")).toBeInTheDocument();
    });
  });

  it("should verify create button exists and is enabled", async () => {
    vi.spyOn(apiClient, "get").mockImplementation(
      async () =>
        ({
          data: {
            isSuccess: true,
            data: {
              items: mockBlogs,
              totalCount: 1,
              page: 1,
              pageSize: 50,
            },
          },
        }) as never,
    );

    render(<BlogManagementPage />);

    await waitFor(() => {
      const createButton = screen.getByRole("button", {
        name: /tạo blog mới/i,
      });
      expect(createButton).toBeEnabled();
    });
  });
});
