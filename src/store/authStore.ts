import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { jwtDecode } from 'jwt-decode';
import { User, AuthState } from '@/src/types/type';
import { getTenantById } from '@/src/services/tenantService';

interface AuthStateWithHydration extends AuthState {
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
}

export const useAuthStore = create<AuthStateWithHydration>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      _hasHydrated: false,

      setUser: (user: User | null) =>
        set({
          user,
          isAuthenticated: !!user,
        }),

      setToken: (token: string | null) =>
        set({
          token,
        }),

      setAuth: (user: User | null, token: string | null) => {
        set({
          user,
          token,
          isAuthenticated: !!user && !!token,
        });
      },

      refreshUserInfo: async () => {
        const { user } = useAuthStore.getState();

        if (!user?.id) {
          return null;
        }

        try {
          const latestUser = await getTenantById(user.id);
          set((state) => ({
            user: latestUser,
            isAuthenticated: !!latestUser && !!state.token,
          }));
          return latestUser;
        } catch (error) {
          console.error('Failed to refresh user info:', error);
          return null;
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },

      setHasHydrated: (state: boolean) => {
        set({
          _hasHydrated: state,
        });
      },
    }),
    {
      name: 'auth-storage', // Tên key trong localStorage
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

/**
 * Hook để check xem store đã hydrated từ localStorage chưa
 * Sử dụng trong AuthProvider để đợi hydration hoàn tất trước khi check auth
 */
export const useHasHydrated = () => {
  return useAuthStore((state) => state._hasHydrated);
};


/**
 * Khôi phục auth state từ localStorage (để backward compatibility)
 * Với zustand persist, hàm này không còn cần thiết vì state tự động restore
 * Giữ lại để tương thích với code cũ
 */
export const restoreAuthFromStorage = () => {
  // Zustand persist tự động restore state, không cần làm gì thêm
  return;
};
