"use client";
import { useState, useEffect } from "react";
import { API } from "@/src/constants/api";
import apiClient from "@/src/services/apiClient";
import { toast } from "react-toastify";
import PlanPopUpConfirm from "@/src/components/ui/tenant/PlanPopUpConfirm";
import { PlanApiItem, SubscriptionTenantInfo } from "@/src/types/type";
import PlanPopUpInfo from "@/src/components/ui/tenant/PlanPopUpInfo";
import { ArrowUpDown, Check, Plus, Search, SlidersHorizontal, X } from "lucide-react";
import { useAuthStore } from "@/src/store/authStore";
import { getApiErrorMessage } from "@/src/utils/utils";

export default function PlanPage() {
  const { user, refreshUserInfo } = useAuthStore();
  const [activePlans, setActivePlans] = useState<PlanApiItem[]>([]);
  const [subscriptionTenantInfo, setSubscriptionTenantInfo] = useState<
    SubscriptionTenantInfo[]
  >([]);
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);
  const [isActivatingTrial, setIsActivatingTrial] = useState<boolean>(false);
  const [showTrialModal, setShowTrialModal] = useState(false);
  const [trialTargetRestaurantId, setTrialTargetRestaurantId] = useState<number | null>(null);

  // State cho Modal
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // State quản lý thao tác (Đơn lẻ hoặc Hàng loạt)
  const [targetRestaurants, setTargetRestaurants] = useState<
    SubscriptionTenantInfo[]
  >([]);
  const [selectedPlan, setSelectedPlan] = useState<PlanApiItem | null>(null);
  const [planId, setPlanId] = useState<number | null>(null);
  const [planChangeMode, setPlanChangeMode] = useState<
    "UPGRADE" | "DOWNGRADE" | "CHANGE"
  >("CHANGE");

  // State cho Filter & Checkbox
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");

  // Tải Dữ liệu ban đầu
  const fetchSubscriptions = async () => {
    try {
      const [subRes, planRes] = await Promise.all([
        apiClient.get(API.SUBSCRIPTION.GET_SUBSCRIPTION_BY_TENANT),
        apiClient.get(API.PLAN.GETALL),
      ]);
      if (subRes.data.isSuccess) setSubscriptionTenantInfo(subRes.data.data);
      if (planRes.data.isSuccess) setActivePlans(planRes.data.data);
    } catch {
      toast.error("Không thể tải thông tin hệ thống");
    }
  };

  useEffect(() => {
    const init = async () => {
      setIsInitialLoading(true);
      await fetchSubscriptions();
      setIsInitialLoading(false);
    };
    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filter
  const filterSubscriptionInfo = subscriptionTenantInfo.filter(
    (info) =>
      info.restaurantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      info.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (info.currentPlanName &&
        info.currentPlanName.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  // Checkbox logic
  const handleRestaurantInfoCheckboxChange = (
    restaurantId: number,
    checked: boolean,
  ) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (checked) newSet.add(restaurantId);
      else newSet.delete(restaurantId);
      return newSet;
    });
  };

  const checkAllCheckBox = (checked: boolean) => {
    if (checked) {
      setSelectedIds(
        new Set(filterSubscriptionInfo.map((info) => info.restaurantId)),
      );
    } else {
      setSelectedIds(new Set());
    }
  };

  const isAllSelected =
    filterSubscriptionInfo.length > 0 &&
    filterSubscriptionInfo.every((info) => selectedIds.has(info.restaurantId));
  const isSomeSelected =
    filterSubscriptionInfo.some((info) => selectedIds.has(info.restaurantId)) &&
    !isAllSelected;

  // Xử lý Logic Mua/Nâng cấp/Hạ cấp (Cần chọn Plan)
  const handleActionChangePlan = (
    restaurants: SubscriptionTenantInfo[],
    mode: "UPGRADE" | "DOWNGRADE" | "CHANGE" = "CHANGE",
  ) => {
    const currentPlanIds = Array.from(
      new Set(
        restaurants
          .map((restaurant) => restaurant.currentPlanId)
          .filter((id) => id > 0),
      ),
    );

    setPlanChangeMode(mode);
    setPlanId(currentPlanIds.length === 1 ? currentPlanIds[0] : null);
    setTargetRestaurants(restaurants);
    setShowInfoModal(true); // Mở modal chọn gói
  };

  // Xử lý Logic Gia hạn (Bỏ qua chọn Plan, đi thẳng tới Confirm)
  const handleActionRenew = (restaurants: SubscriptionTenantInfo[]) => {
    const invalid = restaurants.some((r) => !r.currentPlanId);
    if (invalid) {
      toast.error(
        "Một số nhà hàng chưa có gói để gia hạn. Vui lòng kiểm tra lại.",
      );
      return;
    }

    // Nếu gia hạn 1 nhà hàng, lấy tên gói để hiển thị. Nếu nhiều nhà hàng, set null để Modal tự hiểu là "Nhiều gói"
    if (restaurants.length === 1) {
      const plan =
        activePlans.find((p) => p.id === restaurants[0].currentPlanId) || null;
      setSelectedPlan(plan);
    } else {
      setSelectedPlan(null);
    }

    setTargetRestaurants(restaurants);
    setShowConfirmModal(true);
  };

  // Bắt sự kiện khi chọn xong Gói (từ Info Modal) chuyển qua Confirm Modal
  const handleSelectPlanSubmit = (planId: number) => {
    const selected = activePlans.find((plan) => plan.id === planId) || null;
    setSelectedPlan(selected);
    setPlanId(null);
    setShowInfoModal(false);
    setShowConfirmModal(true);
  };

  // Nút Hành động hàng loạt (Bulk)
  const executeBulkAction = (type: "CHANGE_PLAN" | "RENEW") => {
    if (selectedIds.size === 0) return;
    const targets = subscriptionTenantInfo.filter((info) =>
      selectedIds.has(info.restaurantId),
    );
    if (type === "CHANGE_PLAN") handleActionChangePlan(targets, "CHANGE");
    else handleActionRenew(targets);
  };

  // Mở modal xác nhận gói trải nghiệm
  const handleActivateTrial = (restaurantId: number) => {
    setTrialTargetRestaurantId(restaurantId);
    setShowTrialModal(true);
  };

  // Thực sự gọi API sau khi Tenant xác nhận
  const confirmActivateTrial = async () => {
    if (!trialTargetRestaurantId) return;
    setIsActivatingTrial(true);
    try {
      const res = await apiClient.post(API.SUBSCRIPTION.ACTIVATE_TRIAL(trialTargetRestaurantId));
      if (res.data.isSuccess) {
        toast.success("Kích hoạt gói trải nghiệm thành công! Nhà hàng đã được kích hoạt.");
        setShowTrialModal(false);
        await Promise.all([fetchSubscriptions(), refreshUserInfo()]);
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setIsActivatingTrial(false);
    }
  };

  return (
    <div>
      <section>
        {/* Header Titles */}
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Quản lý gói dịch vụ
          </div>
          <div className="text-lg font-semibold text-slate-900">
            Gói dịch vụ
          </div>
        </div>

        {/* Toolbar */}
        <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200 mt-4">
          <div className="flex items-center gap-3">
            {selectedIds.size > 0 ? (
              // HIỂN THỊ NÚT BULK ACTION KHI CÓ TICK CHỌN
              <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2">
                <span className="text-sm font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded">
                  Đã chọn {selectedIds.size} nhà hàng
                </span>
                <button
                  onClick={() => executeBulkAction("CHANGE_PLAN")}
                  className="cursor-pointer px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition"
                >
                  Đăng ký / Đổi gói
                </button>
                <button
                  onClick={() => executeBulkAction("RENEW")}
                  className="cursor-pointer px-3 py-1.5 bg-emerald-600 text-white rounded-md text-sm font-medium hover:bg-emerald-700 transition"
                >
                  Gia hạn hàng loạt
                </button>
              </div>
            ) : (
              // HIỂN THỊ ICON MẶC ĐỊNH KHI CHƯA CHỌN
              <div className="flex gap-2">
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <Plus className="w-5 h-5 text-gray-700" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <SlidersHorizontal className="w-5 h-5 text-gray-700" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <ArrowUpDown className="w-5 h-5 text-gray-700" />
                </button>
              </div>
            )}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm kiếm nhà hàng..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
            />
          </div>
        </div>

        {/* Bảng dữ liệu */}
        <div className="mx-auto max-w-8xl mt-2">
          <table className=" w-full table-auto border-collapse text-left">
            <thead>
              {/* Giữ nguyên Thead của bạn */}
              <tr>
                <th className="w-12 px-4 py-3 border-b-2 border-gray-200">
                  <input
                    type="checkbox"
                    className="cursor-pointer rounded border-gray-300"
                    checked={isAllSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = isSomeSelected;
                    }}
                    onChange={(e) => checkAllCheckBox(e.target.checked)}
                  />
                </th>
                <th className=" border-b-2 border-gray-200 px-4 py-2 text-sm font-medium text-gray-700">
                  ID
                </th>
                <th className="border-b-2 border-gray-200 px-4 py-2 text-sm font-medium text-gray-700">
                  Tên nhà hàng
                </th>
                <th className="border-b-2 border-gray-200 px-4 py-2 text-sm font-medium text-gray-700">
                  Địa chỉ
                </th>
                <th className="border-b-2 border-gray-200 px-4 py-2 text-sm font-medium text-gray-700">
                  Tên gói
                </th>
                <th className="border-b-2 border-gray-200 px-4 py-2 text-sm font-medium text-gray-700">
                  Ngày bắt đầu
                </th>
                <th className="border-b-2 border-gray-200 px-4 py-2 text-sm font-medium text-gray-700">
                  Ngày hết hạn
                </th>
                <th className="border-b-2 border-gray-200 px-4 py-2 text-sm font-medium text-gray-700">
                  Trạng thái
                </th>
                <th className="border-b-2 border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 text-center">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody>
              {isInitialLoading ? (
                Array.from({ length: 8 }).map((_, rowIndex) => (
                  <tr
                    key={`plan-loading-row-${rowIndex}`}
                    className="border-b border-gray-200"
                  >
                    <td className="px-4 py-3">
                      <div className="h-4 w-4 animate-pulse rounded bg-gray-200" />
                    </td>
                    <td className="px-4 py-2">
                      <div className="h-3 w-6 animate-pulse rounded bg-gray-200" />
                    </td>
                    <td className="px-4 py-2">
                      <div className="h-4 w-28 animate-pulse rounded bg-gray-200" />
                    </td>
                    <td className="px-4 py-2">
                      <div className="h-4 w-40 animate-pulse rounded bg-gray-100" />
                    </td>
                    <td className="px-4 py-2">
                      <div className="h-5 w-24 animate-pulse rounded-full bg-gray-200" />
                    </td>
                    <td className="px-4 py-2">
                      <div className="h-4 w-24 animate-pulse rounded bg-gray-100" />
                    </td>
                    <td className="px-4 py-2">
                      <div className="h-4 w-24 animate-pulse rounded bg-gray-100" />
                    </td>
                    <td className="px-4 py-2">
                      <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center justify-center gap-2">
                        <div className="h-8 w-20 animate-pulse rounded bg-gray-200" />
                        <div className="h-8 w-16 animate-pulse rounded bg-gray-200" />
                        <div className="h-8 w-16 animate-pulse rounded bg-gray-200" />
                      </div>
                    </td>
                  </tr>
                ))
              ) : filterSubscriptionInfo.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-10 text-center text-sm text-gray-500"
                  >
                    Không có nhà hàng phù hợp.
                  </td>
                </tr>
              ) : (
                filterSubscriptionInfo.map((info, index) => (
                  <tr
                    key={info.restaurantId}
                    className="border-b border-gray-200 hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        className="cursor-pointer rounded border-gray-300"
                        checked={selectedIds.has(info.restaurantId)}
                        onChange={(e) =>
                          handleRestaurantInfoCheckboxChange(
                            info.restaurantId,
                            e.target.checked,
                          )
                        }
                      />
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-600">
                      {index + 1}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-600">
                      {info.restaurantName}
                    </td>
                    <td
                      className="px-4 py-2 text-sm text-gray-600 truncate max-w-50"
                      title={info.address}
                    >
                      {info.address}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-600">
                      {info.isTrialPlan ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                          {info.currentPlanName} (Dùng thử)
                        </span>
                      ) : info.currentPlanName ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                          <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>{" "}
                          {info.currentPlanName}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
                          <span className="h-1.5 w-1.5 rounded-full bg-red-500"></span>{" "}
                          Chưa đăng ký
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-600">
                      {info.startDate
                        ? new Date(info.startDate).toLocaleDateString("vi-VN")
                        : "Không có"}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-600">
                      {info.endDate
                        ? new Date(info.endDate).toLocaleDateString("vi-VN")
                        : "Không có"}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-600">
                      {info.isActive ? (
                        <span className="text-xs font-medium text-green-800">
                          Hoạt động
                        </span>
                      ) : (
                        <span className="text-xs font-medium text-red-800">
                          Tạm ngưng
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-600">
                      <div className="flex items-center justify-center gap-2">
                        {/* Trial button: only show if tenant hasn't used trial AND restaurant has no plan */}
                        {!user?.hasUsedTrial && !info.currentPlanId && (
                          <button
                            id={`btn-trial-${info.restaurantId}`}
                            className="cursor-pointer inline-flex items-center gap-1.5 rounded-md border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-100 disabled:opacity-50"
                            disabled={isActivatingTrial}
                            onClick={() => handleActivateTrial(info.restaurantId)}
                          >
                            Dùng thử miễn phí
                          </button>
                        )}
                        <button
                          className=" cursor-pointer inline-flex items-center rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100"
                          onClick={() =>
                            handleActionChangePlan(
                              [info],
                              info.currentPlanId ? "UPGRADE" : "CHANGE",
                            )
                          }
                        >
                          {info.currentPlanId ? "Nâng cấp" : "Đăng ký"}
                        </button>
                        <button
                          disabled={!info.currentPlanId}
                          onClick={() =>
                            handleActionChangePlan([info], "DOWNGRADE")
                          }
                          className="cursor-pointer inline-flex items-center rounded-md border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-medium text-orange-700 disabled:opacity-50 hover:bg-orange-100"
                        >
                          Hạ cấp
                        </button>
                        <button
                          disabled={!info.currentPlanId || info.isTrialPlan}
                          onClick={() => handleActionRenew([info])}
                          className="cursor-pointer inline-flex items-center rounded-md border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 disabled:opacity-50 hover:bg-green-100"
                        >
                          Gia hạn
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* MODAL 1: Chọn gói (Chỉ mở khi nâng/hạ cấp/đăng ký) */}
      {showInfoModal && (
        <PlanPopUpInfo
          onClose={() => {
            setShowInfoModal(false);
            setPlanId(null);
          }}
          onSubmit={handleSelectPlanSubmit}
          planData={activePlans}
          planId={planId}
          mode={planChangeMode}
        />
      )}

      {/* MODAL 2: Chọn chu kỳ & Xem trước/Thanh toán */}
      {showConfirmModal && targetRestaurants.length > 0 && (
        <PlanPopUpConfirm
          onClose={() => setShowConfirmModal(false)}
          selectedPlan={selectedPlan}
          targetRestaurants={targetRestaurants}
        />
      )}

      {/* MODAL 3: Xác nhận kích hoạt gói Trải nghiệm */}
      {showTrialModal && (() => {
        const trialPlan = activePlans.find((p) => p.isTrial);
        const featureList = trialPlan ? [
          { label: "AI gợi ý món đi kèm (AI Upsell)", enabled: trialPlan.features.canUseAIUpsell },
          { label: "Gợi ý món ưu tiên trên đầu trang", enabled: trialPlan.features.canRecommendationOnTop },
          { label: "Chương trình khuyến mãi", enabled: trialPlan.features.canUsePromotions },
          { label: "Tùy chỉnh mẫu menu", enabled: trialPlan.features.canCustomMenuTemplate },
        ] : [];

        return (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            onClick={() => !isActivatingTrial && setShowTrialModal(false)}
          >
            <div
              className="w-full max-w-md rounded-2xl bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">Kích hoạt gói trải nghiệm</h2>
                  <p className="mt-0.5 text-xs text-slate-500">Miễn phí · 30 ngày · Không thu phí hoa hồng</p>
                </div>
                <button
                  onClick={() => setShowTrialModal(false)}
                  disabled={isActivatingTrial}
                  className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-40"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Plan info */}
              <div className="px-6 py-5 space-y-4">
                {trialPlan && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                    <div className="text-sm font-semibold text-amber-900">{trialPlan.name}</div>
                    <div className="mt-1 text-xs text-amber-700">Thời hạn: <strong>30 ngày</strong></div>
                  </div>
                )}

                {/* Feature list */}
                <div>
                  <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Tính năng bao gồm</div>
                  <ul className="space-y-2">
                    {featureList.map((f) => (
                      <li key={f.label} className="flex items-center gap-2.5 text-sm">
                        <span className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full ${
                          f.enabled ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400"
                        }`}>
                          {f.enabled ? <Check className="h-2.5 w-2.5" strokeWidth={3} /> : <X className="h-2.5 w-2.5" strokeWidth={3} />}
                        </span>
                        <span className={f.enabled ? "text-slate-700" : "text-slate-400 line-through"}>
                          {f.label}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Notice */}
                <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs text-slate-500">
                  Mỗi tài khoản chỉ được kích hoạt gói trải nghiệm <strong>1 lần duy nhất</strong>.
                  Sau khi hết hạn, nhà hàng sẽ tự động ngừng hoạt động cho đến khi bạn đăng ký gói mới.
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 border-t border-slate-100 px-6 py-4">
                <button
                  type="button"
                  onClick={() => setShowTrialModal(false)}
                  disabled={isActivatingTrial}
                  className="cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={confirmActivateTrial}
                  disabled={isActivatingTrial}
                  className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-60"
                >
                  {isActivatingTrial ? "Đang kích hoạt..." : "Kích hoạt ngay"}
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
