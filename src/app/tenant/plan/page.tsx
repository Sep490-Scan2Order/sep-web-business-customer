"use client";
import { useState, useEffect } from "react";
import axios from "axios"; // Added for better error type checking
import { API } from "@/src/constants/api";
import apiClient from "@/src/services/apiClient";
import { toast } from "react-toastify";
import { useAuth } from "@/src/hooks/useAuth";
import PlanPopUpConfirm from "@/src/components/ui/tenant/PlanPopUpConfirm";
import { PlanApiItem } from "@/src/types/type";

const formatPrice = (value: number) =>
  new Intl.NumberFormat("vi-VN").format(value);

export default function PlanPage() {
  const [activePlans, setActivePlans] = useState<PlanApiItem[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<PlanApiItem | null>(null);
  const [isFetchingPlans, setIsFetchingPlans] = useState(true); // Renamed for clarity
  const [isSubmittingPurchase, setIsSubmittingPurchase] =
    useState<boolean>(false); // Renamed for clarity
  const [showInfoModal, setShowInfoModal] = useState(false);

  const { user, refreshUserInfo } = useAuth();
  const isFirstTimeBuyer = !user?.subscriptionExpiryDate;

  const handleBuySubscription = async (planId: number) => {
    setIsSubmittingPurchase(true);

    if (isFirstTimeBuyer) {
      try {
        // console.log("Buying first subscription with planId:", planId);
        // const response = await apiClient.post(
        //   API.SUBSCRIPTION.BUY_FIRST_SUBSCRIPTION(planId),
        // );

        // if (response.data.isSuccess) {
        //   toast.success("Mua gói dịch vụ thành công!");
        //   await refreshUserInfo();
        //   setShowInfoModal(false); // Close modal on success
        // } else {
        //   toast.error(response.data.message || "Mua gói dịch vụ thất bại");
        // }
      } catch (error) {
        const errorMessage = axios.isAxiosError(error)
          ? error.response?.data?.message
          : (error as Error).message;

        toast.error(errorMessage || "Có lỗi xảy ra khi mua gói dịch vụ");
      }
    } else {
      try {
        // console.log("Buying upgrade subscription with planId:", planId);
        // const response = await apiClient.post(
        //   API.SUBSCRIPTION.BUY_UPGRADE_SUBSCRIPTION(planId),
        // );

        // if (response.data.isSuccess) {
        //   toast.success("Nâng cấp gói dịch vụ thành công!");
        //   await refreshUserInfo();
        //   setShowInfoModal(false); // Close modal on success
        // } else {
        //   toast.error(response.data.message || "Nâng cấp gói dịch vụ thất bại");
        // }
      } catch (error) {
        const errorMessage = axios.isAxiosError(error)
          ? error.response?.data?.message
          : (error as Error).message;

        toast.error(errorMessage || "Có lỗi xảy ra khi nâng cấp gói dịch vụ");
      }
    }
    setIsSubmittingPurchase(false);
  };

  const handleClickPlan = (planId: number) => {
    const selected = activePlans.find((plan) => plan.id === planId) || null;
    setSelectedPlan(selected);
    setShowInfoModal(true);
  };

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await apiClient.get(API.PLAN.GETALL);
        console.log("API Response for plans:", response);
        if (response.status === 200 && response.data.isSuccess) {
          setActivePlans(response.data.data);
        } else {
          setActivePlans([]);
        }
      } catch (error) {
        console.error("Failed to load plans", error);
        setActivePlans([]);
      } finally {
        setIsFetchingPlans(false);
      }
    };

    fetchPlans();
  }, []);

  return (
    <div>
      <section>
        <div className="mx-auto max-w-6xl px-6">
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
            {activePlans.map((plan) => {
              const isCurrentPlan =
                user?.planName?.toLowerCase() === plan.name.toLowerCase();

              return (
                <div
                  key={plan.id}
                  className={`relative rounded-2xl border bg-white px-6 py-7 shadow-sm transition-transform hover:-translate-y-1 ${
                    isCurrentPlan
                      ? "border-[rgb(var(--color-primary))] ring-2 ring-[rgb(var(--color-primary)/0.3)]"
                      : "border-[rgb(var(--color-primary)/0.15)]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-[rgb(var(--color-primary))]">
                      {plan.name}
                    </h3>
                    <span className="rounded-full bg-[rgb(var(--color-accent-light))] px-3 py-1 text-xs font-semibold text-[rgb(var(--color-accent-dark))]">
                      1 tháng {/* Fixed duration display */}
                    </span>
                  </div>

                  {/* Removed the buggy boolean <p> tag that was here */}

                  <div className="mt-6 flex items-end gap-2">
                    <span className="text-3xl font-extrabold text-gray-900">
                      {formatPrice(plan.monthlyPrice)}đ
                    </span>
                    <span className="text-sm text-gray-600">/tháng</span>
                  </div>

                  <div className="mt-4 text-sm text-[rgb(var(--color-accent-dark))]">
                    <p className="mb-2 font-semibold">Các chức năng chính:</p>
                    <ul className="space-y-1">
                      {/* Always shows if > 0 */}
                      {plan.features.maxStaff > 0 && (
                        <li>
                          - Quản lý tối đa {plan.features.maxStaff} nhân viên
                        </li>
                      )}

                      {/* Shows standard if true, grayed-out/strikethrough if false */}
                      <li
                        className={
                          plan.features.canCustomMenuTemplate
                            ? ""
                            : "text-gray-400 line-through"
                        }
                      >
                        - Tùy chỉnh mẫu thực đơn
                      </li>

                      <li
                        className={
                          plan.features.canUseCombo
                            ? ""
                            : "text-gray-400 line-through"
                        }
                      >
                        - Hỗ trợ tạo Combo
                      </li>

                      <li
                        className={
                          plan.features.canUsePromotions
                            ? ""
                            : "text-gray-400 line-through"
                        }
                      >
                        - Quản lý Khuyến mãi
                      </li>
                    </ul>
                  </div>

                  <button
                    onClick={() => !isCurrentPlan && handleClickPlan(plan.id)}
                    disabled={isCurrentPlan || isSubmittingPurchase}
                    className={`mt-6 inline-flex w-full cursor-pointer items-center justify-center rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors ${
                      isCurrentPlan
                        ? "cursor-not-allowed border-gray-300 bg-gray-100 text-gray-500"
                        : "border-[rgb(var(--color-accent-dark))] text-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-secondary)/0.6)]"
                    }`}
                  >
                    {isCurrentPlan ? "Đang sử dụng" : "Mua ngay"}
                  </button>
                </div>
              );
            })}
          </div>

          {!isFetchingPlans && !activePlans.length && (
            <div className="mt-8 text-center text-sm text-gray-600">
              Hiện chưa có gói dịch vụ để hiển thị.
            </div>
          )}

          {isFetchingPlans && (
            <div className="mt-8 text-center text-sm text-gray-600">
              Đang tải gói dịch vụ...
            </div>
          )}
        </div>
      </section>

      {showInfoModal && (
        <PlanPopUpConfirm
          onClose={() => setShowInfoModal(false)}
          onSubmit={handleBuySubscription}
          isLoading={isSubmittingPurchase}
          planData={selectedPlan}
          isFirstPlan={isFirstTimeBuyer}
        />
      )}
    </div>
  );
}
