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
  const [loading, setLoading] = useState<boolean>(false);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryDto | null>(null);
  const [pendingDeleteCategory, setPendingDeleteCategory] = useState<CategoryDto | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      if (!user?.id) {
        toast.error("Không tìm thấy tenantId để tải danh mục");
        return;
      }

      try {
        const response = await apiClient.get(API.CATEGORY.GET_ALL_BY_TENANT_ID(user.id));
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
        setLoading(false);
      }
    };
    fetchCategories();
  }, [user?.id]);

   const handleCreateClick = () => {
    setShowInfoModal(true)
  }

  const handleUpdateClick = (category: CategoryDto) => {
    setSelectedCategory(category);
    setShowInfoModal(true);
  }

  const handleCreateCategory = async (categoryName: string) => {
    setLoading(true);
    try {
      const response = await apiClient.post(API.CATEGORY.CREATE, {
        categoryName,
      }); 
        if (response.data.isSuccess) {
            setCategories((prev) => [...prev, response.data.data]);
            toast.success("Tạo danh mục thành công");
            setShowInfoModal(false)
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

  const handleUpdateCategory = async (categoryId: number, categoryName: string) => {
    setLoading(true);
    try {
      const response = await apiClient.put(API.CATEGORY.UPDATE_CATEGORY(categoryId), {
        categoryName,
      });
      if (response.data.isSuccess) {
        setCategories((prev) =>
          prev.map((category) => (category.id === categoryId ? { ...category, categoryName } : category))
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
    {" "}
    {categories.length === 0 ? (
      <div className="flex min-h-[600px] items-center justify-center">
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
            ? `Bạn có chắc muốn xóa danh mục ${pendingDeleteCategory.categoryName}?`
            : "Bạn có chắc muốn xóa danh mục này?"
        }
        confirmText="Xóa"
        cancelText="Hủy"
        confirmVariant="danger"
        isLoading={deleteLoading}
        onClose={() => setPendingDeleteCategory(null)}
        onConfirm={handleConfirmDeleteCategory}
      />
  </div>
  )
}
