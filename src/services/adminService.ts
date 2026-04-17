import { API } from "@/src/constants/api";
import apiClient from "@/src/services/apiClient";
import {
  ApiResponse,
  AdminSummaryMetrics,
  RevenueTrendItem,
  PlanDistributionItem,
  TopPerformingRestaurant,
  ExpiringSubscription,
  TopTenantItem,
  TenantDetailData,
  RevenueSummaryData,
  RevenueResponse,
  SubscriptionRevenueByPlan,
} from "@/src/types/type";

export const getSummaryMetrics = async (): Promise<AdminSummaryMetrics> => {
  const response = await apiClient.get<ApiResponse<AdminSummaryMetrics>>(
    API.ADMIN.SUMMARY_METRICS,
  );
  const payload = response.data;
  if (!payload.isSuccess || !payload.data) {
    throw new Error(payload.message || "Failed to fetch summary metrics");
  }
  return payload.data;
};

export const getRevenueTrends = async (
  months: number = 6,
): Promise<RevenueTrendItem[]> => {
  const response = await apiClient.get<ApiResponse<RevenueTrendItem[]>>(
    API.ADMIN.REVENUE_TRENDS(months),
  );
  const payload = response.data;
  if (!payload.isSuccess || !payload.data) {
    throw new Error(payload.message || "Failed to fetch revenue trends");
  }
  return payload.data;
};

export const getPlanDistribution = async (): Promise<
  PlanDistributionItem[]
> => {
  const response = await apiClient.get<ApiResponse<PlanDistributionItem[]>>(
    API.ADMIN.PLAN_DISTRIBUTION,
  );
  const payload = response.data;
  if (!payload.isSuccess || !payload.data) {
    throw new Error(payload.message || "Failed to fetch plan distribution");
  }
  return payload.data;
};

export const getTopPerformingRestaurants = async (
  top: number = 5,
): Promise<TopPerformingRestaurant[]> => {
  const response = await apiClient.get<ApiResponse<TopPerformingRestaurant[]>>(
    API.ADMIN.TOP_PERFORMING_RESTAURANTS(top),
  );
  const payload = response.data;
  if (!payload.isSuccess || !payload.data) {
    throw new Error(
      payload.message || "Failed to fetch top performing restaurants",
    );
  }
  return payload.data;
};

export const getExpiringSubscriptions = async (
  daysThreshold: number = 30,
): Promise<ExpiringSubscription[]> => {
  const response = await apiClient.get<ApiResponse<ExpiringSubscription[]>>(
    API.ADMIN.EXPIRING_SUBSCRIPTIONS(daysThreshold),
  );
  const payload = response.data;
  if (!payload.isSuccess || !payload.data) {
    throw new Error(
      payload.message || "Failed to fetch expiring subscriptions",
    );
  }
  return payload.data;
};

// ===== Drill-Down Dashboard =====

export const getTopTenants = async (
  top: number = 10,
): Promise<TopTenantItem[]> => {
  const response = await apiClient.get<ApiResponse<TopTenantItem[]>>(
    API.ADMIN.TOP_TENANTS(top),
  );
  const payload = response.data;
  if (!payload.isSuccess || !payload.data) {
    throw new Error(payload.message || "Failed to fetch top tenants");
  }
  return payload.data;
};

export const getTenantDetail = async (
  tenantId: string,
  startDate?: string,
  endDate?: string,
): Promise<TenantDetailData> => {
  const response = await apiClient.get<ApiResponse<TenantDetailData>>(
    API.ADMIN.TENANT_DETAIL(tenantId, startDate, endDate),
  );
  const payload = response.data;
  if (!payload.isSuccess || !payload.data) {
    throw new Error(payload.message || "Failed to fetch tenant detail");
  }
  return payload.data;
};

export const getRestaurantRevenueSummary = async (
  restaurantId: number,
  startDate?: string,
  endDate?: string,
): Promise<RevenueSummaryData> => {
  const response = await apiClient.get<ApiResponse<RevenueSummaryData>>(
    API.RESTAURANT.REVENUE_SUMMARY(restaurantId, startDate, endDate),
  );
  const payload = response.data;
  if (!payload.isSuccess || !payload.data) {
    throw new Error(payload.message || "Failed to fetch revenue summary");
  }
  return payload.data;
};

export const getSubscriptionRevenueTrends = async (
  months: number = 12,
): Promise<RevenueResponse["data"]> => {
  const response = await apiClient.get<RevenueResponse>(
    API.ADMIN.VIEW_REVENUE_SUBSCRIPTIONS(months),
  );
  const payload = response.data;

  if (!payload.isSuccess || !payload.data) {
    throw new Error(payload.message || "Failed to fetch subscription revenue");
  }

  return payload.data;
};

export const getCommissionRevenueTrends = async (
  months: number = 12,
): Promise<RevenueResponse["data"]> => {
  const response = await apiClient.get<RevenueResponse>(
    API.ADMIN.VIEW_REVENUE_COMSSION_FEE(months),
  );
  const payload = response.data;

  if (!payload.isSuccess || !payload.data) {
    throw new Error(payload.message || "Failed to fetch commission revenue");
  }

  return payload.data;
};

export const getSubscriptionRevenueByPlan = async (
  months: number = 12,
): Promise<SubscriptionRevenueByPlan["data"]> => {
  const response = await apiClient.get<SubscriptionRevenueByPlan>(
    API.ADMIN.VIEW_REVENUE_SUBSCRIPTIONS_BY_PLAN(months),
  );
  const payload = response.data;

  if (!payload.isSuccess || !payload.data) {
    throw new Error(
      payload.message || "Failed to fetch subscription revenue by plan",
    );
  }

  return payload.data;
};
