import { API } from "@/src/constants/api";
import apiClient from "@/src/services/apiClient";
import { ApiResponse, TenantDashboardRevenue, User, UserInfo } from "@/src/types/type";

type TenantByIdResponse = ApiResponse<UserInfo>;
type TenantDashboardRevenueResponse = ApiResponse<TenantDashboardRevenue>;

export type TenantDashboardPreset =
  | "allTime"
  | "today"
  | "last7days"
  | "last30days"
  | "thisMonth"
  | "thisYear";

export interface TenantDashboardFilter {
  tenantId?: string;
  preset?: TenantDashboardPreset;
  startDate?: string;
  endDate?: string;
}

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

export const getTenantDashboardRevenue = async (
  filter?: TenantDashboardFilter,
): Promise<TenantDashboardRevenue> => {
  const params = new URLSearchParams();

  if (filter?.tenantId) params.set("tenantId", filter.tenantId);
  if (filter?.preset) params.set("preset", filter.preset);
  if (filter?.startDate) params.set("startDate", filter.startDate);
  if (filter?.endDate) params.set("endDate", filter.endDate);

  const query = params.toString();
  const endpoint = query
    ? `${API.TENANT.DASHBOARD_REVENUE}?${query}`
    : API.TENANT.DASHBOARD_REVENUE;

  const response = await apiClient.get<TenantDashboardRevenueResponse>(endpoint);
  const payload = response.data;

  if (!payload.isSuccess || !payload.data) {
    throw new Error(payload.message || "Failed to fetch tenant dashboard revenue");
  }

  return payload.data;
};
