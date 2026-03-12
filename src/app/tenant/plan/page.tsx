"use client";
import { useState, useEffect } from "react";
import { API } from "@/src/constants/api";
import apiClient from "@/src/services/apiClient";
import { toast } from "react-toastify";
import PlanPopUpConfirm from "@/src/components/ui/tenant/PlanPopUpConfirm";
import { PlanApiItem, SubscriptionTenantInfo } from "@/src/types/type";
import PlanPopUpInfo from "@/src/components/ui/tenant/PlanPopUpInfo";

export default function PlanPage() {
  const [activePlans, setActivePlans] = useState<PlanApiItem[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<PlanApiItem | null>(null);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<number | null>(null);

  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [subscriptionTenantInfo, setSubscriptionTenantInfo] = useState<SubscriptionTenantInfo[]>([]);

  // Hàm mở modal chọn Plan
  const handleShowPlanInfo = async (restaurantId: number) => {
    setSelectedRestaurantId(restaurantId);
    try {
      const response = await apiClient.get(API.PLAN.GETALL);
      if (response.data.isSuccess && response.data.data) {
        setActivePlans(response.data.data);
        setShowInfoModal(true);
      } else {
        toast.error("Không tải được thông tin gói dịch vụ");
      }
    } catch (error: unknown) {
      toast.error("Có lỗi xảy ra khi lấy danh sách gói");
    }
  };

  // Hàm chuyển tiếp từ Info sang Confirm
  const handleSelectPlan = (planId: number) => {
    const selected = activePlans.find((plan) => plan.id === planId) || null;
    setSelectedPlan(selected);
    setShowInfoModal(false);
    setShowConfirmModal(true);
  };

  useEffect(() => {
    const fetchSubscriptionInfo = async () => {
      try {
        const response = await apiClient.get(
          API.SUBSCRIPTION.GET_SUBSCRIPTION_BY_TENANT,
        );
        if (response.data.isSuccess) {
          setSubscriptionTenantInfo(response.data.data);
        } else {
          setSubscriptionTenantInfo([]);
        }
      } catch (error) {
        console.error("Failed to load subscription info", error);
        setSubscriptionTenantInfo([]);
      }
    };

    fetchSubscriptionInfo();
  }, []);

  return (
    <div>
      <section>
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Plan Management
          </div>
          <div className="text-lg font-semibold text-slate-900">
            Gói dịch vụ
          </div>
        </div>
        <div className="mx-auto max-w-8xl px-6 mt-6">
          <table className="w-full table-auto border-collapse text-left">
            {/* Đã sửa lỗi vòng lặp ở thead */}
            <thead>
              <tr>
                <th className="border-b-2 border-gray-200 px-4 py-2 text-sm font-medium text-gray-700">
                  ID
                </th>
                <th className="border-b-2 border-gray-200 px-4 py-2 text-sm font-medium text-gray-700">
                  Tên nhà hàng
                </th>
                <th className="border-b-2 border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 text-center">
                  Địa chỉ nhà hàng
                </th>
                <th className="border-b-2 border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 text-center">
                  Tên gói dịch vụ
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
            {/* Vòng lặp map chỉ nằm ở tbody */}
            <tbody>
              {subscriptionTenantInfo.map((info, index) => (
                <tr
                  key={info.restaurantId}
                  className="border-b border-gray-200 hover:bg-slate-50 transition-colors"
                >
                  <td className="px-4 py-2 text-sm text-gray-600">
                    {index + 1}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-600">
                    {info.restaurantName}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-600">
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
                    {info.startDate ? new Date(info.startDate).toLocaleDateString("vi-VN") : 'N/A'}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-600">
                    {info.endDate ? new Date(info.endDate).toLocaleDateString("vi-VN") : 'N/A'}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-600">
                    {info.isActive ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>{" "}
                        Hoạt động
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
                        <span className="h-1.5 w-1.5 rounded-full bg-red-500"></span>{" "}
                        Không hoạt động
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-600">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        title={info.currentPlanId ? "Nâng cấp" : "Đăng ký"}
                        className="inline-flex items-center rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100 transition-colors"
                        onClick={() => handleShowPlanInfo(info.restaurantId)}
                      >
                        {info.currentPlanId ? "Nâng cấp" : "Đăng ký"}
                      </button>

                      <button
                        title="Hạ cấp"
                        disabled={!info.currentPlanId}
                        onClick={() => handleShowPlanInfo(info.restaurantId)}
                        className="inline-flex items-center rounded-md border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-medium text-orange-700 disabled:opacity-50 transition-colors hover:bg-orange-100 disabled:cursor-not-allowed"
                      >
                        Hạ cấp
                      </button>

                      <button
                        title="Gia hạn"
                        disabled={!info.currentPlanId}
                        onClick={() => handleShowPlanInfo(info.restaurantId)}
                        className="inline-flex items-center rounded-md border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 disabled:opacity-50 transition-colors hover:bg-green-100 disabled:cursor-not-allowed"
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

      {/* MODAL 1: Chọn gói */}
      {showInfoModal && (
        <PlanPopUpInfo
          onClose={() => setShowInfoModal(false)}
          onSubmit={handleSelectPlan}
          planData={activePlans}
        />
      )}

      {/* MODAL 2: Chọn chu kỳ & Xem trước/Thanh toán */}
      {showConfirmModal && selectedRestaurantId && selectedPlan && (
        <PlanPopUpConfirm
          onClose={() => setShowConfirmModal(false)}
          planData={selectedPlan}
          restaurantId={selectedRestaurantId}
        />
      )}
    </div>
  );
}