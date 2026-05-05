"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/src/hooks/useAuth";
import { TENANT_ROUTES } from "@/src/constants/routes";
import { UserInfo } from "@/src/types/type";

interface SuspendedAccessGuardProps {
  children: React.ReactNode;
}

/**
 * Guard bảo vệ: Block access vào trang quản lý khi tenant bị suspended (isSuspended = true)
 * Cho phép access: Chỉ các trang thanh toán công nợ, đăng xuất
 */
export function SuspendedAccessGuard({ children }: SuspendedAccessGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const tenantInfo = (user ?? null) as UserInfo | null;

  // Các trang được phép truy cập khi suspended
  const allowedPathsWhenSuspended = [
    TENANT_ROUTES.DEBT_PAYMENT, // /tenant/debt-payment
    TENANT_ROUTES.SETTINGS, // /tenant/tenant-setting (cho phép xem/update profile)
    "/tenant/logout",
  ];

  // Kiểm tra nếu tenant bị suspended
  useEffect(() => {
    if (!tenantInfo) return;

    const isSuspended = tenantInfo.isSuspended === true;
    const isAllowedPath = allowedPathsWhenSuspended.some(
      (path) => pathname === path || pathname.startsWith(path),
    );

    // Nếu suspended và không ở trang allowed → redirect đến debt payment
    if (isSuspended && !isAllowedPath) {
      router.push(TENANT_ROUTES.DEBT_PAYMENT);
      return;
    }
  }, [tenantInfo, pathname, router]);

  return <>{children}</>;
}
