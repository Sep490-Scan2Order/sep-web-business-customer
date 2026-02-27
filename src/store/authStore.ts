import { create } from 'zustand';
import { jwtDecode } from 'jwt-decode';
import { User, AuthState } from '@/src/types/type';
import { TOKEN_STORAGE_KEY } from '@/src/constants/constant';

const USER_STORAGE_KEY = 'user_info';
const REFRESH_TOKEN_STORAGE_KEY = 'refreshToken';

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

    // Lưu token và user vào localStorage nếu token tồn tại
    if (token && user) {
      if (typeof window !== 'undefined') {
        localStorage.setItem(TOKEN_STORAGE_KEY, token);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      }
    } else {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        localStorage.removeItem(USER_STORAGE_KEY);
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
      localStorage.removeItem(USER_STORAGE_KEY);
      localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
    }
  },
}));

/**
 * Hàm giải mã token JWT và trích xuất thông tin user (fallback)
 */
export const decodeToken = (token: string): User | null => {
  try {
    const decoded = jwtDecode(token) as Record<string, unknown>;
    // Trích xuất thông tin user từ token - được sử dụng như backup
    return {
      id: (decoded.sub as string | undefined) || (decoded.id as string | undefined) || '',
      email: (decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] as string | undefined) || (decoded.email as string | undefined) || '',
      name: (decoded.name as string | undefined) || (decoded.userName as string | undefined) || '',
      phone: (decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/mobilephone'] as string | undefined) || (decoded.phone as string | undefined) || '',
      role: (decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] as string | undefined) || (decoded.role as string | undefined) || '',
    };
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

/**
 * Khôi phục auth state từ localStorage khi app khởi động
 * Ưu tiên sử dụng user data từ localStorage, fallback sang decode token
 */
export const restoreAuthFromStorage = () => {
  if (typeof window === 'undefined') return;

  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  const storedUser = localStorage.getItem(USER_STORAGE_KEY);
  
  if (token) {
    let user: User | null = null;
    
    // Ưu tiên sử dụng user data đã lưu từ response API
    if (storedUser) {
      try {
        user = JSON.parse(storedUser) as User;
      } catch (error) {
        console.error('Error parsing stored user:', error);
        // Fallback: decode từ token
        user = decodeToken(token);
      }
    } else {
      // Fallback: decode từ token nếu không có stored user
      user = decodeToken(token);
    }
    
    if (user) {
      const { setAuth } = useAuthStore.getState();
      setAuth(user, token);
    }
  }
};
