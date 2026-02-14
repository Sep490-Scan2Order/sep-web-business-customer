import axios from "axios";

import { API } from "@/src/constants/api";
import { TOKEN_STORAGE_KEY } from "@/src/constants/constant";

const apiClient = axios.create({
  baseURL: API.BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const getAccessToken = () => {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem(TOKEN_STORAGE_KEY);
};

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
