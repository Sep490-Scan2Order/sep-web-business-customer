"use client";
import DishList from "@/src/components/ui/tenant/DishList";
import ComboDetailPopUp from "@/src/components/ui/tenant/ComboDetailPopUp";
import ConfirmActionPopup from "@/src/components/ui/common/ConfirmActionPopup";
import ComboPopUp from "@/src/components/ui/tenant/ComboPopUp";
import DishImportPopUp from "@/src/components/ui/tenant/DishImportPopUp";
import DishPopUp from "@/src/components/ui/tenant/DishPopUp";
import { API } from "@/src/constants/api";
import { useAuth } from "@/src/hooks/useAuth";
import apiClient from "@/src/services/apiClient";
import { DishesDto, CategoryDto, ComboDto } from "@/src/types/type";
import { Plus } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function DishPage() {
  const { user } = useAuth();
  const [dishes, setDishes] = useState<DishesDto[]>([]);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [showDishModal, setShowDishModal] = useState(false);
  const [showComboModal, setShowComboModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showComboDetailModal, setShowComboDetailModal] = useState(false);
  const [comboDetailLoading, setComboDetailLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [deleteDishLoading, setDeleteDishLoading] = useState(false);
  const [selectedCombo, setSelectedCombo] = useState<ComboDto | null>(null);
  const [comboItems, setComboItems] = useState<ComboDto[]>([]);
  const [selectedDish, setSelectedDish] = useState<DishesDto | null>(null);
  const [pendingDeleteDish, setPendingDeleteDish] = useState<DishesDto | null>(null);
  const hasSelectableDish = dishes.some((dish) => dish.type !== 1);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) {
        toast.error("Không tìm thấy tenantId để tải danh mục");
        return;
      }

      try {
        // Fetch categories and dishes in parallel
        const [categoriesResponse, dishesResponse] = await Promise.all([
          apiClient.get(API.CATEGORY.GET_ALL_BY_TENANT_ID(user.id)),
          apiClient.get(API.DISHES.GET_ALL_BY_TENANT_ID(user.id))
        ]);

        if (categoriesResponse.data.isSuccess && categoriesResponse.data.data) {
          setCategories(categoriesResponse.data.data);
        }

        if (dishesResponse.data.isSuccess && dishesResponse.data.data) {
          setDishes(dishesResponse.data.data);
        }
      } catch (error: unknown) {
        const backendMessage = (
          error as { response?: { data?: { message?: string } } }
        ).response?.data?.message;
        toast.error(
          backendMessage ||
            (error as { message?: string }).message ||
            "Có lỗi xảy ra khi tải dữ liệu",
        );
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user?.id]);

  const handleCreateClick = () => {
    if (categories.length === 0) {
      toast.warning("Vui lòng tạo danh mục trước khi thêm món ăn");
      return;
    }
    setShowComboModal(false);
    setShowComboDetailModal(false);
    setSelectedDish(null);
    setShowDishModal(true);
  };

  const handleCreateComboClick = () => {
    if (categories.length === 0) {
      toast.warning("Vui lòng tạo danh mục trước khi tạo combo");
      return;
    }

    if (!hasSelectableDish) {
      toast.warning("Cần có ít nhất 1 món ăn để tạo combo");
      return;
    }

    setShowDishModal(false);
    setShowComboDetailModal(false);
    setSelectedDish(null);
    setShowComboModal(true);
  };

  const handleUpdateClick = (dish: DishesDto) => {
    setShowComboModal(false);
    setShowComboDetailModal(false);
    setSelectedDish(dish);
    setShowDishModal(true);
  };

  const handleViewComboDetail = async (combo: ComboDto) => {
    setComboDetailLoading(true);
    setSelectedCombo(combo);
    setComboItems([]);
    setShowDishModal(false);
    setShowComboModal(false);
    setShowComboDetailModal(true);

    try {
      const response = await apiClient.get<{
        isSuccess: boolean;
        message: string;
        data: ComboDto[];
      }>(API.DISHES.GET_DETAIL_COMBO(combo.dish.id));

      if (response.data.isSuccess) {
        setComboItems(response.data.data ?? []);
        return;
      }

      toast.error(response.data.message || "Khong the tai chi tiet combo");
    } catch (error: unknown) {
      const backendMessage = (
        error as { response?: { data?: { message?: string } } }
      ).response?.data?.message;
      toast.error(
        backendMessage ||
          (error as { message?: string }).message ||
          "Co loi xay ra khi tai chi tiet combo",
      );
    } finally {
      setComboDetailLoading(false);
    }
  };

  const handleDishCardClick = (dish: DishesDto) => {
    if (dish.type === 1) {
      void handleViewComboDetail({ dish, quantity: 1 });
      return;
    }

    handleUpdateClick(dish);
  };

  const handleDeleteDishClick = (dish: DishesDto) => {
    setPendingDeleteDish(dish);
  };

  const handleConfirmDeleteDish = async () => {
    if (!pendingDeleteDish) {
      return;
    }

    if (typeof pendingDeleteDish.categoryId !== "number") {
      toast.error("Không xác định được danh mục của món ăn để xóa");
      return;
    }

    setDeleteDishLoading(true);

    try {
      const response = await apiClient.delete(
        API.DISHES.DELETE_DISH(pendingDeleteDish.categoryId, pendingDeleteDish.id),
      );

      if (!response.data?.isSuccess) {
        toast.error(response.data?.message || "Không thể xóa món ăn");
        return;
      }

      setDishes((prev) => prev.filter((dish) => dish.id !== pendingDeleteDish.id));
      setPendingDeleteDish(null);
      setShowDishModal(false);
      toast.success(response.data?.message || "Xóa món ăn thành công");
    } catch (error: unknown) {
      const backendMessage = (
        error as { response?: { data?: { message?: string } } }
      ).response?.data?.message;
      toast.error(
        backendMessage ||
          (error as { message?: string }).message ||
          "Có lỗi xảy ra khi xóa món ăn",
      );
    } finally {
      setDeleteDishLoading(false);
    }
  };

  const handleCreateDish = async (categoryId: number,formData: FormData) => {
    setLoading(true);
    console.log("Dữ liệu gửi đi:", Object.fromEntries(formData.entries()));
    try {
      
      const response = await apiClient.post(
        API.DISHES.CREATE(categoryId),
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data.isSuccess) {
        setDishes((prev) => [...prev, response.data.data]);
        toast.success("Tạo món ăn thành công");
        setShowDishModal(false);
      } else {
        toast.error(response.data.message || "Không thể tạo món ăn");
      }
    } catch (error: unknown) {
      const backendMessage = (
        error as { response?: { data?: { message?: string } } }
      ).response?.data?.message;
      toast.error(
        backendMessage ||
          (error as { message?: string }).message ||
          "Có lỗi xảy ra khi tạo món ăn",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDish = async (dishId: number, categoryId: number, formData: FormData) => {
    setLoading(true);
    try {
      const response = await apiClient.put(
        API.DISHES.UPDATE_DISH(categoryId, dishId),
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data.isSuccess) {
        setDishes((prev) =>
          prev.map((dish) => (dish.id === dishId ? response.data.data : dish))
        );
        toast.success("Cập nhật món ăn thành công");
        setShowDishModal(false);
      } else {
        toast.error(response.data.message || "Không thể cập nhật món ăn");
      }
    } catch (error: unknown) {
      const backendMessage = (
        error as { response?: { data?: { message?: string } } }
      ).response?.data?.message;
      toast.error(
        backendMessage ||
          (error as { message?: string }).message ||
          "Có lỗi xảy ra khi cập nhật món ăn",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCombo = async (categoryId: number, formData: FormData) => {
    setLoading(true);
    try {
      const response = await apiClient.post(
        API.DISHES.CREATE_COMBO(categoryId),
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      if (response.data.isSuccess) {
        setDishes((prev) => [...prev, response.data.data]);
        toast.success("Tạo combo thành công");
        setShowComboModal(false);
        return;
      }

      toast.error(response.data.message || "Không thể tạo combo");
    } catch (error: unknown) {
      const backendMessage = (
        error as { response?: { data?: { message?: string } } }
      ).response?.data?.message;
      toast.error(
        backendMessage ||
          (error as { message?: string }).message ||
          "Có lỗi xảy ra khi tạo combo",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleImportDishesClick = () => {
    setShowDishModal(false);
    setShowComboModal(false);
    setShowComboDetailModal(false);
    setShowImportModal(true);
  };

  const handleImportDishes = async (file: File) => {
    if (!user?.id) {
      toast.error("Không tìm thấy tenantId để import món ăn");
      return;
    }

    setImportLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const importResponse = await apiClient.post(API.DISHES.IMPORT_DISHES, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (!importResponse.data?.isSuccess) {
        toast.error(importResponse.data?.message || "Không thể import món ăn");
        return;
      }

      const dishesResponse = await apiClient.get(API.DISHES.GET_ALL_BY_TENANT_ID(user.id));
      if (dishesResponse.data?.isSuccess && dishesResponse.data?.data) {
        setDishes(dishesResponse.data.data);
      }

      toast.success(importResponse.data.message || "Import món ăn thành công");
      setShowImportModal(false);
    } catch (error: unknown) {
      const backendMessage = (
        error as { response?: { data?: { message?: string } } }
      ).response?.data?.message;
      toast.error(
        backendMessage ||
          (error as { message?: string }).message ||
          "Có lỗi xảy ra khi import món ăn",
      );
    } finally {
      setImportLoading(false);
    }
  };

  return (
    <div>
      {dishes.length === 0 ? (
        <div className="flex min-h-[600px] items-center justify-center">
          <div className="flex flex-col items-center gap-6">
            <div className="rounded-3xl border-2 border-dashed border-slate-300 bg-slate-50 p-16">
              <Plus className="h-16 w-16 text-slate-400" strokeWidth={1.5} />
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-slate-900">
                {categories.length === 0
                  ? "Bạn cần tạo danh mục trước"
                  : "Tạo món ăn đầu tiên của bạn"}
              </h2>
              <p className="mt-2 text-slate-600">
                {categories.length === 0
                  ? "Vui lòng tạo danh mục món ăn trước khi thêm món ăn"
                  : "Bắt đầu quản lý các món ăn của bạn ngay bây giờ"}
              </p>
            </div>
            {categories.length > 0 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCreateClick}
                  className="rounded-lg bg-orange-600 px-6 py-3 font-medium text-white hover:bg-orange-700"
                >
                  Tạo món ăn
                </button>
                <button
                  onClick={handleCreateComboClick}
                  disabled={!hasSelectableDish}
                  className="rounded-lg border border-slate-200 bg-slate-900 px-6 py-3 font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Tạo combo
                </button>
                <button
                  onClick={handleImportDishesClick}
                  className="rounded-lg border border-slate-200 bg-slate-900 px-6 py-3 font-medium text-white hover:bg-slate-800"
                >
                  Nhập món ăn hàng loạt bằng file Excel
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <DishList
          dishes={dishes}
          onCreateClick={handleCreateClick}
          onCreateComboClick={handleCreateComboClick}
          onImportClick={handleImportDishesClick}
          onDishClick={handleDishCardClick}
          onEditClick={handleUpdateClick}
          onDeleteClick={handleDeleteDishClick}
        />
      )}

      {showDishModal && (
        <DishPopUp
          categories={categories}
          onClose={() => {
            setShowDishModal(false);
            setSelectedDish(null);
          }}
          onSubmit={handleCreateDish}
          onUpdate={handleUpdateDish}
          isLoading={loading}
          dishData={selectedDish}
        />
      )}

      {showComboModal && (
        <ComboPopUp
          categories={categories}
          dishes={dishes}
          onClose={() => setShowComboModal(false)}
          onSubmit={handleCreateCombo}
          isLoading={loading}
        />
      )}

      {showImportModal && (
        <DishImportPopUp
          onClose={() => setShowImportModal(false)}
          onSubmit={handleImportDishes}
          isLoading={importLoading}
        />
      )}

      {showComboDetailModal && selectedCombo && (
        <ComboDetailPopUp
          combo={selectedCombo}
          comboItems={comboItems}
          isLoading={comboDetailLoading}
          onClose={() => {
            setShowComboDetailModal(false);
            setSelectedCombo(null);
            setComboItems([]);
          }}
        />
      )}

      <ConfirmActionPopup
        isOpen={Boolean(pendingDeleteDish)}
        title="Xác nhận xóa món ăn"
        message={
          pendingDeleteDish
            ? `Bạn có chắc muốn xóa ${pendingDeleteDish.type === 1 ? "combo" : "món"} ${pendingDeleteDish.dishName}?`
            : "Bạn có chắc muốn xóa món ăn này?"
        }
        confirmText="Xóa"
        cancelText="Hủy"
        confirmVariant="danger"
        isLoading={deleteDishLoading}
        onClose={() => setPendingDeleteDish(null)}
        onConfirm={handleConfirmDeleteDish}
      />
    </div>
  );
}
