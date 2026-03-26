'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/src/hooks/useAuth';
import { useHasHydrated, isTokenExpired, useAuthStore } from '@/src/store/authStore';
import { toast } from 'react-toastify';

interface AuthProviderProps {
  children: React.ReactNode;
  requiredRole?: string | string[]; 
  redirectTo?: string; 
  loginMessage?: string; 
  accessDeniedMessage?: string; 
}

/**
 * Provider bảo vệ các trang yêu cầu authentication và role
 * Có thể tái sử dụng cho nhiều loại role khác nhau
 * 
 * @example
 * // Bảo vệ trang tenant
 * <AuthProvider requiredRole="tenant" redirectTo="/">
 *   {children}
 * </AuthProvider>
 * 
 * // Bảo vệ trang admin  
 * <AuthProvider requiredRole="admin" redirectTo="/admin-login">
 *   {children}
 * </AuthProvider>
 * 
 * // Bảo vệ trang cho nhiều role
 * <AuthProvider requiredRole={["tenant", "admin"]} redirectTo="/">
 *   {children}
 * </AuthProvider>
 */
export function AuthProvider({
  children,
  requiredRole,
  redirectTo = '/',
  loginMessage = 'Vui lòng đăng nhập để tiếp tục',
  accessDeniedMessage = 'Bạn không có quyền truy cập trang này',
}: AuthProviderProps) {
  const { user, token, isAuthenticated, logout } = useAuth();
  const hasHydrated = useHasHydrated();
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Đợi zustand persist rehydrate xong trước khi check auth
    if (!hasHydrated) {
      return;
    }

    const checkAuth = () => {
      // Kiểm tra token hết hạn trước — xử lý trường hợp isAuthenticated vẫn true trong store nhưng JWT đã invalid
      if (token && isTokenExpired(token)) {
        logout();
        toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.', {
          position: 'top-right',
          autoClose: 4000,
        });
        router.replace(redirectTo);
        return;
      }

      // Kiểm tra authentication
      if (!isAuthenticated || !user) {
        const isLoggingOut = useAuthStore.getState().isLoggingOut;
        if (!isLoggingOut) {
          toast.error(loginMessage, {
            position: 'top-right',
            autoClose: 3000,
          });
        }
        router.replace(redirectTo);
        return;
      }

      // Kiểm tra role nếu được yêu cầu
      if (requiredRole) {
        const userRole = user.role?.toLowerCase() || '';
        const allowedRoles = Array.isArray(requiredRole)
          ? requiredRole.map((r) => r.toLowerCase())
          : [requiredRole.toLowerCase()];

        if (!allowedRoles.includes(userRole)) {
          toast.error(accessDeniedMessage, {
            position: 'top-right',
            autoClose: 3000,
          });
          router.replace(redirectTo);
          return;
        }
      }

      // Pass tất cả checks
      setIsChecking(false);
    };

    checkAuth();
  }, [hasHydrated, isAuthenticated, user, token, logout, router, pathname, requiredRole, redirectTo, loginMessage, accessDeniedMessage]);

  // Hiển thị loading trong khi check auth
  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
