'use client';

import { AuthProvider } from './AuthProvider';
import { ROUTES } from '@/src/constants/routes';

interface AdminAuthProviderProps {
  children: React.ReactNode;
}

/**
 * Provider bảo vệ các trang admin
 * Kiểm tra user trong localStorage và role = "admin"
 * Nếu không đủ điều kiện, redirect về trang admin login với thông báo
 */
export function AdminAuthProvider({ children }: AdminAuthProviderProps) {
  return (
    <AuthProvider
      requiredRole="admin"
      redirectTo={ROUTES.PAGES.PUBLIC.ADMIN_LOGIN}
      loginMessage="Vui lòng đăng nhập với tài khoản admin"
      accessDeniedMessage="Bạn không có quyền truy cập trang quản trị. Vui lòng đăng nhập với tài khoản admin."
    >
      {children}
    </AuthProvider>
  );
}
