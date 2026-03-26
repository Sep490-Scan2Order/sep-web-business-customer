"use client";
import TenantVerifyBankModelPopup from "@/src/components/ui/tenant/TenantVerifyBankModelPopup";
import VerifyTaxModelPopUp, {
  TenantTaxInfo,
} from "@/src/components/ui/tenant/VerifyTaxModelPopUp";
import { API } from "@/src/constants/api";
import { useRealtime } from "@/src/hooks/useRealtime";
import apiClient from "@/src/services/apiClient";
import {
  getTenantDashboardRevenue,
  TenantDashboardFilter,
  TenantDashboardPreset,
} from "@/src/services/tenantService";
import { TenantDashboardRevenue, UserInfo } from "@/src/types/type";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { useAuth } from "@/src/hooks/useAuth";
import DashboardAnalyticsSection from "./components/DashboardAnalyticsSection";
import DashboardFilterPanel from "./components/DashboardFilterPanel";
import DashboardLoadingSkeleton from "./components/DashboardLoadingSkeleton";
import DashboardRestaurantsTable from "./components/DashboardRestaurantsTable";
import DashboardStatsGrid from "./components/DashboardStatsGrid";
import DashboardSummaryBar from "./components/DashboardSummaryBar";
import {
  getDashboardFilterSummary,
  getDateInputValue,
  toUtcDateString,
} from "./components/dashboardUtils";

const presetOptions: Array<{ label: string; value: TenantDashboardPreset }> = [
  { label: "All time", value: "allTime" },
  { label: "Hôm nay", value: "today" },
  { label: "7 ngày", value: "last7days" },
  { label: "30 ngày", value: "last30days" },
  { label: "Tháng này", value: "thisMonth" },
  { label: "Năm nay", value: "thisYear" },
];

export default function DashboardPage() {
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showBankModal, setShowBankModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDashboardLoading, setIsDashboardLoading] = useState(false);
  const [dashboardError, setDashboardError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<TenantDashboardRevenue | null>(null);

  const [selectedPreset, setSelectedPreset] = useState<TenantDashboardPreset>("allTime");
  const [startDate, setStartDate] = useState(getDateInputValue(new Date(new Date().setDate(new Date().getDate() - 29))));
  const [endDate, setEndDate] = useState(getDateInputValue(new Date()));

  const { user, refreshUserInfo } = useAuth();
  const tenantInfo = (user ?? null) as UserInfo | null;

  const loadDashboard = useCallback(
    async (filter?: TenantDashboardFilter) => {
      setIsDashboardLoading(true);
      setDashboardError(null);
      try {
        const result = await getTenantDashboardRevenue(filter);
        setDashboardData(result);
      } catch (error) {
        const message =
          (error as { response?: { data?: { message?: string } } }).response?.data?.message ||
          (error as { message?: string }).message ||
          "Không tải được dữ liệu dashboard";
        setDashboardError(message);
      } finally {
        setIsDashboardLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    loadDashboard({ preset: "allTime" });
  }, [loadDashboard]);

  useRealtime({
    tenantId: tenantInfo?.id,
    onProfileChanged: async () => {
      await refreshUserInfo();
      toast.success("Đã xác thực tài khoản ngân hàng thành công");
      loadDashboard({ preset: selectedPreset });
    },
  });

  const handleSubmit = async (info: TenantTaxInfo) => {
    setIsLoading(true);
    try {
      const response = await apiClient.put(
        `${API.TENANT.TAX_VALIDATION}${encodeURIComponent(info.taxCode)}`,
      );
      if (response.data.isSuccess === true) {
        await refreshUserInfo();
        toast.success("Mã số thuế hợp lệ. Vui lòng cập nhật tài khoản ngân hàng để nhận QR xác thực.");
        setShowInfoModal(false);
        setShowBankModal(true);
      } else {
        toast.error("Xác nhận mã số thuế thất bại: " + response.data.message);
      }
    } catch (error) {
      console.error("Error validating tax:", error);
      const backendMessage = (error as { response?: { data?: { message?: string } } }).response?.data?.message;
      toast.error(
        backendMessage || (error as { message?: string }).message || "Có lỗi xảy ra trong quá trình xác nhận mã số thuế!"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!tenantInfo) {
      return;
    }

    if (!tenantInfo.taxNumber) {
      setShowInfoModal(true);
      setShowBankModal(false);
      return;
    }

    if (!tenantInfo.isVerifyBank) {
      setShowInfoModal(false);
      setShowBankModal(true);
      return;
    }

    setShowInfoModal(false);
    setShowBankModal(false);
  }, [tenantInfo]);

  const chartData = useMemo(() => {
    if (!dashboardData) return [];
    return [...dashboardData.restaurants]
      .sort((a, b) => b.netRevenue - a.netRevenue)
      .slice(0, 6)
      .map((restaurant) => ({
        name: restaurant.restaurantName,
        revenue: restaurant.netRevenue,
      }));
  }, [dashboardData]);

  const handleApplyFilter = async () => {
    if (selectedPreset === "allTime") {
      await loadDashboard({ preset: "allTime" });
      return;
    }

    await loadDashboard({ preset: selectedPreset });
  };

  const handleApplyCustomRange = async () => {
    if (!startDate || !endDate) {
      toast.warn("Vui lòng chọn đủ ngày bắt đầu và kết thúc");
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      toast.warn("Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu");
      return;
    }

    await loadDashboard({
      startDate: toUtcDateString(startDate, false),
      endDate: toUtcDateString(endDate, true),
    });
  };

  const sortedRestaurants = useMemo(() => {
    if (!dashboardData) return [];
    return [...dashboardData.restaurants].sort((a, b) => b.netRevenue - a.netRevenue);
  }, [dashboardData]);

  const filterSummary = useMemo(() => {
    return getDashboardFilterSummary(dashboardData);
  }, [dashboardData]);

  return (
    <div className="space-y-6">
      <VerifyTaxModelPopUp
        isOpen={showInfoModal}
        onClose={() => setShowInfoModal(false)}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
      <TenantVerifyBankModelPopup
        isOpen={showBankModal}
        onClose={() => setShowBankModal(false)}
        onSubmit={() => {
          // QR flow is handled inside modal. Backend webhook will push ProfileChanged.
        }}
        isLoading={isLoading}
      />

      <DashboardFilterPanel
        selectedPreset={selectedPreset}
        startDate={startDate}
        endDate={endDate}
        isDashboardLoading={isDashboardLoading}
        presetOptions={presetOptions}
        onPresetChange={setSelectedPreset}
        onApplyPreset={handleApplyFilter}
        onReload={() => loadDashboard({ preset: "allTime" })}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onApplyCustomRange={handleApplyCustomRange}
      />

      {dashboardError ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {dashboardError}
        </div>
      ) : null}

      {isDashboardLoading && !dashboardData ? <DashboardLoadingSkeleton /> : null}

      {dashboardData ? (
        <>
          <DashboardSummaryBar
            tenantName={dashboardData.tenantName}
            filterSummary={filterSummary}
          />

          <DashboardStatsGrid dashboardData={dashboardData} />

          <DashboardAnalyticsSection
            chartData={chartData}
            dashboardData={dashboardData}
          />

          <DashboardRestaurantsTable restaurants={sortedRestaurants} />
        </>
      ) : null}
    </div>
  );
}
