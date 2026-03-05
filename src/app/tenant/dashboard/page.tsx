"use client";
import DepositVerifyTaxModelPopUp from "@/src/components/ui/tenant/DepositVerifyTaxModelPopUp";
import VerifyTaxModelPopUp, {
  TenantTaxInfo,
} from "@/src/components/ui/tenant/VerifyTaxModelPopUp";
import { API } from "@/src/constants/api";
import apiClient from "@/src/services/apiClient";
import React, { useEffect } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/hooks/useAuth";
import { UserInfo } from "@/src/types/type";

export default function DashboardPage() {
  const [showInfoModal, setShowInfoModal] = React.useState(false);
  const [showDepositModal, setShowDepositModal] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const { user, refreshUserInfo } = useAuth();
  const tenantInfo = (user ?? null) as UserInfo | null;
  const router = useRouter();

  const handleSubmit = async (info: TenantTaxInfo) => {
    setIsLoading(true);
    try {
      const response = await apiClient.put(
        `${API.TENANT.TAX_VALIDATION}${encodeURIComponent(info.taxCode)}`,
      );
      if (response.data.isSuccess === true) {
        await refreshUserInfo();
        toast.success("Thông tin mã số thuế đã được xác nhận thành công!");
        setShowInfoModal(false);
        setShowDepositModal(true);
      } else {
        toast.error("Xác nhận mã số thuế thất bại: " + response.data.message);
      }
    } catch (error) {
      console.error("Error validating tax:", error);
      const backendMessage = (error as any).response?.data?.message;
      toast.error(
        backendMessage || (error as any).message || "Có lỗi xảy ra trong quá trình xác nhận mã số thuế!"
      );
    } finally {
      setIsLoading(false);
    }
  };
  const handleDepositSubmit = async () => {
    setIsLoading(true);
    try {
      const responseDeposit = await apiClient.post(
        API.TENANT_WALLET.DEPOSIT_VERIFY_TAX,
      );
      console.log("Deposit verify tax response:", responseDeposit);
      if (responseDeposit.status === 200) {
        router.push(responseDeposit.data);
      }
      setShowDepositModal(false);
      router.refresh();
    } catch (error) {
      console.error("Error during deposit verification:", error);
      toast.error("Có lỗi xảy ra trong quá trình xác thực thanh toán!");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      router.push("/tenant/login");
    } else if (tenantInfo && !tenantInfo.isVerifyTax) {
      setShowInfoModal(true);
    }
  }, [user, tenantInfo, router]);
  return (
    <div>
      <VerifyTaxModelPopUp
        isOpen={showInfoModal}
        onClose={() => setShowInfoModal(false)}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
      <DepositVerifyTaxModelPopUp
        isOpen={showDepositModal}
        onClose={() => setShowDepositModal(false)}
        onSubmit={handleDepositSubmit}
        isLoading={false}
      />
    </div>
  );
}
