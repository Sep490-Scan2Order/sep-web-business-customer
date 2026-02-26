"use client";
import DepositVerifyTaxModelPopUp from "@/src/components/ui/DepositVerifyTaxModelPopUp";
import VerifyTaxModelPopUp, {
  TenantTaxInfo,
} from "@/src/components/ui/VerifyTaxModelPopUp";
import { API } from "@/src/constants/api";
import apiClient from "@/src/services/apiClient";
import React from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { set } from "nprogress";

export default function DashboardPage() {
  const [showInfoModal, setShowInfoModal] = React.useState(true);
  const [showDepositModal, setShowDepositModal] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const router = useRouter();

  const handleSubmit = async (info: TenantTaxInfo) => {
    setIsLoading(true);
    try {
      const response = await apiClient.put(
        `${API.TENANT.TAX_VALIDATION}${encodeURIComponent(info.taxCode)}`,
      );
      console.log("Tax validation response:", response.data);
      if (response.data.isSuccess === true) {
        toast.success("Thông tin mã số thuế đã được xác nhận thành công!");
        setShowInfoModal(false);
        setShowDepositModal(true);
      } else {
        toast.error("Xác nhận mã số thuế thất bại: " + response.data.message);
      }
    } catch (error) {
      console.error("Error validating tax:", error);
      toast.error("Có lỗi xảy ra!");
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
