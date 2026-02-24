import { useEffect } from 'react';
import { restoreAuthFromStorage } from '@/src/store/authStore';

/**
 * Hook để khôi phục auth state từ localStorage khi app khởi động
 * Sử dụng trong root layout
 */
export const useInitializeAuth = () => {
  useEffect(() => {
    restoreAuthFromStorage();
  }, []);
};
