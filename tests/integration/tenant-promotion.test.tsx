import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React, { useEffect, useState } from "react";

import apiClient from "@/src/services/apiClient";
import { API } from "@/src/constants/api";
import { useAuthStore } from "@/src/store/authStore";

type PromotionItem = {
  id: number;
  title: string;
  discountPercent: number;
};

function MockTenantPromotionPage() {
  const { user } = useAuthStore();
  const [promotions, setPromotions] = useState<PromotionItem[]>([]);
  const [title, setTitle] = useState("");
  const [discountPercent, setDiscountPercent] = useState("10");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPromotions = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await apiClient.get(API.PROMOTION.GET_BY_TENANT(1, 10));

        if (response.data?.isSuccess && response.data?.data?.items) {
          setPromotions(response.data.data.items);
        } else {
          setError(response.data?.message || "Failed to load promotions");
        }
      } catch {
        setError("Failed to load promotions");
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      loadPromotions();
    }
  }, [user?.id]);

  const handleCreate = async () => {
    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.post(API.PROMOTION.CREATE, {
        title: title.trim(),
        discountPercent: Number(discountPercent),
      });

      if (response.data?.isSuccess && response.data?.data) {
        setPromotions((prev) => [...prev, response.data.data]);
        setTitle("");
      } else {
        setError(response.data?.message || "Failed to create promotion");
      }
    } catch {
      setError("Failed to create promotion");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.delete(API.PROMOTION.DELETE(id));

      if (response.data?.isSuccess) {
        setPromotions((prev) => prev.filter((item) => item.id !== id));
      } else {
        setError(response.data?.message || "Failed to delete promotion");
      }
    } catch {
      setError("Failed to delete promotion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div data-testid="promotion-page">
      <h1>Tenant Promotion</h1>

      {error && <div data-testid="error-message">{error}</div>}
      {loading && <div data-testid="loading">Loading...</div>}

      <div>
        <input
          data-testid="promotion-title-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Promotion title"
        />
        <input
          data-testid="promotion-discount-input"
          value={discountPercent}
          onChange={(e) => setDiscountPercent(e.target.value)}
          placeholder="Discount percent"
        />
        <button data-testid="create-promotion-btn" onClick={handleCreate} disabled={loading}>
          Create Promotion
        </button>
      </div>

      <ul data-testid="promotion-list">
        {promotions.map((promotion) => (
          <li key={promotion.id} data-testid={`promotion-item-${promotion.id}`}>
            <span>{promotion.title}</span>
            <span>{promotion.discountPercent}%</span>
            <button
              data-testid={`delete-promotion-btn-${promotion.id}`}
              onClick={() => handleDelete(promotion.id)}
              disabled={loading}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

describe("Integration: Tenant Promotion Flow", () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: {
        id: "tenant-1",
        email: "tenant@example.com",
        role: "tenant",
      } as never,
      token: "token-123",
      isAuthenticated: true,
    });

    vi.restoreAllMocks();
  });

  it("loads tenant promotions and renders list", async () => {
    vi.spyOn(apiClient, "get").mockResolvedValue({
      data: {
        isSuccess: true,
        data: {
          items: [
            { id: 1, title: "Weekend Promo", discountPercent: 20 },
            { id: 2, title: "Lunch Combo", discountPercent: 15 },
          ],
        },
      },
    } as never);

    render(<MockTenantPromotionPage />);

    await waitFor(() => {
      expect(screen.getByTestId("promotion-item-1")).toBeInTheDocument();
      expect(screen.getByTestId("promotion-item-2")).toBeInTheDocument();
    });

    expect(apiClient.get).toHaveBeenCalledWith(API.PROMOTION.GET_BY_TENANT(1, 10));
  });

  it("creates a new promotion and appends to list", async () => {
    vi.spyOn(apiClient, "get").mockResolvedValue({
      data: {
        isSuccess: true,
        data: { items: [] },
      },
    } as never);

    vi.spyOn(apiClient, "post").mockResolvedValue({
      data: {
        isSuccess: true,
        data: {
          id: 3,
          title: "Happy Hour",
          discountPercent: 25,
        },
      },
    } as never);

    const user = userEvent.setup();
    render(<MockTenantPromotionPage />);

    await waitFor(() => {
      expect(apiClient.get).toHaveBeenCalledTimes(1);
    });

    await user.type(screen.getByTestId("promotion-title-input"), "Happy Hour");
    await user.clear(screen.getByTestId("promotion-discount-input"));
    await user.type(screen.getByTestId("promotion-discount-input"), "25");
    await user.click(screen.getByTestId("create-promotion-btn"));

    await waitFor(() => {
      expect(screen.getByTestId("promotion-item-3")).toBeInTheDocument();
      expect(screen.getByText("Happy Hour")).toBeInTheDocument();
    });

    expect(apiClient.post).toHaveBeenCalledWith(API.PROMOTION.CREATE, {
      title: "Happy Hour",
      discountPercent: 25,
    });
  });

  it("deletes promotion from list on success", async () => {
    vi.spyOn(apiClient, "get").mockResolvedValue({
      data: {
        isSuccess: true,
        data: {
          items: [{ id: 7, title: "Delete Me", discountPercent: 5 }],
        },
      },
    } as never);

    vi.spyOn(apiClient, "delete").mockResolvedValue({
      data: {
        isSuccess: true,
      },
    } as never);

    const user = userEvent.setup();
    render(<MockTenantPromotionPage />);

    await waitFor(() => {
      expect(screen.getByTestId("promotion-item-7")).toBeInTheDocument();
    });

    await user.click(screen.getByTestId("delete-promotion-btn-7"));

    await waitFor(() => {
      expect(screen.queryByTestId("promotion-item-7")).not.toBeInTheDocument();
    });

    expect(apiClient.delete).toHaveBeenCalledWith(API.PROMOTION.DELETE(7));
  });

  it("shows error when loading promotions fails", async () => {
    vi.spyOn(apiClient, "get").mockRejectedValue(new Error("network error"));

    render(<MockTenantPromotionPage />);

    await waitFor(() => {
      expect(screen.getByTestId("error-message")).toHaveTextContent("Failed to load promotions");
    });
  });

  it("does not call load API when tenant user is missing", async () => {
    useAuthStore.setState({
      user: null,
      token: null,
      isAuthenticated: false,
    });

    const getSpy = vi.spyOn(apiClient, "get");

    render(<MockTenantPromotionPage />);

    await waitFor(() => {
      expect(screen.getByTestId("promotion-page")).toBeInTheDocument();
    });

    expect(getSpy).not.toHaveBeenCalled();
  });

  it("shows validation error when creating promotion with empty title", async () => {
    vi.spyOn(apiClient, "get").mockResolvedValue({
      data: {
        isSuccess: true,
        data: { items: [] },
      },
    } as never);

    const postSpy = vi.spyOn(apiClient, "post");
    const user = userEvent.setup();

    render(<MockTenantPromotionPage />);

    await waitFor(() => {
      expect(apiClient.get).toHaveBeenCalledTimes(1);
    });

    await user.click(screen.getByTestId("create-promotion-btn"));

    expect(screen.getByTestId("error-message")).toHaveTextContent("Title is required");
    expect(postSpy).not.toHaveBeenCalled();
  });

  it("shows server message and does not append item when create fails", async () => {
    vi.spyOn(apiClient, "get").mockResolvedValue({
      data: {
        isSuccess: true,
        data: {
          items: [{ id: 10, title: "Base Promo", discountPercent: 12 }],
        },
      },
    } as never);

    vi.spyOn(apiClient, "post").mockResolvedValue({
      data: {
        isSuccess: false,
        message: "Promotion title already exists",
      },
    } as never);

    const user = userEvent.setup();
    render(<MockTenantPromotionPage />);

    await waitFor(() => {
      expect(screen.getByTestId("promotion-item-10")).toBeInTheDocument();
    });

    await user.type(screen.getByTestId("promotion-title-input"), "Base Promo");
    await user.click(screen.getByTestId("create-promotion-btn"));

    await waitFor(() => {
      expect(screen.getByTestId("error-message")).toHaveTextContent(
        "Promotion title already exists",
      );
    });

    expect(screen.queryByText("Base Promo")).toBeInTheDocument();
    expect(screen.queryByTestId("promotion-item-3")).not.toBeInTheDocument();
  });

  it("keeps item and shows error when delete request fails", async () => {
    vi.spyOn(apiClient, "get").mockResolvedValue({
      data: {
        isSuccess: true,
        data: {
          items: [{ id: 21, title: "Keep Me", discountPercent: 9 }],
        },
      },
    } as never);

    vi.spyOn(apiClient, "delete").mockResolvedValue({
      data: {
        isSuccess: false,
        message: "Cannot delete active promotion",
      },
    } as never);

    const user = userEvent.setup();
    render(<MockTenantPromotionPage />);

    await waitFor(() => {
      expect(screen.getByTestId("promotion-item-21")).toBeInTheDocument();
    });

    await user.click(screen.getByTestId("delete-promotion-btn-21"));

    await waitFor(() => {
      expect(screen.getByTestId("error-message")).toHaveTextContent(
        "Cannot delete active promotion",
      );
    });

    expect(screen.getByTestId("promotion-item-21")).toBeInTheDocument();
  });
});
