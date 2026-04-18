"use client";
import ConfirmActionPopup from "@/src/components/ui/common/ConfirmActionPopup";
import CategoryList from "@/src/components/ui/tenant/CategoryList";
import CategoryPopUp from "@/src/components/ui/tenant/CategoryPopUp";
import { API } from "@/src/constants/api";
import { useAuth } from "@/src/hooks/useAuth";
import apiClient from "@/src/services/apiClient";
import { CategoryDto } from "@/src/types/type";
import { Plus } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function CategoryPage() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryDto | null>(
    null,
  );
  const [pendingDeleteCategory, setPendingDeleteCategory] =
    useState<CategoryDto | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      if (!user?.id) {
        toast.error("Không tìm thấy tenantId để tải danh mục");
        setIsInitialLoading(false);
        return;
      }

      try {
        const response = await apiClient.get(
          API.CATEGORY.GET_ALL_BY_TENANT_ID(user.id),
        );
        if (response.data.isSuccess && response.data.data) {
          setCategories(response.data.data);
        } else {
          toast.error("Không thể tải danh mục");
        }
      } catch (error: unknown) {
        const backendMessage = (
          error as { response?: { data?: { message?: string } } }
        ).response?.data?.message;
        toast.error(
          backendMessage ||
            (error as { message?: string }).message ||
            "Có lỗi xảy ra khi lấy danh mục",
        );
      } finally {
        setIsInitialLoading(false);
      }
    };
    fetchCategories();
  }, [user?.id]);

  const handleCreateClick = () => {
    setShowInfoModal(true);
  };

  const handleUpdateClick = (category: CategoryDto) => {
    setSelectedCategory(category);
    setShowInfoModal(true);
  };

  const handleCreateCategory = async (categoryName: string) => {
    setLoading(true);
    try {
      const response = await apiClient.post(API.CATEGORY.CREATE, {
        categoryName,
      });
      if (response.data.isSuccess) {
        setCategories((prev) => [...prev, response.data.data]);
        toast.success("Tạo danh mục thành công");
        setShowInfoModal(false);
      } else {
        toast.error("Không thể tạo danh mục");
      }
    } catch (error: unknown) {
      const backendMessage = (
        error as { response?: { data?: { message?: string } } }
      ).response?.data?.message;
      toast.error(
        backendMessage ||
          (error as { message?: string }).message ||
          "Có lỗi xảy ra khi tạo danh mục",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCategory = async (
    categoryId: number,
    categoryName: string,
  ) => {
    setLoading(true);
    try {
      const response = await apiClient.put(
        API.CATEGORY.UPDATE_CATEGORY(categoryId),
        {
          categoryName,
        },
      );
      if (response.data.isSuccess) {
        setCategories((prev) =>
          prev.map((category) =>
            category.id === categoryId
              ? { ...category, categoryName }
              : category,
          ),
        );
        toast.success("Cập nhật danh mục thành công");
        setShowInfoModal(false);
      } else {
        toast.error("Không thể cập nhật danh mục");
      }
    } catch (error: unknown) {
      const backendMessage = (
        error as { response?: { data?: { message?: string } } }
      ).response?.data?.message;
      toast.error(
        backendMessage ||
          (error as { message?: string }).message ||
          "Có lỗi xảy ra khi cập nhật danh mục",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategoryClick = (category: CategoryDto) => {
    setPendingDeleteCategory(category);
  };

  const handleConfirmDeleteCategory = async () => {
    if (!pendingDeleteCategory) {
      return;
    }

    setDeleteLoading(true);

    try {
      const response = await apiClient.delete(
        API.CATEGORY.DELETE_CATEGORY(pendingDeleteCategory.id),
      );

      if (!response.data?.isSuccess) {
        toast.error(response.data?.message || "Không thể xóa danh mục");
        return;
      }

      setCategories((prev) =>
        prev.filter((category) => category.id !== pendingDeleteCategory.id),
      );
      setPendingDeleteCategory(null);
      toast.success(response.data?.message || "Xóa danh mục thành công");
    } catch (error: unknown) {
      const backendMessage = (
        error as { response?: { data?: { message?: string } } }
      ).response?.data?.message;
      toast.error(
        backendMessage ||
          (error as { message?: string }).message ||
          "Có lỗi xảy ra khi xóa danh mục",
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div>
      {isInitialLoading ? (
        <div className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <div className="h-3 w-28 animate-pulse rounded bg-slate-200" />
              <div className="mt-2 h-6 w-40 animate-pulse rounded bg-slate-200" />
            </div>
            <div className="h-10 w-32 animate-pulse rounded-xl bg-slate-200" />
          </div>

          <div className="mb-6 h-10 w-full animate-pulse rounded-xl bg-slate-100" />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={`category-skeleton-${index}`}
                className="rounded-xl border border-slate-200 bg-white p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 animate-pulse rounded-lg bg-slate-200" />
                    <div className="space-y-2">
                      <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
                      <div className="h-3 w-16 animate-pulse rounded bg-slate-100" />
                    </div>
                  </div>
                  <div className="h-8 w-8 animate-pulse rounded bg-slate-200" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : categories.length === 0 ? (
        <div className="flex min-h-150 items-center justify-center">
          <div className="flex flex-col items-center gap-6">
            <div className="rounded-3xl border-2 border-dashed border-slate-300 bg-slate-50 p-16">
              <Plus className="h-16 w-16 text-slate-400" strokeWidth={1.5} />
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-slate-900">
                Tạo danh mục món ăn đầu tiên của bạn
              </h2>
              <p className="mt-2 text-slate-600">
                Bắt đầu quản lý các danh mục món ăn của bạn ngay bây giờ
              </p>
            </div>
            <button
              onClick={handleCreateClick}
              className="rounded-lg bg-emerald-600 px-6 py-3 font-medium text-white hover:bg-emerald-700"
            >
              Tạo danh mục
            </button>
          </div>
        </div>
      ) : (
        <CategoryList
          categories={categories}
          onCreateClick={handleCreateClick}
          onEditClick={handleUpdateClick}
          onDeleteClick={handleDeleteCategoryClick}
        />
      )}

      {showInfoModal && (
        <CategoryPopUp
          onClose={() => {
            setShowInfoModal(false);
            setSelectedCategory(null);
          }}
          onSubmit={handleCreateCategory}
          onUpdate={handleUpdateCategory}
          isLoading={loading}
          categoryData={selectedCategory}
        />
      )}

      <ConfirmActionPopup
        isOpen={Boolean(pendingDeleteCategory)}
        title="Xác nhận xóa danh mục"
        message={
          pendingDeleteCategory
            ? `Bạn có chắc muốn xóa danh mục ${pendingDeleteCategory.categoryName}? Tất cả món ăn thuộc danh mục này cũng sẽ bị xóa.`
            : "Bạn có chắc muốn xóa danh mục này? Tất cả món ăn thuộc danh mục cũng sẽ bị xóa."
        }
        confirmText="Xóa"
        cancelText="Hủy"
        confirmVariant="danger"
        isLoading={deleteLoading}
        onClose={() => setPendingDeleteCategory(null)}
        onConfirm={handleConfirmDeleteCategory}
      />
    </div>
  );
}
