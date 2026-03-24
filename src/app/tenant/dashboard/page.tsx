"use client";
import TenantVerifyBankModelPopup from "@/src/components/ui/tenant/TenantVerifyBankModelPopup";
import VerifyTaxModelPopUp, {
  TenantTaxInfo,
} from "@/src/components/ui/tenant/VerifyTaxModelPopUp";
import { API } from "@/src/constants/api";
import { useRealtime } from "@/src/hooks/useRealtime";
import apiClient from "@/src/services/apiClient";
import React, { useEffect } from "react";
import { toast } from "react-toastify";
import { useAuth } from "@/src/hooks/useAuth";
import { UserInfo, Restaurant } from "@/src/types/type";
import RevenueSummary from "@/src/components/ui/tenant/RevenueSummary";
import { Store, ChevronDown } from "lucide-react";

export default function DashboardPage() {
  const [showInfoModal, setShowInfoModal] = React.useState(false);
  const [showBankModal, setShowBankModal] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [restaurants, setRestaurants] = React.useState<Restaurant[]>([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = React.useState<number | null>(null);
  const { user, refreshUserInfo } = useAuth();
  const tenantInfo = (user ?? null) as UserInfo | null;

  useRealtime({
    tenantId: tenantInfo?.id,
    onProfileChanged: async () => {
      await refreshUserInfo();
      toast.success("Đã xác thực tài khoản ngân hàng thành công");
    },
  });

  const handleSubmit = async (info: TenantTaxInfo) => {
    setIsLoading(true);
    try {
      const response = await apiClient.put(
        `${API.TENANT.TAX_VALIDATION}${encodeURIComponent(info.taxCode)}`,
      );
      if (response.data.isSuccess === true) {
        await refreshUserInfo();
        toast.success("Mã số thuế hợp lệ. Vui lòng cập nhật tài khoản ngân hàng để nhận QR xác thực.");
        setShowInfoModal(false);
        setShowBankModal(true);
      } else {
        toast.error("Xác nhận mã số thuế thất bại: " + response.data.message);
      }
    } catch (error) {
      console.error("Error validating tax:", error);
      const backendMessage = (error as { response?: { data?: { message?: string } } }).response?.data?.message;
      toast.error(
        backendMessage || (error as { message?: string }).message || "Có lỗi xảy ra trong quá trình xác nhận mã số thuế!"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!tenantInfo) {
      return;
    }

    if (!tenantInfo.taxNumber) {
      setShowInfoModal(true);
      setShowBankModal(false);
      return;
    }

    if (!tenantInfo.isVerifyBank) {
      setShowInfoModal(false);
      setShowBankModal(true);
      return;
    }

    setShowInfoModal(false);
    setShowBankModal(false);
  }, [tenantInfo]);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await apiClient.get(API.RESTAURANT.GET_ALL_RESTAURANT_BY_TENANT_ID);
        if (response.data.isSuccess && response.data.data.length > 0) {
          setRestaurants(response.data.data);
          setSelectedRestaurantId(response.data.data[0].id);
        }
      } catch (error) {
        console.error("Error fetching restaurants:", error);
      }
    };

    if (tenantInfo) {
      fetchRestaurants();
    }
  }, [tenantInfo]);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {/* Restaurant Selector */}
      {restaurants.length > 0 && (
        <div className="mb-8 flex items-center justify-between">
          <div className="relative inline-block">
            <select
              value={selectedRestaurantId ?? ""}
              onChange={(e) => setSelectedRestaurantId(Number(e.target.value))}
              className="appearance-none bg-white border border-slate-200 rounded-xl px-4 py-2.5 pr-10 text-sm font-semibold text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer transition-all"
            >
              {restaurants.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.restaurantName}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
          
          <div className="hidden md:flex items-center gap-2 text-sm text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
            <Store className="w-4 h-4 text-emerald-500" />
            <span>Quản lý {restaurants.length} nhà hàng</span>
          </div>
        </div>
      )}

      {selectedRestaurantId ? (
        <RevenueSummary restaurantId={selectedRestaurantId} />
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
          <Store className="w-12 h-12 text-slate-300 mb-4" />
          <h3 className="text-lg font-medium text-slate-900">Chưa có nhà hàng nào</h3>
          <p className="text-slate-500 text-sm">Vui lòng tạo nhà hàng để xem báo cáo doanh thu.</p>
        </div>
      )}

      <VerifyTaxModelPopUp
        isOpen={showInfoModal}
        onClose={() => setShowInfoModal(false)}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
      <TenantVerifyBankModelPopup
        isOpen={showBankModal}
        onClose={() => setShowBankModal(false)}
        onSubmit={() => {
          // QR flow is handled inside modal. Backend webhook will push ProfileChanged.
        }}
        isLoading={isLoading}
      />
    </div>
  );
}
