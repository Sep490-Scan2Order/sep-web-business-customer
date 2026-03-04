'use client';

import { AuthProvider } from './AuthProvider';
import { ROUTES } from '@/src/constants/routes';

interface TenantAuthProviderProps {
  children: React.ReactNode;
}

/**
 * Provider bảo vệ các trang tenant
 * Kiểm tra user trong localStorage và role = "tenant"
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
      {children}
    </AuthProvider>
  );
}
