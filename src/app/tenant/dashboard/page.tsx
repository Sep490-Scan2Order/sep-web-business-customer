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
import { UserInfo } from "@/src/types/type";

export default function DashboardPage() {
  const [showInfoModal, setShowInfoModal] = React.useState(false);
  const [showBankModal, setShowBankModal] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
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

  return (
    <div>
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
