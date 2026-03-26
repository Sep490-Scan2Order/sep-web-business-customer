import { TenantDashboardRevenue } from "@/src/types/type";

export const formatVnd = (value: number) => `${value.toLocaleString("vi-VN")} ₫`;

export const getDateInputValue = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const toUtcDateString = (dateValue: string, isEnd: boolean) => {
  if (!dateValue) return undefined;
  return isEnd ? `${dateValue}T23:59:59.999Z` : `${dateValue}T00:00:00.000Z`;
};

export const getDashboardFilterSummary = (dashboardData: TenantDashboardRevenue | null) => {
  if (!dashboardData) return "";
  if (dashboardData.isAllTime) return "All-time";

  if (dashboardData.startDate && dashboardData.endDate) {
    const from = new Date(dashboardData.startDate).toLocaleDateString("vi-VN");
    const to = new Date(dashboardData.endDate).toLocaleDateString("vi-VN");
    return `${from} - ${to}`;
  }

  return dashboardData.filterPreset;
};
