"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import BranchDishMenuList from "@/src/components/ui/tenant/BranchDishMenuList";
import { API } from "@/src/constants/api";
import apiClient from "@/src/services/apiClient";
import { ApiResponse, MenuCategoryDto, Restaurant } from "@/src/types/type";

const parseRestaurantId = (
  value: string | string[] | undefined,
): number | null => {
  const id = Array.isArray(value) ? value[0] : value;
  if (!id) {
    return null;
  }

  const parsed = Number(id);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return null;
  }

  return Math.floor(parsed);
};

export default function BranchDishRestaurantDetailPage() {
  const router = useRouter();
  const params = useParams<{ restaurantId: string }>();

  const restaurantId = useMemo(
    () => parseRestaurantId(params?.restaurantId),
    [params?.restaurantId],
  );

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menuCategories, setMenuCategories] = useState<MenuCategoryDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [togglingDishIds, setTogglingDishIds] = useState<Set<number>>(
    new Set(),
  );
  const [togglingCategoryIds, setTogglingCategoryIds] = useState<Set<number>>(
    new Set(),
  );

  const loadData = useCallback(async () => {
    if (!restaurantId) {
      return;
    }

    setIsLoading(true);
    try {
      const [menuResponse, restaurantResponse] = await Promise.all([
        apiClient.get<ApiResponse<MenuCategoryDto[]>>(
          API.RESTAURANT.GET_MENU_ALL(restaurantId),
        ),
        apiClient.get<ApiResponse<Restaurant>>(
          API.RESTAURANT.GET_BY_ID(String(restaurantId)),
        ),
      ]);

      if (menuResponse.data.isSuccess && menuResponse.data.data) {
        setMenuCategories(menuResponse.data.data);
      } else {
        setMenuCategories([]);
        toast.error(
          menuResponse.data.message || "Không thể tải menu của nhà hàng",
        );
      }

      if (restaurantResponse.data.isSuccess && restaurantResponse.data.data) {
        setRestaurant(restaurantResponse.data.data);
      } else {
        setRestaurant(null);
      }
    } catch (error: unknown) {
      const backendMessage = (
        error as { response?: { data?: { message?: string } } }
      ).response?.data?.message;

      toast.error(
        backendMessage ||
          (error as { message?: string }).message ||
          "Có lỗi xảy ra khi tải dữ liệu nhà hàng",
      );
      setMenuCategories([]);
      setRestaurant(null);
    } finally {
      setIsLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleToggleDish = async (
    restaurantId: number,
    dishId: number,
    isSelling: boolean,
  ) => {
    setTogglingDishIds((prev) => {
      const next = new Set(prev);
      next.add(dishId);
      return next;
    });

    try {
      const response = await apiClient.put<ApiResponse<unknown>>(
        API.BRANCH_DISH_CONFIG.UPDATE_IS_SELLING(
          restaurantId,
          dishId,
          isSelling,
        ),
      );

      if (response.data.isSuccess) {
        await loadData();
        toast.success("Cập nhật trạng thái món thành công");
      } else {
        toast.error(
          response.data.message || "Không thể cập nhật trạng thái món",
        );
      }
    } catch (error: unknown) {
      const backendMessage = (
        error as { response?: { data?: { message?: string } } }
      ).response?.data?.message;

      toast.error(
        backendMessage ||
          (error as { message?: string }).message ||
          "Có lỗi xảy ra khi cập nhật trạng thái món",
      );
    } finally {
      setTogglingDishIds((prev) => {
        const next = new Set(prev);
        next.delete(dishId);
        return next;
      });
    }
  };

  const handleToggleCategory = async (
    restaurantId: number,
    categoryId: number,
    isSelling: boolean,
  ) => {
    setTogglingCategoryIds((prev) => {
      const next = new Set(prev);
      next.add(categoryId);
      return next;
    });

    try {
      const response = await apiClient.put<ApiResponse<unknown>>(
        API.BRANCH_DISH_CONFIG.UPDATE_IS_SELLING_BY_CATEGORY(
          restaurantId,
          categoryId,
          isSelling,
        ),
      );

      if (response.data.isSuccess) {
        await loadData();
        toast.success("Cập nhật trạng thái danh mục thành công");
      } else {
        toast.error(
          response.data.message || "Không thể cập nhật trạng thái danh mục",
        );
      }
    } catch (error: unknown) {
      const backendMessage = (
        error as { response?: { data?: { message?: string } } }
      ).response?.data?.message;

      toast.error(
        backendMessage ||
          (error as { message?: string }).message ||
          "Có lỗi xảy ra khi cập nhật trạng thái danh mục",
      );
    } finally {
      setTogglingCategoryIds((prev) => {
        const next = new Set(prev);
        next.delete(categoryId);
        return next;
      });
    }
  };

  const handleSyncDishes = async () => {
    try {
      const response = await apiClient.post<ApiResponse<unknown>>(
        API.BRANCH_DISH_CONFIG.SYNC_DISHES_TO_BRANCH,
      );

      if (response.data.isSuccess) {
        toast.success("Đồng bộ món ăn thành công");
      } else {
        toast.error(response.data.message || "Không thể đồng bộ món ăn");
      }
    } catch (error: unknown) {
      const backendMessage = (
        error as { response?: { data?: { message?: string } } }
      ).response?.data?.message;
      toast.error(backendMessage || "Có lỗi xảy ra khi đồng bộ món ăn");
    } finally {
      await loadData();
    }
  };

  if (!restaurantId) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 p-6">
        <p className="text-sm text-slate-700">ID nhà hàng không hợp lệ.</p>
        <button
          onClick={() => router.push("/tenant/branch-dish-management")}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Quay lại
        </button>
      </div>
    );
  }

  return (
    <BranchDishMenuList
      restaurant={restaurant}
      categories={menuCategories}
      isLoading={isLoading}
      togglingDishIds={togglingDishIds}
      togglingCategoryIds={togglingCategoryIds}
      onBack={() => router.push("/tenant/branch-dish-management")}
      onToggleDish={handleToggleDish}
      onToggleCategory={handleToggleCategory}
      onSyncDishes={handleSyncDishes}
    />
  );
}
