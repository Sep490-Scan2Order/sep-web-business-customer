import React, { useEffect, useRef, useState } from "react";
import {
  DiscountType,
  DishesDto,
  PromotionDaysOfWeek,
  PromotionDto,
  PromotionScope,
  PROMOTION_PRIORITY_DEFAULTS,
  PromotionType,
  PromotionUpsertPayload,
  Restaurant,
} from "@/src/types/type";
import { Loader2, Plus, Search, X } from "lucide-react";

interface PromotionPopUpProps {
  onClose: () => void;
  onSubmit: (promotionData: PromotionUpsertPayload) => void;
  onUpdate: (promotionId: number, promotionData: PromotionUpsertPayload) => void;
  isLoading?: boolean;
  dishes?: DishesDto[];
  restaurants?: Restaurant[];
  promotionData?: PromotionDto | null;
}

const DAY_OPTIONS: Array<{ label: string; value: PromotionDaysOfWeek }> = [
  { label: "Hai", value: PromotionDaysOfWeek.Monday },
  { label: "Ba", value: PromotionDaysOfWeek.Tuesday },
  { label: "Tư", value: PromotionDaysOfWeek.Wednesday },
  { label: "Năm", value: PromotionDaysOfWeek.Thursday },
  { label: "Sáu", value: PromotionDaysOfWeek.Friday },
  { label: "Bảy", value: PromotionDaysOfWeek.Saturday },
  { label: "CN", value: PromotionDaysOfWeek.Sunday },
];

const toInputDate = (value?: string | null) => {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";

  const local = new Date(parsed.getTime() - parsed.getTimezoneOffset() * 60 * 1000);
  return local.toISOString().slice(0, 10);
};

const toInputTime = (value?: string | null) => {
  if (!value) return "";
  if (value.length >= 5 && value.includes(":")) return value.slice(0, 5);
  return "";
};

const toTimeWithSeconds = (timeValue: string) => {
  if (!timeValue) return null;
  if (timeValue.length === 5) return `${timeValue}:00`;
  return timeValue;
};

const toStartIso = (dateValue: string) => {
  if (!dateValue) return null;
  return new Date(`${dateValue}T00:00:00`).toISOString();
};

const toEndIso = (dateValue: string) => {
  if (!dateValue) return null;
  return new Date(`${dateValue}T23:59:59`).toISOString();
};

