import axios from "axios";

import { API } from "@/src/constants/api";
import { useAuthStore } from "@/src/store/authStore";
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

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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
