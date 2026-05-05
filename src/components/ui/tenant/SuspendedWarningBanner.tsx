"use client";

import { useRouter } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { useAuth } from "@/src/hooks/useAuth";
import { TENANT_ROUTES } from "@/src/constants/routes";
import { UserInfo } from "@/src/types/type";

/**
 * Banner cảnh báo khi tenant bị suspended
 * Hiển thị ở đầu trang, với button "Thanh toán ngay"
 */
export function SuspendedWarningBanner() {
  const router = useRouter();
  const { user } = useAuth();
  const tenantInfo = (user ?? null) as UserInfo | null;

  if (!tenantInfo?.isSuspended) {
    return null;
  }

  const handlePayNow = () => {
    router.push(TENANT_ROUTES.DEBT_PAYMENT);
  };

  return (
    <div className="bg-rose-50 border-b-2 border-rose-300 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center gap-4">
        <AlertTriangle className="h-5 w-5 text-rose-600 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-rose-900">
            ⚠️ Tài khoản của bạn đã bị <strong>đình chỉ</strong> do quá hạn
            thanh toán phí hoa hồng
          </p>
          <p className="text-xs text-rose-700 mt-1">
            Công nợ hiện tại:{" "}
            <strong>
              {tenantInfo.totalDebtAmount?.toLocaleString("vi-VN")} VND
            </strong>
          </p>
        </div>
        <button
          onClick={handlePayNow}
          className="flex-shrink-0 px-4 py-2 bg-rose-600 text-white text-sm font-semibold rounded-lg hover:bg-rose-700 transition-colors"
        >
          Thanh toán ngay
        </button>
      </div>
    </div>
  );
}
