import { create } from 'zustand';
import { jwtDecode } from 'jwt-decode';
import { User, AuthState } from '@/src/types/type';
import { TOKEN_STORAGE_KEY } from '@/src/constants/constant';

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,

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

    // Lưu token vào localStorage nếu token tồn tại
    if (token) {
      if (typeof window !== 'undefined') {
        localStorage.setItem(TOKEN_STORAGE_KEY, token);
      }
    } else {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
      }
    }
  },

  logout: () => {
    set({
      user: null,
      token: null,
      isAuthenticated: false,
    });

    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  },
}));

/**
 * Hàm giải mã token JWT và trích xuất thông tin user
 */
export const decodeToken = (token: string): User | null => {
  try {
    const decoded: any = jwtDecode(token);
    // Trích xuất thông tin user từ token
    // Bạn có thể customize tùy theo cấu trúc token của API
    return {
      id: decoded.sub || decoded.id || '',
      email: decoded.email || '',
      name: decoded.name || decoded.userName || '',
      phone: decoded.phone || '',
      role: decoded.role || '',
      ...decoded, // Bao gồm tất cả các field khác từ token
    };
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

/**
 * Khôi phục auth state từ localStorage khi app khởi động
 */
export const restoreAuthFromStorage = () => {
  if (typeof window === 'undefined') return;

  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (token) {
    const user = decodeToken(token);
    if (user) {
      const { setAuth } = useAuthStore.getState();
      setAuth(user, token);
    }
  }
};