export default function PromotionPopUp({
  onClose,
  onSubmit,
  onUpdate,
  isLoading,
  dishes = [],
  restaurants = [],
  promotionData = null,
}: PromotionPopUpProps) {
  const initialType = (Number(promotionData?.type) as PromotionType) || PromotionType.Standard;
  const initialDiscountType =
    Number(promotionData?.discountType) === DiscountType.Percentage
      ? DiscountType.Percentage
      : DiscountType.FixedAmount;
  const initialScope = (Number(promotionData?.scope) as PromotionScope) || PromotionScope.Dish;

  const [name, setName] = useState(promotionData?.name ?? "");
  const [type, setType] = useState<PromotionType>(initialType);
  const [discountType, setDiscountType] = useState<DiscountType>(
    promotionData ? initialDiscountType : DiscountType.Percentage,
  );
  const [discountValue, setDiscountValue] = useState<string>(
    promotionData?.discountValue !== undefined ? String(promotionData.discountValue) : "",
  );
  const [maxDiscountValue, setMaxDiscountValue] = useState<string>(
    String(promotionData?.maxDiscountValue ?? 0),
  );
  const [minOrderValue, setMinOrderValue] = useState<string>(String(promotionData?.minOrderValue ?? 0));
  const [startDate, setStartDate] = useState(toInputDate(promotionData?.startDate));
  const [endDate, setEndDate] = useState(toInputDate(promotionData?.endDate));
  const [dailyStartTime, setDailyStartTime] = useState(toInputTime(promotionData?.dailyStartTime));
  const [dailyEndTime, setDailyEndTime] = useState(toInputTime(promotionData?.dailyEndTime));
  const [daysOfWeek, setDaysOfWeek] = useState<number>(Number(promotionData?.daysOfWeek) || PromotionDaysOfWeek.None);
  const [isActive, setIsActive] = useState<boolean>(Boolean(promotionData?.isActive ?? true));
  const [isGlobal, setIsGlobal] = useState(Boolean(promotionData?.isGlobal ?? true));
  const [scope, setScope] = useState<PromotionScope>(promotionData ? initialScope : PromotionScope.Dish);
  const [priority, setPriority] = useState<number>(
    Number(promotionData?.priority) || PROMOTION_PRIORITY_DEFAULTS[initialType],
  );
  const [isPriorityManuallySet, setIsPriorityManuallySet] = useState(Boolean(promotionData));
  const [selectedDishIds, setSelectedDishIds] = useState<number[]>(promotionData?.dishIds ?? []);
  const [selectedRestaurantIds, setSelectedRestaurantIds] = useState<number[]>(promotionData?.restaurantIds ?? []);
  const [dishSearchQuery, setDishSearchQuery] = useState("");
  const [restaurantSearchQuery, setRestaurantSearchQuery] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleTypeChange = (nextType: PromotionType) => {
    setType(nextType);
    if (!isPriorityManuallySet) {
      setPriority(PROMOTION_PRIORITY_DEFAULTS[nextType]);
    }

    if (nextType !== PromotionType.HappyHour && nextType !== PromotionType.WeeklySpecial) {
      setDailyStartTime("");
      setDailyEndTime("");
    }

    if (nextType !== PromotionType.WeeklySpecial) {
      setDaysOfWeek(PromotionDaysOfWeek.None);
    }
  };

  const handleScopeChange = (nextScope: PromotionScope) => {
    setScope(nextScope);
    if (nextScope === PromotionScope.Order) {
      setSelectedDishIds([]);
    }
  };

  const toggleDish = (dishId: number) => {
    setSelectedDishIds((prev) =>
      prev.includes(dishId) ? prev.filter((id) => id !== dishId) : [...prev, dishId],
    );
  };

  const toggleRestaurant = (restaurantId: number) => {
    setSelectedRestaurantIds((prev) =>
      prev.includes(restaurantId)
        ? prev.filter((id) => id !== restaurantId)
        : [...prev, restaurantId],
    );
  };

  const toggleDay = (dayValue: PromotionDaysOfWeek) => {
    setDaysOfWeek((prev) => {
      const isEnabled = (prev & dayValue) !== 0;
      return isEnabled ? prev & ~dayValue : prev | dayValue;
    });
  };

  const isDaySelected = (dayValue: PromotionDaysOfWeek) => (daysOfWeek & dayValue) !== 0;

  const isDateRequired =
    type === PromotionType.Standard ||
    type === PromotionType.Clearance ||
    type === PromotionType.WeeklySpecial;

  const hasDateRange = Boolean(startDate && endDate);
  const isDateRangeValid = hasDateRange ? new Date(startDate).getTime() < new Date(endDate).getTime() : true;
  const isOptionalDatePairValid =
    type !== PromotionType.HappyHour ||
    (startDate.length === 0 && endDate.length === 0) ||
    hasDateRange;

  const isDailyRangeRequired = type === PromotionType.HappyHour;
  const hasDailyRange = Boolean(dailyStartTime && dailyEndTime);
  const isDailyRangeValid = hasDailyRange ? dailyStartTime < dailyEndTime : true;
  const isOptionalDailyPairValid =
    type !== PromotionType.WeeklySpecial ||
    (dailyStartTime.length === 0 && dailyEndTime.length === 0) ||
    hasDailyRange;

  const isWeeklyDaysValid = type !== PromotionType.WeeklySpecial || daysOfWeek > 0;
  const isOrderScope = scope === PromotionScope.Order;
  const isRestaurantSelectionValid = isGlobal || selectedRestaurantIds.length > 0;
  const isDishSelectionValid = scope !== PromotionScope.Dish || isGlobal || selectedDishIds.length > 0;
  const isPercentage = discountType === DiscountType.Percentage;
  const discountValueNumber = Number(discountValue);
  const isDiscountValueValid = isPercentage
    ? discountValueNumber > 0 && discountValueNumber <= 100
    : discountValueNumber > 0;
  const isMaxDiscountValid = !isPercentage || Number(maxDiscountValue) >= 1000;
  const isMinOrderValueValid = !isOrderScope || Number(minOrderValue) > 0;

  const dishKeyword = dishSearchQuery.trim().toLowerCase();
  const restaurantKeyword = restaurantSearchQuery.trim().toLowerCase();

  const filteredDishes = dishes.filter((dish) =>
    (dish.dishName ?? "").toLowerCase().includes(dishKeyword),
  );

  const filteredRestaurants = restaurants.filter((restaurant) =>
    (restaurant.restaurantName ?? "").toLowerCase().includes(restaurantKeyword),
  );

  const isFormValid =
    name.trim().length > 0 &&
    isDiscountValueValid &&
    (!isDateRequired || hasDateRange) &&
    isOptionalDatePairValid &&
    isDateRangeValid &&
    (!isDailyRangeRequired || hasDailyRange) &&
    isOptionalDailyPairValid &&
    isDailyRangeValid &&
    isWeeklyDaysValid &&
    isRestaurantSelectionValid &&
    isDishSelectionValid &&
    isMaxDiscountValid &&
    isMinOrderValueValid;

  const handleSubmit = () => {
    if (!isFormValid) return;

    const payload: PromotionUpsertPayload = {
      name: name.trim(),
      type,
      discountType,
      discountValue: Number(discountValue),
      maxDiscountValue: isPercentage ? Number(maxDiscountValue) || 1000 : 0,
      minOrderValue: isOrderScope ? Number(minOrderValue) || 0 : 0,
      startDate: startDate ? toStartIso(startDate) : null,
      endDate: endDate ? toEndIso(endDate) : null,
      dailyStartTime:
        type === PromotionType.HappyHour || (type === PromotionType.WeeklySpecial && hasDailyRange)
          ? toTimeWithSeconds(dailyStartTime)
          : null,
      dailyEndTime:
        type === PromotionType.HappyHour || (type === PromotionType.WeeklySpecial && hasDailyRange)
          ? toTimeWithSeconds(dailyEndTime)
          : null,
      daysOfWeek: type === PromotionType.WeeklySpecial ? daysOfWeek : 0,
      isGlobal,
      isActive,
      priority,
      scope,
      dishIds:
        scope === PromotionScope.Dish && !isGlobal
          ? (selectedDishIds.length > 0 ? selectedDishIds : null)
          : null,
      restaurantIds: !isGlobal ? selectedRestaurantIds : null,
    };

    if (promotionData?.id) {
      onUpdate(promotionData.id, { ...payload, id: promotionData.id });
      return;
    }

    onSubmit(payload);
    console.log("Submitted promotion data:", payload);
  };

  const handleGlobalChange = (checked: boolean) => {
    setIsGlobal(checked);
    if (checked) {
      setSelectedRestaurantIds([]);
      setSelectedDishIds([]);
      setDishSearchQuery("");
      setRestaurantSearchQuery("");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl my-8 rounded-xl border border-slate-200 bg-white shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {promotionData ? "Cập nhật khuyến mãi" : "Tạo khuyến mãi mới"}
            </h2>
            <p className="text-sm text-slate-500">Thiết lập theo loại khuyến mãi và phạm vi áp dụng</p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            disabled={isLoading}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[65vh] overflow-y-auto p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Tên khuyến mãi <span className="text-red-500">*</span>
              </label>
              <input
                ref={inputRef}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-300 focus:bg-white"
                placeholder="Nhập tên khuyến mãi"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Loại khuyến mãi</label>
              <select
                value={type}
                onChange={(e) => handleTypeChange(Number(e.target.value) as PromotionType)}
                disabled={isLoading}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-300 focus:bg-white"
              >
                <option value={PromotionType.Standard}>Khuyến mãi thường</option>
                <option value={PromotionType.HappyHour}>Giờ vàng</option>
                <option value={PromotionType.Clearance}>Xả hàng</option>
                <option value={PromotionType.WeeklySpecial}>Ngày trong tuần</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Kiểu giảm giá</label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(Number(e.target.value) as DiscountType)}
                disabled={isLoading}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-300 focus:bg-white"
              >
                <option value={DiscountType.Percentage}>Phần trăm (%)</option>
                <option value={DiscountType.FixedAmount}>Số tiền cố định (đ)</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Giá trị giảm <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                max={isPercentage ? 100 : undefined}
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                disabled={isLoading}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-300 focus:bg-white"
                placeholder={isPercentage ? "Nhập 1-100 (%)" : "Nhập giá trị giảm"}
              />
            </div>

            {isPercentage && (
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Giảm tối đa (đ)</label>
                <input
                  type="number"
                  min="1000"
                  value={maxDiscountValue}
                  onChange={(e) => setMaxDiscountValue(e.target.value)}
                  disabled={isLoading}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-300 focus:bg-white"
                />
              </div>
            )}

            {isOrderScope && (
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Giá trị đơn tối thiểu</label>
                <input
                  type="number"
                  min="1000"
                  value={minOrderValue}
                  onChange={(e) => setMinOrderValue(e.target.value)}
                  disabled={isLoading}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-300 focus:bg-white"
                />
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Ngày bắt đầu {isDateRequired && <span className="text-red-500">*</span>}
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                disabled={isLoading}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-300 focus:bg-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Ngày kết thúc {isDateRequired && <span className="text-red-500">*</span>}
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                disabled={isLoading}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-300 focus:bg-white"
              />
            </div>

            {(type === PromotionType.HappyHour || type === PromotionType.WeeklySpecial) && (
              <>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Giờ bắt đầu {type === PromotionType.HappyHour && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="time"
                    value={dailyStartTime}
                    onChange={(e) => setDailyStartTime(e.target.value)}
                    disabled={isLoading}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-300 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Giờ kết thúc {type === PromotionType.HappyHour && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="time"
                    value={dailyEndTime}
                    onChange={(e) => setDailyEndTime(e.target.value)}
                    disabled={isLoading}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-300 focus:bg-white"
                  />
                </div>
              </>
            )}

            {type === PromotionType.WeeklySpecial && (
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Áp dụng thứ <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {DAY_OPTIONS.map((day) => {
                    const selected = isDaySelected(day.value);
                    return (
                      <button
                        key={day.value}
                        type="button"
                        onClick={() => toggleDay(day.value)}
                        disabled={isLoading}
                        className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                          selected
                            ? "border-slate-900 bg-slate-900 text-white"
                            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        {day.label}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-2 text-xs text-slate-500">Giá trị bitmask hiện tại: {daysOfWeek}</p>
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Phạm vi áp dụng</label>
              <select
                value={scope}
                onChange={(e) => {
                  const nextScope = Number(e.target.value) as PromotionScope;
                  handleScopeChange(nextScope);
                  if (nextScope !== PromotionScope.Order) {
                    setMinOrderValue("0");
                  }
                }}
                disabled={isLoading}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-300 focus:bg-white"
              >
                <option value={PromotionScope.Dish}>Theo món</option>
                <option value={PromotionScope.Order}>Theo đơn hàng</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Độ ưu tiên</label>
              <input
                type="number"
                min="0"
                value={priority}
                onChange={(e) => {
                  setPriority(Number(e.target.value) || 0);
                  setIsPriorityManuallySet(true);
                }}
                disabled={isLoading}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-300 focus:bg-white"
              />
              <p className="mt-1 text-xs text-slate-500">
                Mặc định theo loại: {PROMOTION_PRIORITY_DEFAULTS[type]}
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                checked={isGlobal}
                onChange={(e) => handleGlobalChange(e.target.checked)}
                disabled={isLoading}
                className="rounded border-slate-300"
              />
              Áp dụng toàn cục
            </label>
            <p className="mt-1 text-xs text-slate-500">
              Khi bật, khuyến mãi sẽ áp dụng cho toàn bộ chi nhánh và món ăn.
            </p>
          </div>

          {promotionData && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  disabled={isLoading}
                  className="rounded border-slate-300"
                />
                Bật khuyến mãi
              </label>
              <p className="mt-1 text-xs text-slate-500">
                {isActive
                  ? "Khuyến mãi đang hoạt động và có thể áp dụng nếu thỏa điều kiện thời gian."
                  : "Khuyến mãi đang tắt và sẽ không được áp dụng cho đơn hàng."}
              </p>
            </div>
          )}

          {!isGlobal && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {scope === PromotionScope.Dish && (
                <div className="rounded-xl border border-slate-200 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="text-sm font-medium text-slate-700">Chọn món áp dụng</div>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                      Đã chọn: {selectedDishIds.length}
                    </span>
                  </div>

                  <div className="relative mb-3">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={dishSearchQuery}
                      onChange={(e) => setDishSearchQuery(e.target.value)}
                      placeholder="Tìm món..."
                      disabled={isLoading}
                      className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-3 text-sm text-slate-900 outline-none focus:border-slate-300"
                    />
                  </div>

                  {dishes.length > 0 ? (
                    <div className="max-h-52 overflow-y-auto pr-1">
                      {filteredDishes.length > 0 ? (
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                          {filteredDishes.map((dish) => {
                            const isSelected = selectedDishIds.includes(dish.id);
                            return (
                              <button
                                key={dish.id}
                                type="button"
                                onClick={() => toggleDish(dish.id)}
                                disabled={isLoading}
                                className={`rounded-xl border px-3 py-2 text-left text-sm transition-colors ${
                                  isSelected
                                    ? "border-slate-900 bg-slate-900 text-white"
                                    : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-white"
                                }`}
                              >
                                <div className="line-clamp-2 font-medium">{dish.dishName}</div>
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-4 text-center text-xs text-slate-500">
                          Không tìm thấy món phù hợp.
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500">Chưa có dữ liệu món để chọn.</p>
                  )}
                </div>
              )}

              <div className="rounded-xl border border-slate-200 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div className="text-sm font-medium text-slate-700">Chọn chi nhánh áp dụng</div>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                    Đã chọn: {selectedRestaurantIds.length}
                  </span>
                </div>

                <div className="relative mb-3">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={restaurantSearchQuery}
                    onChange={(e) => setRestaurantSearchQuery(e.target.value)}
                    placeholder="Tìm chi nhánh..."
                    disabled={isLoading}
                    className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-3 text-sm text-slate-900 outline-none focus:border-slate-300"
                  />
                </div>

                {restaurants.length > 0 ? (
                  <div className="max-h-52 overflow-y-auto pr-1">
                    {filteredRestaurants.length > 0 ? (
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {filteredRestaurants.map((restaurant) => {
                          const isSelected = selectedRestaurantIds.includes(restaurant.id);
                          return (
                            <button
                              key={restaurant.id}
                              type="button"
                              onClick={() => toggleRestaurant(restaurant.id)}
                              disabled={isLoading}
                              className={`rounded-xl border px-3 py-2 text-left text-sm transition-colors ${
                                isSelected
                                  ? "border-slate-900 bg-slate-900 text-white"
                                  : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-white"
                              }`}
                            >
                              <div className="line-clamp-2 font-medium">{restaurant.restaurantName}</div>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-4 text-center text-xs text-slate-500">
                        Không tìm thấy chi nhánh phù hợp.
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">Chưa có dữ liệu nhà hàng để chọn.</p>
                )}
              </div>
            </div>
          )}

          {!isDateRangeValid && (
            <p className="text-xs font-medium text-red-600">Ngày bắt đầu phải nhỏ hơn ngày kết thúc.</p>
          )}
          {!isOptionalDatePairValid && (
            <p className="text-xs font-medium text-red-600">Giờ vàng: vui lòng nhập đủ Từ ngày và Đến ngày, hoặc để trống cả hai.</p>
          )}
          {!isDailyRangeValid && (
            <p className="text-xs font-medium text-red-600">Giờ bắt đầu phải nhỏ hơn giờ kết thúc.</p>
          )}
          {!isOptionalDailyPairValid && (
            <p className="text-xs font-medium text-red-600">Khung giờ tùy chọn cần nhập đủ cả giờ bắt đầu và giờ kết thúc.</p>
          )}
          {!isRestaurantSelectionValid && (
            <p className="text-xs font-medium text-red-600">Khi tắt áp dụng toàn cục, vui lòng chọn ít nhất 1 chi nhánh.</p>
          )}
          {!isDishSelectionValid && (
            <p className="text-xs font-medium text-red-600">Phạm vi theo món yêu cầu chọn ít nhất 1 món khi tắt áp dụng toàn cục.</p>
          )}
          {!isWeeklyDaysValid && (
            <p className="text-xs font-medium text-red-600">Ngày đặc biệt tuần yêu cầu chọn ít nhất 1 ngày trong tuần.</p>
          )}
          {!isMaxDiscountValid && (
            <p className="text-xs font-medium text-red-600">
              Khi chọn giảm theo %, vui lòng nhập Giảm tối đa từ 1.000đ trở lên.
            </p>
          )}
          {!isMinOrderValueValid && (
            <p className="text-xs font-medium text-red-600">
              Phạm vi theo đơn hàng yêu cầu giá trị đơn tối thiểu lớn hơn 1.000.
            </p>
          )}
          {!isDiscountValueValid && (
            <p className="text-xs font-medium text-red-600">
              Giảm theo % chỉ hợp lệ trong khoảng từ 1 đến 100.
            </p>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-slate-200 px-6 py-4">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Hủy bỏ
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading || !isFormValid}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                {promotionData ? "Cập nhật" : "Tạo mới"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
