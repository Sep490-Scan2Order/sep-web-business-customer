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
import {
  startGlobalLoading,
  stopGlobalLoading,
} from "@/src/store/globalLoadingStore";

const GLOBAL_LOADING_TRACKED_KEY = "__globalLoadingTracked";

type LoadingAwareRequestConfig = {
  skipGlobalLoading?: boolean;
  [GLOBAL_LOADING_TRACKED_KEY]?: boolean;
};

type ApiClientResponse<T = any> = {
  status: number;
  data: T;
};

type ApiClientConfig = LoadingAwareRequestConfig & {
  baseURL?: string;
  headers?: Record<string, string>;
  method?: string;
  url?: string;
  data?: unknown;
  params?: unknown;
};

type ApiClientLike = {
  get<T = any>(
    url: string,
    config?: ApiClientConfig,
  ): Promise<ApiClientResponse<T>>;
  post<T = any, D = any>(
    url: string,
    data?: D,
    config?: ApiClientConfig,
  ): Promise<ApiClientResponse<T>>;
  put<T = any, D = any>(
    url: string,
    data?: D,
    config?: ApiClientConfig,
  ): Promise<ApiClientResponse<T>>;
  delete<T = any>(
    url: string,
    config?: ApiClientConfig,
  ): Promise<ApiClientResponse<T>>;
  request<T = any, D = any>(
    config: ApiClientConfig & { data?: D },
  ): Promise<ApiClientResponse<T>>;
  interceptors: {
    request: {
      use(
        onFulfilled: (
          config: ApiClientConfig,
        ) => ApiClientConfig | Promise<ApiClientConfig>,
        onRejected?: (error: unknown) => unknown,
      ): number;
    };
    response: {
      use(
        onFulfilled: (
          response: ApiClientResponse<unknown> & { config: ApiClientConfig },
        ) => ApiClientResponse<unknown> | Promise<ApiClientResponse<unknown>>,
        onRejected?: (error: unknown) => unknown,
      ): number;
    };
  };
};

const apiClient = (axios as any).create({
  baseURL: API.BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
}) as ApiClientLike;

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
  if (typeof window === "undefined") return;

  isHandlingExpiry = true;

  const { token, logout, user } = useAuthStore.getState();
  if (token) {
    logout();
    toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.", {
      position: "top-right",
      autoClose: 4000,
    });
    const isAdmin = user?.role?.toLowerCase() === "administrator";
    window.location.href = isAdmin
      ? ROUTES.PAGES.PUBLIC.ADMIN_LOGIN
      : ROUTES.PAGES.PUBLIC.LOGIN;
  }

  // Reset flag sau 5 giây (đề phòng reload không xảy ra)
  setTimeout(() => {
    isHandlingExpiry = false;
  }, 5000);
};

apiClient.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      // Kiểm tra hết hạn trước khi gửi request — tránh 401 không cần thiết
      if (isTokenExpired(token)) {
        handleTokenExpiry();
        return Promise.reject(new Error("Token hết hạn"));
      }
      config.headers ??= {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    const loadingAwareConfig = config as typeof config &
      LoadingAwareRequestConfig;
    if (!loadingAwareConfig.skipGlobalLoading) {
      startGlobalLoading();
      loadingAwareConfig[GLOBAL_LOADING_TRACKED_KEY] = true;
    }

    return config;
  },
  (error: unknown) => {
    const loadingAwareConfig = (error as any)?.config as
      | (LoadingAwareRequestConfig & { [key: string]: unknown })
      | undefined;
    if (loadingAwareConfig?.[GLOBAL_LOADING_TRACKED_KEY]) {
      stopGlobalLoading();
      loadingAwareConfig[GLOBAL_LOADING_TRACKED_KEY] = false;
    }

    return Promise.reject(error);
  },
);

// Bắt 401 từ server (token không hợp lệ hoặc hết hạn theo phía BE)
apiClient.interceptors.response.use(
  (response) => {
    const loadingAwareConfig = response.config as typeof response.config &
      LoadingAwareRequestConfig;
    if (loadingAwareConfig[GLOBAL_LOADING_TRACKED_KEY]) {
      stopGlobalLoading();
      loadingAwareConfig[GLOBAL_LOADING_TRACKED_KEY] = false;
    }
    return response;
  },
  (error: unknown) => {
    const loadingAwareConfig = (error as any)?.config as
      | (LoadingAwareRequestConfig & { [key: string]: unknown })
      | undefined;
    if (loadingAwareConfig?.[GLOBAL_LOADING_TRACKED_KEY]) {
      stopGlobalLoading();
      loadingAwareConfig[GLOBAL_LOADING_TRACKED_KEY] = false;
    }

    if ((error as any)?.response?.status === 401) {
      handleTokenExpiry();
    }
    return Promise.reject(error);
  },
);

export const updateRestaurantLocation = async (
  payload: UpdateRestaurantLocationRequest,
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
    },
  );

  return response.data;
};

export default apiClient;
