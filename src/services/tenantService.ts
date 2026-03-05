import { API } from "@/src/constants/api";
import apiClient from "@/src/services/apiClient";
import { ApiResponse, User, UserInfo } from "@/src/types/type";

type TenantByIdResponse = ApiResponse<UserInfo>;

export const getTenantById = async (tenantId: string): Promise<User> => {
  const response = await apiClient.get<TenantByIdResponse | UserInfo>(
    API.TENANT.GET_TENANT_BY_ID(tenantId),
  );

  const payload = response.data;

  if (payload && typeof payload === "object" && "isSuccess" in payload) {
    const apiResponse = payload as TenantByIdResponse;

    if (!apiResponse.isSuccess || !apiResponse.data) {
      throw new Error(apiResponse.message || "Failed to fetch tenant information");
    }

    return apiResponse.data as User;
  }

  return payload as User;
};
