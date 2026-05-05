"use client";

import { AuthProvider } from "./AuthProvider";
import { SuspendedAccessGuard } from "./SuspendedAccessGuard";
import { ROUTES } from "@/src/constants/routes";

interface TenantAuthProviderProps {
  children: React.ReactNode;
}

/**
 * Provider bảo vệ các trang tenant
 * 1. AuthProvider: Kiểm tra user trong localStorage và role = "tenant"
 * 2. SuspendedAccessGuard: Block access nếu tenant bị suspended
 * Nếu không đủ điều kiện, redirect về trang home với thông báo
 */
export function TenantAuthProvider({ children }: TenantAuthProviderProps) {
  return (
    <AuthProvider
      requiredRole="tenant"
      redirectTo={ROUTES.HOME}
      loginMessage="Vui lòng đăng nhập để tiếp tục"
      accessDeniedMessage="Bạn không có quyền truy cập trang này. Vui lòng đăng nhập với tài khoản tenant."
    >
      <SuspendedAccessGuard>{children}</SuspendedAccessGuard>
    </AuthProvider>
  );
}
