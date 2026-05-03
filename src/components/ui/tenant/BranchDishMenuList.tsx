"use client";

import React, { useMemo, useState } from "react";
import { MenuCategoryDto, Restaurant } from "@/src/types/type";
import {
  ArrowLeft,
  Loader2,
  Lock,
  Search,
  Unlock,
  UtensilsCrossed,
} from "lucide-react";
import ConfirmActionPopup from "@/src/components/ui/common/ConfirmActionPopup";

interface BranchDishMenuListProps {
  restaurant: Restaurant | null;
  categories: MenuCategoryDto[];
  isLoading: boolean;
  togglingCategoryIds: Set<number>;
  onBack: () => void;
  onToggleDish: (
    restaurantId: number,
    dishId: number,
    isSelling: boolean,
  ) => void | Promise<void>;
  onToggleCategory: (
    restaurantId: number,
    categoryId: number,
    isSelling: boolean,
  ) => void | Promise<void>;
  onSyncDishes: () => void | Promise<void>;
}

interface PendingToggleAction {
  type: "dish" | "category";
  restaurantId: number;
  dishId?: number;
  categoryId?: number;
  targetName: string;
  nextIsSelling: boolean;
}

const formatPrice = (price: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);

export default function BranchDishMenuList({
  restaurant,
  categories,
  isLoading,
  togglingDishIds,
  togglingCategoryIds,
  onBack,
  onToggleDish,
  onToggleCategory,
  onSyncDishes,
}: BranchDishMenuListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [pendingToggleAction, setPendingToggleAction] =
    useState<PendingToggleAction | null>(null);

  const filteredCategories = useMemo(() => {
    const normalizedKeyword = searchTerm.trim().toLowerCase();

    if (!normalizedKeyword) {
      return categories;
    }

    return categories
      .map((category) => {
        const filteredDishes = category.dishes.filter(
          (dish) =>
            dish.dishName.toLowerCase().includes(normalizedKeyword) ||
            dish.description?.toLowerCase().includes(normalizedKeyword),
        );

        const categoryMatched = category.categoryName
          .toLowerCase()
          .includes(normalizedKeyword);

        if (categoryMatched) {
          return category;
        }

        return {
          ...category,
          dishes: filteredDishes,
        };
      })
      .filter((category) => category.dishes.length > 0);
  }, [categories, searchTerm]);

  const totalDishCount = useMemo(
    () =>
      categories.reduce((count, category) => count + category.dishes.length, 0),
    [categories],
  );

  const confirmLoading = pendingToggleAction
    ? pendingToggleAction.type === "dish"
      ? togglingDishIds.has(pendingToggleAction.dishId!)
      : togglingCategoryIds.has(pendingToggleAction.categoryId!)
    : false;

  const handleConfirmToggle = async () => {
    if (!pendingToggleAction) {
      return;
    }

    if (pendingToggleAction.type === "dish") {
      await onToggleDish(
        pendingToggleAction.restaurantId,
        pendingToggleAction.dishId!,
        pendingToggleAction.nextIsSelling,
      );
    } else {
      await onToggleCategory(
        pendingToggleAction.restaurantId,
        pendingToggleAction.categoryId!,
        pendingToggleAction.nextIsSelling,
      );
    }

    setPendingToggleAction(null);
  };

  return (
    <div className="space-y-5 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="cursor-pointer inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại danh sách nhà hàng
        </button>

        <div className="text-right">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Quản lý món theo chi nhánh
          </div>
          <h1 className="text-lg font-semibold text-slate-900">
            {restaurant?.restaurantName ?? "Nhà hàng"}
          </h1>
          <p className="text-xs text-slate-500">
            {restaurant?.address ?? "Đang tải địa chỉ..."}
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">Tổng danh mục</p>
          <p className="text-2xl font-bold text-slate-900">
            {isLoading ? (
              <span className="inline-block h-8 w-12 animate-pulse rounded bg-slate-200" />
            ) : (
              categories.length
            )}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">Tổng món trong menu</p>
          <p className="text-2xl font-bold text-slate-900">
            {isLoading ? (
              <span className="inline-block h-8 w-16 animate-pulse rounded bg-slate-200" />
            ) : (
              totalDishCount
            )}
          </p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Tìm theo danh mục hoặc tên món..."
          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-700 outline-none focus:border-slate-300 focus:bg-white"
        />
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, categoryIndex) => (
            <section
              key={`branch-category-skeleton-${categoryIndex}`}
              className="rounded-xl border border-slate-200 bg-white p-4"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="h-5 w-32 animate-pulse rounded bg-slate-200" />
                <div className="h-6 w-16 animate-pulse rounded-full bg-slate-200" />
              </div>

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((__, dishIndex) => (
                  <div
                    key={`branch-dish-skeleton-${categoryIndex}-${dishIndex}`}
                    className="rounded-lg border border-slate-200 p-3"
                  >
                    <div className="flex gap-3">
                      <div className="h-16 w-16 animate-pulse rounded-lg bg-slate-200" />

                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200" />
                        <div className="h-3 w-full animate-pulse rounded bg-slate-100" />
                        <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-2">
                      <div className="h-5 w-16 animate-pulse rounded-full bg-slate-200" />
                      <div className="h-8 w-20 animate-pulse rounded-lg bg-slate-200" />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="flex min-h-65 flex-col items-center justify-center rounded-xl border border-slate-200 bg-white">
          <div className="rounded-full bg-slate-100 p-3">
            <UtensilsCrossed className="h-7 w-7 text-slate-400" />
          </div>
          <p className="mt-3 text-sm font-medium text-slate-800">
            {searchTerm
              ? "Không có món phù hợp từ khóa"
              : "Nhà hàng chưa có dữ liệu menu"}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {searchTerm
              ? "Thử đổi từ khóa để xem thêm món"
              : "Bạn có thể tạo menu ở trang Menu Template trước"}
          </p>
          <button
            onClick={onSyncDishes}
            className="mt-3 rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
          >
            Đồng bộ món ăn
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCategories.map((category) => (
            <section
              key={category.categoryId}
              className="rounded-xl border border-slate-200 bg-white p-4"
            >
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <h2 className="text-base font-semibold text-slate-900">
                    {category.categoryName}
                  </h2>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                    {category.dishes.length} món
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (!restaurant?.id) return;
                      setPendingToggleAction({
                        type: "category",
                        restaurantId: restaurant.id,
                        categoryId: category.categoryId,
                        targetName: `toàn bộ danh mục ${category.categoryName}`,
                        nextIsSelling: true,
                      });
                    }}
                    disabled={togglingCategoryIds.has(category.categoryId) || !restaurant?.id}
                    className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {togglingCategoryIds.has(category.categoryId) ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Unlock className="h-3.5 w-3.5" />}
                    Mở tất cả
                  </button>
                  <button
                    onClick={() => {
                      if (!restaurant?.id) return;
                      setPendingToggleAction({
                        type: "category",
                        restaurantId: restaurant.id,
                        categoryId: category.categoryId,
                        targetName: `toàn bộ danh mục ${category.categoryName}`,
                        nextIsSelling: false,
                      });
                    }}
                    disabled={togglingCategoryIds.has(category.categoryId) || !restaurant?.id}
                    className="inline-flex items-center gap-1 rounded-lg bg-rose-50 px-2.5 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {togglingCategoryIds.has(category.categoryId) ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Lock className="h-3.5 w-3.5" />}
                    Tắt tất cả
                  </button>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {category.dishes.map((dish) => {
                  const isToggling = togglingDishIds.has(dish.dishId);
                  const isLocked = !dish.isSelling;

                  return (
                    <div
                      key={dish.dishId}
                      className="rounded-lg border border-slate-200 p-3"
                    >
                      <div className="flex gap-3">
                        {dish.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={dish.imageUrl}
                            alt={dish.dishName}
                            className="h-16 w-16 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-slate-100 text-xs text-slate-500">
                            Không có ảnh
                          </div>
                        )}

                        <div className="min-w-0 flex-1">
                          <h3 className="truncate text-sm font-semibold text-slate-900">
                            {dish.dishName}
                          </h3>
                          <p className="mt-0.5 text-xs text-slate-500 line-clamp-2">
                            {dish.description}
                          </p>
                          <p className="mt-1 text-sm font-semibold text-slate-900">
                            {formatPrice(dish.price)}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between gap-2">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                            isLocked
                              ? "bg-rose-50 text-rose-700"
                              : "bg-emerald-50 text-emerald-700"
                          }`}
                        >
                          {isLocked ? "Ngừng bán" : "Mở bán"}
                        </span>

                        <button
                          onClick={() => {
                            if (!restaurant?.id) {
                              return;
                            }

                            setPendingToggleAction({
                              type: "dish",
                              restaurantId: restaurant.id,
                              dishId: dish.dishId,
                              targetName: `món ${dish.dishName}`,
                              nextIsSelling: isLocked,
                            });
                          }}
                          disabled={isToggling || !restaurant?.id}
                          className={`cursor-pointer inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                            isLocked
                              ? "bg-emerald-600 text-white hover:bg-emerald-700"
                              : "bg-rose-600 text-white hover:bg-rose-700"
                          } disabled:cursor-not-allowed disabled:opacity-60`}
                        >
                          {isToggling ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : isLocked ? (
                            <Unlock className="h-3.5 w-3.5" />
                          ) : (
                            <Lock className="h-3.5 w-3.5" />
                          )}
                          {isLocked ? "Mở bán" : "Ngừng bán"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}

      <ConfirmActionPopup
        isOpen={Boolean(pendingToggleAction)}
        title="Xác nhận thao tác"
        message={
          pendingToggleAction
            ? `Bạn có chắc muốn ${pendingToggleAction.nextIsSelling ? "mở bán" : "ngừng bán"} ${pendingToggleAction.targetName}?`
            : "Bạn có chắc muốn thực hiện hành động này không?"
        }
        confirmText={
          pendingToggleAction?.nextIsSelling ? "Mở bán" : "Ngừng bán"
        }
        cancelText="Hủy"
        confirmVariant={
          pendingToggleAction?.nextIsSelling ? "default" : "danger"
        }
        isLoading={confirmLoading}
        onClose={() => setPendingToggleAction(null)}
        onConfirm={handleConfirmToggle}
      />
    </div>
  );
}
