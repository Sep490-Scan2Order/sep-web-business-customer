"use client";
import { useState, useEffect } from "react";
import { API } from "@/src/constants/api";
import apiClient from "@/src/services/apiClient";
import { toast } from "react-toastify";
import { useAuth } from "@/src/hooks/useAuth";
import PlanPopUpConfirm from "@/src/components/ui/tenant/PlanPopUpConfirm";

type PlanApiItem = {
  id: number;
  name: string;
  description: string;
  price: number;
  durationInDays: number;
  isActive: boolean;
  createdAt: string;
  updateAt: string;
  isDeleted: boolean;
};

type PlanApiResponse = {
  isSuccess: boolean;
  message: string;
  data: PlanApiItem[];
  errors: unknown;
  timestamp: string;
};

const formatPrice = (value: number) =>
  new Intl.NumberFormat("vi-VN").format(value);

export default function PlanPage() {
  const [activePlans, setActivePlans] = useState<PlanApiItem[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<PlanApiItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user, refreshUserInfo } = useAuth();
  const [loading, setLoading] = useState<boolean>(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const isFirstTimeBuyer = !user?.subscriptionExpiryDate;


  const handleBuySubscription = async (planId: number) => {
    setLoading(true);
    if (isFirstTimeBuyer) {
        try{
            console.log("Buying first subscription with planId:", planId);
            const response = await apiClient.post(API.SUBSCRIPTION.BUY_FIRST_SUBSCRIPTION(planId));
            if (response.data.isSuccess) {
                toast.success("Mua gói dịch vụ thành công!");
              await refreshUserInfo();
            } else {
                toast.error(response.data.message || "Mua gói dịch vụ thất bại");
            }
        }catch (error) {
            const backendMessage = (
                error as { response?: { data?: { message?: string } } }
            ).response?.data?.message;
            toast.error(
                backendMessage ||
                (error as { message?: string }).message ||
                "Có lỗi xảy ra khi mua gói dịch vụ",
            );
        }
    } else {
      try{
         console.log("Buying upgrade subscription with planId:", planId);
        const response = await apiClient.post(API.SUBSCRIPTION.BUY_UPGRADE_SUBSCRIPTION(planId));
        if (response.data.isSuccess) {
          toast.success("Nâng cấp gói dịch vụ thành công!");
          await refreshUserInfo();
        } else {
          toast.error(response.data.message || "Nâng cấp gói dịch vụ thất bại");
        }
      }catch (error) {
        const backendMessage = (
            error as { response?: { data?: { message?: string } } }
        ).response?.data?.message;
        toast.error(
            backendMessage ||
            (error as { message?: string }).message ||
            "Có lỗi xảy ra khi nâng cấp gói dịch vụ",
        );
      }
    }
    setLoading(false);
  }

  const handleClickPlan = (planId: number) => {
    const selected = activePlans.find((plan) => plan.id === planId) || null;
    setSelectedPlan(selected);
    setShowInfoModal(true);
  }

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        // const response = await apiClient.get<PlanApiResponse>(API.PLAN.GETALL);
        // if (response.status === 200 && response.data.isSuccess) {
        //   const filtered = response.data.data.filter(
        //     (plan) => plan.isActive && !plan.isDeleted,
        //   );
        //   setActivePlans(filtered);
        // } else {
        //   setActivePlans([]);
        // }
      } catch (error) {
        console.error("Failed to load plans", error);
        setActivePlans([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlans();
  }, []);
  return (
    <div>
      <section>
        <div className="max-w-6xl mx-auto px-6">
          {/* Thông tin gói hiện tại */}
          {user?.planName && user?.subscriptionExpiryDate && (
            <div className="mb-8 rounded-xl bg-gradient-to-r from-[rgb(var(--color-primary)/0.1)] to-[rgb(var(--color-secondary)/0.1)] p-6 border border-[rgb(var(--color-primary)/0.2)]">
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-[rgb(var(--color-primary))]">
                      Gói hiện tại của bạn
                    </h3>
                    <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                      Đang hoạt động
                    </span>
                  </div>
                  <p className="mt-2 text-2xl font-bold text-gray-900">{user.planName}</p>
                  <p className="mt-1 text-sm text-gray-600">
                    Hết hạn: {new Date(user.subscriptionExpiryDate).toLocaleDateString('vi-VN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-center text-gray-600">Thống kê</p>
                  <div className="mt-2 flex gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Nhà hàng</p>
                      <p className="text-lg text-center font-semibold text-[rgb(var(--color-primary))]">
                        {user.totalRestaurants || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Món ăn</p>
                      <p className="text-lg text-center font-semibold text-[rgb(var(--color-primary))]">
                        {user.totalDishes || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Danh mục</p>
                      <p className="text-lg text-center font-semibold text-[rgb(var(--color-primary))]">
                        {user.totalCategories || 0}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-[rgb(var(--color-primary))]">
              {user?.planName ? 'Nâng cấp hoặc gia hạn gói' : 'Chọn gói phù hợp với bạn'}
            </h2>
            <div className="mx-auto mt-3 h-[2px] w-28 bg-[rgb(var(--color-primary)/0.4)]" />
            <p className="mt-5 text-sm md:text-base text-gray-600">
              Giá đã bao gồm hỗ trợ khởi tạo và cập nhật tính năng mới nhất.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            {activePlans.map((plan) => {
              const isCurrentPlan = user?.planName?.toLowerCase() === plan.name.toLowerCase();
              
              return (
                <div
                  key={plan.id}
                  className={`relative rounded-2xl border bg-white px-6 py-7 shadow-sm transition-transform hover:-translate-y-1 ${
                    isCurrentPlan 
                      ? 'border-[rgb(var(--color-primary))] ring-2 ring-[rgb(var(--color-primary)/0.3)]' 
                      : 'border-[rgb(var(--color-primary)/0.15)]'
                  }`}
                >
                  {/* Badge gói hiện tại */}
                  {isCurrentPlan && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-[rgb(var(--color-primary))] px-4 py-1 text-xs font-semibold text-white shadow-md">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Gói hiện tại
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-[rgb(var(--color-primary))]">
                      {plan.name}
                    </h3>
                    <span className="rounded-full bg-[rgb(var(--color-accent-light))] px-3 py-1 text-xs font-semibold text-[rgb(var(--color-accent-dark))]">
                      {Math.max(1, Math.ceil(plan.durationInDays / 30))} tháng
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-gray-600">{plan.description}</p>

                  <div className="mt-6 flex items-end gap-2">
                    <span className="text-3xl font-extrabold text-gray-900">
                      {formatPrice(plan.price)}đ
                    </span>
                    <span className="text-sm text-gray-600">/tháng</span>
                  </div>
                  <p className="mt-2 text-xs text-[rgb(var(--color-accent-dark))]">
                    Cam kết tối thiểu{" "}
                    {Math.max(1, Math.ceil(plan.durationInDays / 30))} tháng
                  </p>

                  <button
                    onClick={() => !isCurrentPlan && handleClickPlan(plan.id)}
                    disabled={isCurrentPlan}
                    className={`mt-6 inline-flex w-full items-center justify-center rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors ${
                      isCurrentPlan
                        ? 'border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed'
                        : 'border-[rgb(var(--color-accent-dark))] text-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-secondary)/0.6)]'
                    }`}
                  >
                    {isCurrentPlan ? 'Đang sử dụng' : 'Mua ngay'}
                  </button>
                </div>
              );
            })}
          </div>
          {!isLoading && !activePlans.length && (
            <div className="mt-8 text-center text-sm text-gray-600">
              Hiện chưa có gói dịch vụ để hiển thị.
            </div>
          )}
          {isLoading && (
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
          isLoading={loading}
          planData={selectedPlan}
          isFirstPlan={isFirstTimeBuyer}
        />
      )}
    </div>
  );
}
