import { useAuthStore } from '@/src/store/authStore';

/**
 * Hook để sử dụng auth state từ bất kỳ component nào
 * Ví dụ:
 * const { user, token, isAuthenticated, logout } = useAuth();
 */
export const useAuth = () => {
  const { user, token, isAuthenticated, logout, refreshUserInfo } = useAuthStore();
  return { user, token, isAuthenticated, logout, refreshUserInfo };
};
