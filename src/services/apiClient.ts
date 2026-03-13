import axios from "axios";

import { API } from "@/src/constants/api";
import { ROUTES } from "@/src/constants/routes";
import { useAuthStore, isTokenExpired } from "@/src/store/authStore";
import { toast } from "react-toastify";
import {
  ApiResponse,
  Restaurant,
  UpdateRestaurantLocationRequest,
} from "@/src/types/type";

const apiClient = axios.create({
  baseURL: API.BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const getAccessToken = () => {
  // Lấy token từ zustand store thay vì localStorage
  return useAuthStore.getState().token;
};

// Flag tránh rơi vào vòng lặp logout/redirect khi nhiều request cùng hết hạn
let isHandlingExpiry = false;

/**
 * Gọi khi token hết hạn hoặc server trả 401.
 * Xóa auth state, hiển thị thông báo, chuyển hướng về trang đăng nhập tương ứng.
 */
const handleTokenExpiry = () => {
  if (isHandlingExpiry) return;
  // Chỉ chạy phía client
  if (typeof window === 'undefined') return;

  isHandlingExpiry = true;

  const { token, logout, user } = useAuthStore.getState();
  if (token) {
    logout();
    toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.', {
      position: 'top-right',
      autoClose: 4000,
    });
    const isAdmin = user?.role?.toLowerCase() === 'administrator';
    window.location.href = isAdmin
      ? ROUTES.PAGES.PUBLIC.ADMIN_LOGIN
      : ROUTES.PAGES.PUBLIC.LOGIN;
  }

  // Reset flag sau 5 giây (đề phòng reload không xảy ra)
  setTimeout(() => {
    isHandlingExpiry = false;
  }, 5000);
};

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    // Kiểm tra hết hạn trước khi gửi request — tránh 401 không cần thiết
    if (isTokenExpired(token)) {
      handleTokenExpiry();
      return Promise.reject(new Error('Token hết hạn'));
    }
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Bắt 401 từ server (token không hợp lệ hoặc hết hạn theo phía BE)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      handleTokenExpiry();
    }
    return Promise.reject(error);
  },
);

export const updateRestaurantLocation = async (
  payload: UpdateRestaurantLocationRequest
): Promise<ApiResponse<Restaurant>> => {
  const formData = new FormData();
  formData.append("RestaurantName", payload.restaurantName);
  if (payload.address) formData.append("Address", payload.address);
  if (payload.phone) formData.append("Phone", payload.phone);
  if (payload.description) formData.append("Description", payload.description);
  formData.append("Latitude", payload.latitude.toString());
  formData.append("Longitude", payload.longitude.toString());

  const response = await apiClient.put<ApiResponse<Restaurant>>(
    API.RESTAURANT.UPDATE(payload.id.toString()),
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};

export default apiClient;
