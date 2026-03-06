"use client";
import DishList from "@/src/components/ui/tenant/DishList";
import DishPopUp from "@/src/components/ui/tenant/DishPopUp";
import { API } from "@/src/constants/api";
import { useAuth } from "@/src/hooks/useAuth";
import apiClient from "@/src/services/apiClient";
import { DishesDto, CategoryDto } from "@/src/types/type";
import { Plus } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function DishPage() {
  const { user } = useAuth();
  const [dishes, setDishes] = useState<DishesDto[]>([]);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [showDishModal, setShowDishModal] = useState(false);
  const [selectedDish, setSelectedDish] = useState<DishesDto | null>(null);

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
    setSelectedDish(null);
    setShowDishModal(true);
  };

  const handleUpdateClick = (dish: DishesDto) => {
    setSelectedDish(dish);
    setShowDishModal(true);
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
              <button
                onClick={handleCreateClick}
                className="rounded-lg bg-orange-600 px-6 py-3 font-medium text-white hover:bg-orange-700"
              >
                Tạo món ăn
              </button>
            )}
          </div>
        </div>
      ) : (
        <DishList
          dishes={dishes}
          onCreateClick={handleCreateClick}
          onEditClick={handleUpdateClick}
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
    </div>
  );
}
