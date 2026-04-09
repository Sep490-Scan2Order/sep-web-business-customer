import React, { useMemo } from "react";
import {
  DishesDto,
  DiscountType,
  PromotionDaysOfWeek,
  PromotionDto,
  PromotionScope,
  PromotionType,
  Restaurant,
} from "@/src/types/type";
import { CalendarDays, Store, Tag, UtensilsCrossed, X } from "lucide-react";

interface PromotionDetailPopUpProps {
  promotion: PromotionDto;
  dishes?: DishesDto[];
  restaurants?: Restaurant[];
  onClose: () => void;
}

const PROMOTION_TYPE_LABELS: Record<number, string> = {
  [PromotionType.Standard]: "Khuyến mãi thường",
  [PromotionType.HappyHour]: "Giờ vàng",
  [PromotionType.Clearance]: "Xả hàng",
  [PromotionType.WeeklySpecial]: "Ngày đặc biệt tuần",
};

const PROMOTION_SCOPE_LABELS: Record<number, string> = {
  [PromotionScope.Dish]: "Theo món",
  [PromotionScope.Order]: "Theo hóa đơn",
};

const DAY_OPTIONS: Array<{ label: string; value: PromotionDaysOfWeek }> = [
  { label: "Chủ nhật", value: PromotionDaysOfWeek.Sunday },
  { label: "Thứ 2", value: PromotionDaysOfWeek.Monday },
  { label: "Thứ 3", value: PromotionDaysOfWeek.Tuesday },
  { label: "Thứ 4", value: PromotionDaysOfWeek.Wednesday },
  { label: "Thứ 5", value: PromotionDaysOfWeek.Thursday },
  { label: "Thứ 6", value: PromotionDaysOfWeek.Friday },
  { label: "Thứ 7", value: PromotionDaysOfWeek.Saturday },
];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
};

const formatDate = (value: string) => {
  if (!value) return "Không có";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Không có";
  return date.toLocaleDateString("vi-VN");
};

const getDiscountTypeLabel = (discountType: number) => {
  if (discountType === DiscountType.Percentage) return "Theo %";
  if (discountType === DiscountType.FixedAmount) return "Theo tiền";
  return `Loại ${discountType}`;
};

const getDiscountValueLabel = (promotion: PromotionDto) => {
  if (promotion.discountType === DiscountType.Percentage) {
    return `${promotion.discountValue}%`;
  }
  return formatCurrency(promotion.discountValue);
};

const getAppliedDayLabels = (promotion: PromotionDto) => {
  if (promotion.type !== PromotionType.WeeklySpecial || promotion.daysOfWeek <= 0) {
    return [];
  }

  return DAY_OPTIONS.filter((day) => (promotion.daysOfWeek & day.value) !== 0).map((day) => day.label);
};

