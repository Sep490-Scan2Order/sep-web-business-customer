"use client";
import { useState, useEffect } from "react";
import { API } from "@/src/constants/api";
import apiClient from "@/src/services/apiClient";
import { toast } from "react-toastify";
import PlanPopUpConfirm from "@/src/components/ui/tenant/PlanPopUpConfirm";
import { PlanApiItem, SubscriptionTenantInfo } from "@/src/types/type";
import PlanPopUpInfo from "@/src/components/ui/tenant/PlanPopUpInfo";
import { ArrowUpDown, Plus, Search, SlidersHorizontal } from "lucide-react";

export default function PlanPage() {
  const [activePlans, setActivePlans] = useState<PlanApiItem[]>([]);
  const [subscriptionTenantInfo, setSubscriptionTenantInfo] = useState<
    SubscriptionTenantInfo[]
  >([]);

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
  useEffect(() => {
    const fetchData = async () => {
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
    fetchData();
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
              {filterSubscriptionInfo.map((info, index) => (
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
                    className="px-4 py-2 text-sm text-gray-600 truncate max-w-[200px]"
                    title={info.address}
                  >
                    {info.address}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-600">
                    {info.currentPlanName ? (
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
                        disabled={!info.currentPlanId}
                        onClick={() => handleActionRenew([info])}
                        className="cursor-pointer inline-flex items-center rounded-md border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 disabled:opacity-50 hover:bg-green-100"
                      >
                        Gia hạn
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
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
    </div>
  );
}
