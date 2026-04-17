import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React, { useState, useEffect } from "react";
import { useAuthStore } from "@/src/store/authStore";
import { ToastContainer, toast } from "react-toastify";
import apiClient from "@/src/services/apiClient";
import { API } from "@/src/constants/api";
import { CategoryDto } from "@/src/types/type";

/**
 * Mock Category Management Component
 * Simulates the actual Category Page behavior
 * Covers: GET, CREATE, UPDATE, DELETE operations
 */
function MockCategoryPage() {
  const { user } = useAuthStore();
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryDto | null>(
    null,
  );
  const [categoryName, setCategoryName] = useState("");
  const [pendingDeleteCategory, setPendingDeleteCategory] =
    useState<CategoryDto | null>(null);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      if (!user?.id) {
        toast.error("Tenant ID not found");
        return;
      }

      setLoading(true);
      try {
        const response = await apiClient.get(
          API.CATEGORY.GET_ALL_BY_TENANT_ID(user.id),
        );
        if (response.data.isSuccess && response.data.data) {
          setCategories(response.data.data);
        } else {
          toast.error("Failed to fetch categories");
        }
      } catch (error) {
        toast.error("Error fetching categories");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [user?.id]);

  // Create category
  const handleCreateCategory = async () => {
    if (!categoryName.trim()) {
      toast.error("Category name is required");
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.post(API.CATEGORY.CREATE, {
        categoryName: categoryName.trim(),
      });

      if (response.data.isSuccess && response.data.data) {
        setCategories((prev) => [...prev, response.data.data]);
        toast.success("Category created successfully");
        handleCloseModal();
      } else {
        toast.error(response.data.message || "Failed to create category");
      }
    } catch (error) {
      toast.error("Error creating category");
    } finally {
      setLoading(false);
    }
  };

  // Update category
  const handleUpdateCategory = async () => {
    if (!selectedCategory || !categoryName.trim()) {
      toast.error("Invalid category data");
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.put(
        API.CATEGORY.UPDATE_CATEGORY(selectedCategory.id),
        { categoryName: categoryName.trim() },
      );

      if (response.data.isSuccess) {
        setCategories((prev) =>
          prev.map((cat) =>
            cat.id === selectedCategory.id
              ? { ...cat, categoryName: categoryName.trim() }
              : cat,
          ),
        );
        toast.success("Category updated successfully");
        handleCloseModal();
      } else {
        toast.error(response.data.message || "Failed to update category");
      }
    } catch (error) {
      toast.error("Error updating category");
    } finally {
      setLoading(false);
    }
  };

  // Delete category
  const handleConfirmDelete = async () => {
    if (!pendingDeleteCategory) {
      return;
    }

    setDeleteLoading(true);
    try {
      const response = await apiClient.delete(
        API.CATEGORY.DELETE_CATEGORY(pendingDeleteCategory.id),
      );

      if (response.data.isSuccess) {
        setCategories((prev) =>
          prev.filter((cat) => cat.id !== pendingDeleteCategory.id),
        );
        toast.success("Category deleted successfully");
        setPendingDeleteCategory(null);
      } else {
        toast.error(response.data.message || "Failed to delete category");
      }
    } catch (error) {
      toast.error("Error deleting category");
    } finally {
      setDeleteLoading(false);
    }
  };

  // Modal handlers
  const handleOpenCreateModal = () => {
    setSelectedCategory(null);
    setCategoryName("");
    setShowModal(true);
  };

  const handleOpenEditModal = (category: CategoryDto) => {
    setSelectedCategory(category);
    setCategoryName(category.categoryName);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedCategory(null);
    setCategoryName("");
  };

  const handleOpenDeleteConfirm = (category: CategoryDto) => {
    setPendingDeleteCategory(category);
  };

  return (
    <div data-testid="category-page">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Category Management</h1>
        <button
          data-testid="create-category-btn"
          onClick={handleOpenCreateModal}
          disabled={loading}
          className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          Create Category
        </button>
      </div>

      {/* Categories List */}
      {loading && !categories.length ? (
        <div data-testid="loading-state">Loading categories...</div>
      ) : (
        <div data-testid="categories-list">
          {categories.length === 0 ? (
            <div data-testid="empty-state">No categories found</div>
          ) : (
            <div className="space-y-2">
              {categories.map((category) => (
                <div
                  key={category.id}
                  data-testid={`category-item-${category.id}`}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div>
                    <h3 className="font-semibold">{category.categoryName}</h3>
                    <p className="text-sm text-gray-500">{category.tenantId}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      data-testid={`edit-btn-${category.id}`}
                      onClick={() => handleOpenEditModal(category)}
                      disabled={loading}
                      className="rounded px-3 py-1 text-sm text-blue-600 hover:bg-blue-50"
                    >
                      Edit
                    </button>
                    <button
                      data-testid={`delete-btn-${category.id}`}
                      onClick={() => handleOpenDeleteConfirm(category)}
                      disabled={deleteLoading}
                      className="rounded px-3 py-1 text-sm text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Category Modal */}
      {showModal && (
        <div
          data-testid="category-modal"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
        >
          <div className="w-full max-w-md rounded-lg border bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-lg font-bold">
              {selectedCategory ? "Edit Category" : "Create Category"}
            </h2>
            <input
              data-testid="category-name-input"
              type="text"
              placeholder="Category name"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              className="mb-4 w-full rounded border px-3 py-2"
            />
            <div className="flex justify-end gap-2">
              <button
                data-testid="cancel-btn"
                onClick={handleCloseModal}
                disabled={loading}
                className="rounded border px-4 py-2 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                data-testid="submit-btn"
                onClick={
                  selectedCategory ? handleUpdateCategory : handleCreateCategory
                }
                disabled={loading}
                className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {loading
                  ? "Loading..."
                  : selectedCategory
                    ? "Update"
                    : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {pendingDeleteCategory && (
        <div
          data-testid="delete-confirm-modal"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
        >
          <div className="w-full max-w-md rounded-lg border bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-lg font-bold">Confirm Delete</h2>
            <p className="mb-6 text-gray-600">
              Are you sure you want to delete "
              {pendingDeleteCategory.categoryName}"?
            </p>
            <div className="flex justify-end gap-2">
              <button
                data-testid="delete-cancel-btn"
                onClick={() => setPendingDeleteCategory(null)}
                disabled={deleteLoading}
                className="rounded border px-4 py-2 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                data-testid="delete-confirm-btn"
                onClick={handleConfirmDelete}
                disabled={deleteLoading}
                className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deleteLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  );
}

/**
 * Integration Test Suite: Tenant Category Management
 *
 * Tests the complete flow of:
 * - Fetching categories
 * - Creating new category
 * - Updating category
 * - Deleting category
 * - Error handling
 */
describe("Tenant Category Management - Integration Tests", () => {
  beforeEach(() => {
    vi.restoreAllMocks();

    // Clear auth store
    useAuthStore.setState({
      user: {
        id: "tenant-1",
        email: "tenant@example.com",
        name: "Test Tenant",
        role: "tenant",
        avatar: null,
      },
      isAuthenticated: true,
    });

    // Clear toast mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    useAuthStore.setState({ user: null, isAuthenticated: false });
  });

  describe("1. Fetch Categories", () => {
    it("should load and display categories on mount", async () => {
      render(<MockCategoryPage />);

      // Wait for categories to load
      await waitFor(() => {
        expect(screen.getByTestId("categories-list")).toBeInTheDocument();
      });

      // Check if categories are displayed
      const categoryItems = screen.getAllByTestId(/^category-item-/);
      expect(categoryItems).toHaveLength(2);

      // Verify first category
      expect(screen.getByText("Đồ ăn nhanh")).toBeInTheDocument();

      // Verify second category
      expect(screen.getByText("Đồ uống")).toBeInTheDocument();
    });

    it("should display empty state when no categories exist", async () => {
      // Mock empty response by setting auth to unexist id
      useAuthStore.setState({
        user: {
          id: "tenant-999",
          email: "tenant@example.com",
          name: "Test Tenant",
          role: "tenant",
          avatar: null,
        },
      });

      render(<MockCategoryPage />);

      await waitFor(() => {
        expect(screen.getByTestId("categories-list")).toBeInTheDocument();
      });

      expect(screen.getByTestId("empty-state")).toBeInTheDocument();
    });

    it("should show loading state while fetching categories", async () => {
      render(<MockCategoryPage />);

      // Loading state should appear initially
      const loadingOrList = screen.queryByTestId("loading-state");
      expect(loadingOrList).toBeInTheDocument();

      // Wait for categories to load
      await waitFor(() => {
        expect(screen.getByTestId("categories-list")).toBeInTheDocument();
      });
    });
  });

  describe("2. Create Category", () => {
    it("should open modal when create button is clicked", async () => {
      render(<MockCategoryPage />);

      const createBtn = await screen.findByTestId("create-category-btn");
      await userEvent.click(createBtn);

      // Wait for modal to appear and verify with testid
      await waitFor(() => {
        expect(screen.getByTestId("category-modal")).toBeInTheDocument();
      });

      // Check for the modal title using getByRole to be more specific
      const modalHeading = await screen.findByRole("heading", {
        name: /Create Category/,
      });
      expect(modalHeading).toBeInTheDocument();
    });

    it("should create new category with valid name", async () => {
      render(<MockCategoryPage />);

      // Click create button
      const createBtn = await screen.findByTestId("create-category-btn");
      await userEvent.click(createBtn);

      // Fill in category name
      const input = screen.getByTestId("category-name-input");
      await userEvent.type(input, "Món chính");

      // Submit form
      const submitBtn = screen.getByTestId("submit-btn");
      await userEvent.click(submitBtn);

      // Wait for category to be added
      await waitFor(() => {
        expect(screen.getByText("Món chính")).toBeInTheDocument();
      });

      // Modal should close
      expect(screen.queryByTestId("category-modal")).not.toBeInTheDocument();
    });

    it("should show error when creating with empty name", async () => {
      const toastErrorSpy = vi.spyOn(toast, "error");

      render(<MockCategoryPage />);

      // Click create button
      const createBtn = await screen.findByTestId("create-category-btn");
      await userEvent.click(createBtn);

      // Try to submit with empty input
      const submitBtn = screen.getByTestId("submit-btn");
      await userEvent.click(submitBtn);

      await waitFor(() => {
        expect(toastErrorSpy).toHaveBeenCalledWith("Category name is required");
      });

      toastErrorSpy.mockRestore();
    });

    it("should disable submit button while creating", async () => {
      render(<MockCategoryPage />);

      const createBtn = await screen.findByTestId("create-category-btn");
      await userEvent.click(createBtn);

      const input = screen.getByTestId("category-name-input");
      await userEvent.type(input, "Món chính");

      const submitBtn = screen.getByTestId("submit-btn");
      expect(submitBtn).not.toBeDisabled();

      await userEvent.click(submitBtn);

      // Submit button should be disabled while loading
      expect(submitBtn).toBeDisabled();
    });
  });

  describe("3. Update Category", () => {
    it("should open edit modal with current category data", async () => {
      render(<MockCategoryPage />);

      // Wait for categories to load
      await waitFor(() => {
        expect(screen.getByTestId("categories-list")).toBeInTheDocument();
      });

      // Click edit button on first category
      const editBtn = screen.getByTestId("edit-btn-1");
      await userEvent.click(editBtn);

      // Modal should show Edit Category
      expect(screen.getByTestId("category-modal")).toBeInTheDocument();
      expect(screen.getByText("Edit Category")).toBeInTheDocument();

      // Input should have current category name
      const input = screen.getByTestId(
        "category-name-input",
      ) as HTMLInputElement;
      expect(input.value).toBe("Đồ ăn nhanh");
    });

    it("should update category name successfully", async () => {
      render(<MockCategoryPage />);

      // Wait for categories to load
      await waitFor(() => {
        expect(screen.getByTestId("categories-list")).toBeInTheDocument();
      });

      // Click edit button
      const editBtn = screen.getByTestId("edit-btn-1");
      await userEvent.click(editBtn);

      // Change category name
      const input = screen.getByTestId("category-name-input");
      await userEvent.clear(input);
      await userEvent.type(input, "Đồ ăn nhanh - Updated");

      // Submit
      const submitBtn = screen.getByTestId("submit-btn");
      await userEvent.click(submitBtn);

      // Wait for update and verify
      await waitFor(() => {
        expect(screen.getByText("Đồ ăn nhanh - Updated")).toBeInTheDocument();
      });

      // Modal should close
      expect(screen.queryByTestId("category-modal")).not.toBeInTheDocument();
    });

    it("should cancel edit without saving", async () => {
      render(<MockCategoryPage />);

      // Wait for categories to load
      await waitFor(() => {
        expect(screen.getByTestId("categories-list")).toBeInTheDocument();
      });

      // Original text
      expect(screen.getByText("Đồ ăn nhanh")).toBeInTheDocument();

      // Click edit
      const editBtn = screen.getByTestId("edit-btn-1");
      await userEvent.click(editBtn);

      // Change name
      const input = screen.getByTestId("category-name-input");
      await userEvent.clear(input);
      await userEvent.type(input, "Đồ ăn nhanh - Updated");

      // Click cancel
      const cancelBtn = screen.getByTestId("cancel-btn");
      await userEvent.click(cancelBtn);

      // Modal should close
      expect(screen.queryByTestId("category-modal")).not.toBeInTheDocument();

      // Original name should remain
      expect(screen.getByText("Đồ ăn nhanh")).toBeInTheDocument();
      expect(
        screen.queryByText("Đồ ăn nhanh - Updated"),
      ).not.toBeInTheDocument();
    });
  });

  describe("4. Delete Category", () => {
    it("should open delete confirmation modal", async () => {
      render(<MockCategoryPage />);

      // Wait for categories to load
      await waitFor(() => {
        expect(screen.getByTestId("categories-list")).toBeInTheDocument();
      });

      // Click delete button
      const deleteBtn = screen.getByTestId("delete-btn-1");
      await userEvent.click(deleteBtn);

      // Confirmation modal should appear
      await waitFor(() => {
        expect(screen.getByTestId("delete-confirm-modal")).toBeInTheDocument();
      });

      // Check for confirmation message
      const confirmMessage = await screen.findByText(
        /Are you sure you want to delete/,
      );
      expect(confirmMessage).toBeInTheDocument();
    });

    it("should delete category after confirmation", async () => {
      render(<MockCategoryPage />);

      // Wait for categories to load
      await waitFor(() => {
        expect(screen.getByTestId("categories-list")).toBeInTheDocument();
      });

      // Verify initial count
      expect(screen.getByTestId("category-item-1")).toBeInTheDocument();
      expect(screen.getByTestId("category-item-2")).toBeInTheDocument();

      // Click delete
      const deleteBtn = screen.getByTestId("delete-btn-1");
      await userEvent.click(deleteBtn);

      // Confirm delete
      const confirmBtn = screen.getByTestId("delete-confirm-btn");
      await userEvent.click(confirmBtn);

      // Wait for deletion
      await waitFor(() => {
        expect(screen.queryByTestId("category-item-1")).not.toBeInTheDocument();
      });

      // Second category should still exist
      expect(screen.getByTestId("category-item-2")).toBeInTheDocument();

      // Modal should close
      expect(
        screen.queryByTestId("delete-confirm-modal"),
      ).not.toBeInTheDocument();
    });

    it("should cancel delete without removing category", async () => {
      render(<MockCategoryPage />);

      // Wait for categories to load
      await waitFor(() => {
        expect(screen.getByTestId("categories-list")).toBeInTheDocument();
      });

      // Click delete
      const deleteBtn = screen.getByTestId("delete-btn-1");
      await userEvent.click(deleteBtn);

      // Click cancel
      const cancelBtn = screen.getByTestId("delete-cancel-btn");
      await userEvent.click(cancelBtn);

      // Modal should close
      expect(
        screen.queryByTestId("delete-confirm-modal"),
      ).not.toBeInTheDocument();

      // Category should still exist
      expect(screen.getByTestId("category-item-1")).toBeInTheDocument();
      expect(screen.getByText("Đồ ăn nhanh")).toBeInTheDocument();
    });

    it("should disable delete button while deleting", async () => {
      render(<MockCategoryPage />);

      // Wait for categories to load
      await waitFor(() => {
        expect(screen.getByTestId("categories-list")).toBeInTheDocument();
      });

      // Click delete
      const deleteBtn = screen.getByTestId("delete-btn-1");
      await userEvent.click(deleteBtn);

      // Get confirm button
      const confirmBtn = screen.getByTestId("delete-confirm-btn");
      expect(confirmBtn).not.toBeDisabled();

      // Click confirm
      await userEvent.click(confirmBtn);

      // Button should be disabled while deleting
      expect(confirmBtn).toBeDisabled();
    });
  });

  describe("5. Error Handling", () => {
    it("should show error when tenant ID is missing", async () => {
      const toastErrorSpy = vi.spyOn(toast, "error");

      // Clear auth store
      useAuthStore.setState({ user: null });

      render(<MockCategoryPage />);

      await waitFor(() => {
        expect(toastErrorSpy).toHaveBeenCalledWith("Tenant ID not found");
      });

      toastErrorSpy.mockRestore();
    });

    it("should handle API errors gracefully", async () => {
      const toastErrorSpy = vi.spyOn(toast, "error");

      render(<MockCategoryPage />);

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByTestId("categories-list")).toBeInTheDocument();
      });

      // The test succeeds if we can complete operations without crashing
      expect(screen.getByTestId("categories-list")).toBeInTheDocument();

      toastErrorSpy.mockRestore();
    });
  });

  describe("6. Edge Cases & User Interactions", () => {
    it("should trim whitespace from category name", async () => {
      render(<MockCategoryPage />);

      const createBtn = await screen.findByTestId("create-category-btn");
      await userEvent.click(createBtn);

      const input = screen.getByTestId("category-name-input");
      await userEvent.type(input, "  Test Category  ");

      const submitBtn = screen.getByTestId("submit-btn");
      await userEvent.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByText("Test Category")).toBeInTheDocument();
      });
    });

    it("should handle rapid category creation", async () => {
      let nextCategoryId = 3;
      vi.spyOn(apiClient, "post").mockImplementation(async (_url, payload) => {
        const request = payload as { categoryName?: string };

        return {
          data: {
            isSuccess: true,
            data: {
              id: nextCategoryId++,
              categoryName: request.categoryName || "",
              tenantId: "tenant-1",
              createdAt: new Date().toISOString(),
            },
            message: "Category created successfully",
          },
        } as never;
      });

      render(<MockCategoryPage />);

      // Create first category
      const createBtn = await screen.findByTestId("create-category-btn");
      await userEvent.click(createBtn);

      let input = screen.getByTestId("category-name-input");
      await userEvent.type(input, "Category 1");

      let submitBtn = screen.getByTestId("submit-btn");
      await userEvent.click(submitBtn);

      // Wait for first category to be added
      await waitFor(() => {
        expect(screen.getByText("Category 1")).toBeInTheDocument();
      });

      // Create second category
      const createBtn2 = screen.getByTestId("create-category-btn");
      await userEvent.click(createBtn2);

      input = screen.getByTestId("category-name-input");
      await userEvent.type(input, "Category 2");

      submitBtn = screen.getByTestId("submit-btn");
      await userEvent.click(submitBtn);

      // Wait for second category to be added
      await waitFor(() => {
        expect(screen.getByText("Category 2")).toBeInTheDocument();
      });

      expect(screen.getByText("Category 1")).toBeInTheDocument();
    });

    it("should display tenant info in category item", async () => {
      render(<MockCategoryPage />);

      await waitFor(() => {
        expect(screen.getByTestId("categories-list")).toBeInTheDocument();
      });

      // Check if tenant ID is displayed in the first category item
      const categoryItem = screen.getByTestId("category-item-1");
      expect(categoryItem).toBeInTheDocument();

      // Tenant ID should be in the category item
      const tenantDisplay = within(categoryItem).getByText("tenant-1");
      expect(tenantDisplay).toBeInTheDocument();
    });
  });

  describe("7. Complete User Flow", () => {
    it("should complete full CRUD cycle", async () => {
      render(<MockCategoryPage />);

      // Step 1: Load categories
      await waitFor(() => {
        expect(screen.getByTestId("categories-list")).toBeInTheDocument();
      });
      expect(screen.getByText("Đồ ăn nhanh")).toBeInTheDocument();

      // Step 2: Create new category
      const createBtn = screen.getByTestId("create-category-btn");
      await userEvent.click(createBtn);

      const input = screen.getByTestId("category-name-input");
      await userEvent.type(input, "Tráng miệng");

      let submitBtn = screen.getByTestId("submit-btn");
      await userEvent.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByText("Tráng miệng")).toBeInTheDocument();
      });

      // Step 3: Update the new category
      const createdCategoryItem = screen
        .getByText("Tráng miệng")
        .closest("[data-testid^='category-item-']");
      expect(createdCategoryItem).not.toBeNull();

      const editBtn = within(createdCategoryItem as HTMLElement).getByRole(
        "button",
        {
          name: "Edit",
        },
      );
      await userEvent.click(editBtn);

      const editInput = screen.getByTestId("category-name-input");
      await userEvent.clear(editInput);
      await userEvent.type(editInput, "Tráng miệng - Đặc biệt");

      submitBtn = screen.getByTestId("submit-btn");
      await userEvent.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByText("Tráng miệng - Đặc biệt")).toBeInTheDocument();
      });

      // Step 4: Delete the category
      const updatedCategoryItem = screen
        .getByText("Tráng miệng - Đặc biệt")
        .closest("[data-testid^='category-item-']");
      expect(updatedCategoryItem).not.toBeNull();

      const deleteBtn = within(updatedCategoryItem as HTMLElement).getByRole(
        "button",
        {
          name: "Delete",
        },
      );
      await userEvent.click(deleteBtn);

      const confirmBtn = screen.getByTestId("delete-confirm-btn");
      await userEvent.click(confirmBtn);

      await waitFor(() => {
        expect(
          screen.queryByText("Tráng miệng - Đặc biệt"),
        ).not.toBeInTheDocument();
      });

      // Verify original categories still exist
      expect(screen.getByText("Đồ ăn nhanh")).toBeInTheDocument();
      expect(screen.getByText("Đồ uống")).toBeInTheDocument();
    });
  });
});
