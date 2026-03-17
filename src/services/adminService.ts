import { API } from "@/src/constants/api";
import apiClient from "@/src/services/apiClient";
import {
  ApiResponse,
  AdminSummaryMetrics,
  RevenueTrendItem,
  PlanDistributionItem,
  TopPerformingRestaurant,
  ExpiringSubscription,
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
  const response = await apiClient.get<
    ApiResponse<TopPerformingRestaurant[]>
  >(API.ADMIN.TOP_PERFORMING_RESTAURANTS(top));
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