export default function PromotionDetailPopUp({
  promotion,
  dishes = [],
  restaurants = [],
  onClose,
}: PromotionDetailPopUpProps) {
  const selectedDishes = useMemo(() => {
    if (promotion.scope !== PromotionScope.Dish) return [];
    if (promotion.isGlobal) return dishes;
    if (!promotion.dishIds?.length) return [];

    const dishMap = new Map(dishes.map((dish) => [dish.id, dish]));
    return promotion.dishIds.map((dishId) => dishMap.get(dishId)).filter(Boolean) as DishesDto[];
  }, [promotion, dishes]);

  const selectedRestaurants = useMemo(() => {
    if (promotion.isGlobal) return restaurants;
    if (!promotion.restaurantIds?.length) return [];

    const restaurantMap = new Map(restaurants.map((restaurant) => [restaurant.id, restaurant]));
    return promotion.restaurantIds
      .map((restaurantId) => restaurantMap.get(restaurantId))
      .filter(Boolean) as Restaurant[];
  }, [promotion, restaurants]);

  const missingDishCount = useMemo(() => {
    if (promotion.scope !== PromotionScope.Dish || promotion.isGlobal) return 0;
    const selectedDishIdSet = new Set(selectedDishes.map((dish) => dish.id));
    return (promotion.dishIds ?? []).filter((dishId) => !selectedDishIdSet.has(dishId)).length;
  }, [promotion, selectedDishes]);

  const missingRestaurantCount = useMemo(() => {
    if (promotion.isGlobal) return 0;
    const selectedRestaurantIdSet = new Set(selectedRestaurants.map((restaurant) => restaurant.id));
    return (promotion.restaurantIds ?? []).filter((restaurantId) => !selectedRestaurantIdSet.has(restaurantId)).length;
  }, [promotion, selectedRestaurants]);

  const appliedDays = getAppliedDayLabels(promotion);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl rounded-xl border border-slate-200 bg-white shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Chi tiết khuyến mãi</h2>
            <p className="text-sm text-slate-500">{promotion.name}</p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[70vh] space-y-5 overflow-y-auto p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Tag className="h-4 w-4" />
                Thông tin giảm giá
              </div>
              <div className="space-y-1 text-sm text-slate-600">
                <div>Loại: {PROMOTION_TYPE_LABELS[promotion.type] ?? `Loại ${promotion.type}`}</div>
                <div>Phạm vi: {PROMOTION_SCOPE_LABELS[promotion.scope] ?? `Phạm vi ${promotion.scope}`}</div>
                <div>Giảm: {getDiscountValueLabel(promotion)} ({getDiscountTypeLabel(promotion.discountType)})</div>
                <div>Đơn tối thiểu: {formatCurrency(promotion.minOrderValue)}</div>
                {promotion.maxDiscountValue > 0 && <div>Giảm tối đa: {formatCurrency(promotion.maxDiscountValue)}</div>}
                <div>Ưu tiên: {promotion.priority}</div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <CalendarDays className="h-4 w-4" />
                Thời gian áp dụng
              </div>
              <div className="space-y-1 text-sm text-slate-600">
                <div>Từ ngày: {formatDate(promotion.startDate)}</div>
                <div>Đến ngày: {formatDate(promotion.endDate)}</div>
                {promotion.dailyStartTime && promotion.dailyEndTime && (
                  <div>Khung giờ: {promotion.dailyStartTime} - {promotion.dailyEndTime}</div>
                )}
                {appliedDays.length > 0 && <div>Ngày áp dụng: {appliedDays.join(", ")}</div>}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
              <UtensilsCrossed className="h-4 w-4" />
              Món được giảm giá
            </div>

            {promotion.scope !== PromotionScope.Dish ? (
              <p className="text-sm text-slate-500">Khuyến mãi này áp dụng theo hóa đơn, không chọn theo từng món.</p>
            ) : promotion.isGlobal ? (
              <p className="text-sm text-slate-500">Áp dụng cho tất cả món của khách hàng ({selectedDishes.length} món).</p>
            ) : selectedDishes.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {selectedDishes.map((dish) => (
                  <span
                    key={dish.id}
                    className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700"
                  >
                    {dish.dishName}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">Không có món nào được gắn trong khuyến mãi này.</p>
            )}

            {missingDishCount > 0 && (
              <p className="mt-2 text-xs text-amber-600">Có {missingDishCount} món không còn tồn tại hoặc chưa tải được dữ liệu.</p>
            )}
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Store className="h-4 w-4" />
              Nhà hàng áp dụng
            </div>

            {promotion.isGlobal ? (
              <p className="text-sm text-slate-500">Áp dụng cho tất cả nhà hàng của khách hàng ({selectedRestaurants.length} nhà hàng).</p>
            ) : selectedRestaurants.length > 0 ? (
              <div className="space-y-2">
                {selectedRestaurants.map((restaurant) => (
                  <div
                    key={restaurant.id}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                  >
                    <div className="font-medium text-slate-800">{restaurant.restaurantName}</div>
                    {restaurant.address && <div className="text-xs text-slate-500">{restaurant.address}</div>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">Không có nhà hàng nào được gắn trong khuyến mãi này.</p>
            )}

            {missingRestaurantCount > 0 && (
              <p className="mt-2 text-xs text-amber-600">Có {missingRestaurantCount} nhà hàng không còn tồn tại hoặc chưa tải được dữ liệu.</p>
            )}
          </div>
        </div>

        <div className="flex justify-end border-t border-slate-200 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
