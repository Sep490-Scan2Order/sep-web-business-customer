"use client";

import apiClient from "@/src/services/apiClient";
import { API } from "@/src/constants/api";
import { ApiResponse, ConfigurationResponse, UpdateConfigurationRequest } from "@/src/types/type";

export const configurationService = {
  getAll: async (): Promise<ApiResponse<ConfigurationResponse>> => {
    const res = await apiClient.get<ApiResponse<ConfigurationResponse>>(
      API.CONFIGURATION.GET_ALL
    );
    return res.data;
  },

  update: async (
    id: number,
    payload: UpdateConfigurationRequest
  ): Promise<ApiResponse<ConfigurationResponse>> => {
    const res = await apiClient.put<ApiResponse<ConfigurationResponse>>(
      API.CONFIGURATION.UPDATE(id),
      payload
    );
    return res.data;
  },
};

