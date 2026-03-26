"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { getTenantDetail } from "@/src/services/adminService";
import { TenantDetailData, TenantDetailRestaurant } from "@/src/types/type";

/* Format helpers */
const formatVND = (v: number) => v.toLocaleString("vi-VN") + " ₫";

function RestaurantCard({
  r,
  onClick,
}: {
  r: TenantDetailRestaurant;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="bg-white dark:bg-zinc-900 border rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-500 cursor-pointer transition-all group"
    >
      {/* Image */}
      <div className="h-36 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-zinc-800 dark:to-zinc-700 overflow-hidden relative">
        {r.image ? (
          <img
            src={r.image}
            alt={r.restaurantName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl">
            🍽️
          </div>
        )}
        {/* Active badge */}
        <span
          className={`absolute top-3 right-3 text-xs px-2 py-0.5 rounded-full font-medium ${
            r.isActive
              ? "bg-emerald-100 text-emerald-700"
              : "bg-red-100 text-red-600"
          }`}
        >
          {r.isActive ? "Active" : "Inactive"}
        </span>
      </div>

      <div className="p-4">
        <h4 className="font-semibold text-slate-800 dark:text-slate-100 truncate mb-1">
          {r.restaurantName}
        </h4>
        {r.address && (
          <p className="text-xs text-slate-500 truncate mb-3">
            📍 {r.address}
          </p>
        )}
        {r.currentPlan && (
          <span className="text-xs bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 px-2 py-0.5 rounded-full">
            {r.currentPlan}
          </span>
        )}

        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-zinc-700 grid grid-cols-3 gap-1 text-center">
          <div>
            <p className="text-xs text-slate-400">Đơn hàng</p>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              {r.totalOrders.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Doanh thu</p>
            <p className="text-sm font-semibold text-emerald-600">
              {r.netRevenue >= 1_000_000
                ? (r.netRevenue / 1_000_000).toFixed(1) + "M ₫"
                : formatVND(r.netRevenue)}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Giảm giá</p>
            <p className="text-sm font-semibold text-amber-600">
              {r.totalDiscount >= 1_000_000
                ? (r.totalDiscount / 1_000_000).toFixed(1) + "M ₫"
                : formatVND(r.totalDiscount)}
            </p>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-slate-400">Click để xem chi tiết</span>
          <span className="text-slate-300 dark:text-zinc-600 group-hover:text-indigo-500 transition-colors">
            →
          </span>
        </div>
      </div>
    </div>
  );
}

export default function TenantDetailPage() {
  const router = useRouter();
  const params = useParams();
  const tenantId = params.tenantId as string;

  // Default: last 30 days
  const defaultEnd = new Date();
  const defaultStart = new Date();
  defaultStart.setDate(defaultStart.getDate() - 30);

  const toDateInput = (d: Date) => d.toISOString().split("T")[0];

  const [startDate, setStartDate] = useState(toDateInput(defaultStart));
  const [endDate, setEndDate] = useState(toDateInput(defaultEnd));
  const [data, setData] = useState<TenantDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getTenantDetail(
        tenantId,
        new Date(startDate).toISOString(),
        new Date(endDate + "T23:59:59").toISOString(),
      );
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  }, [tenantId, startDate, endDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRestaurantClick = (restaurantId: number) => {
    router.push(
      `/admin/business-insight/${tenantId}/${restaurantId}?startDate=${startDate}&endDate=${endDate}`,
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-500">
        <button
          onClick={() => router.push("/admin/business-insight")}
          className="hover:text-indigo-600 transition-colors"
        >
          Business Insight
        </button>
        <span>›</span>
        <span className="text-slate-800 dark:text-slate-100 font-medium">
          {data ? data.tenantName : tenantId}
        </span>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow">
            {data ? data.tenantName[0].toUpperCase() : "?"}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {data ? data.tenantName : "Đang tải..."}
            </h1>
            {data && (
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  data.isSuspended
                    ? "bg-red-100 text-red-600"
                    : "bg-emerald-100 text-emerald-700"
                }`}
              >
                {data.isSuspended ? "⛔ Suspended" : "✅ Active"}
              </span>
            )}
          </div>
        </div>

        {/* Date Range Picker */}
        <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 border rounded-xl px-4 py-2 shadow-sm">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="text-sm text-slate-700 dark:text-slate-300 bg-transparent outline-none"
          />
          <span className="text-slate-400">→</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="text-sm text-slate-700 dark:text-slate-300 bg-transparent outline-none"
          />
          <button
            onClick={fetchData}
            className="ml-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-3 py-1.5 rounded-lg transition-colors"
          >
            Lọc
          </button>
        </div>
      </div>

      {/* Summary bar */}
      {data && (
        <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/30 rounded-2xl p-4 flex flex-wrap gap-6">
          <div>
            <p className="text-xs text-slate-500">Tổng nhà hàng</p>
            <p className="text-lg font-bold text-indigo-700 dark:text-indigo-300">
              {data.restaurants.length}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Tổng đơn hàng</p>
            <p className="text-lg font-bold text-indigo-700 dark:text-indigo-300">
              {data.restaurants
                .reduce((s, r) => s + r.totalOrders, 0)
                .toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Tổng doanh thu thực nhận</p>
            <p className="text-lg font-bold text-emerald-600">
              {formatVND(data.restaurants.reduce((s, r) => s + r.netRevenue, 0))}
            </p>
          </div>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-64 bg-gray-100 dark:bg-zinc-800 rounded-2xl animate-pulse"
            />
          ))}
        </div>
      ) : error ? (
        <div className="py-16 text-center text-red-500">
          <div className="text-4xl mb-3">⚠️</div>
          <p>{error}</p>
          <button
            onClick={fetchData}
            className="mt-4 text-sm text-indigo-600 hover:underline"
          >
            Thử lại
          </button>
        </div>
      ) : data && data.restaurants.length === 0 ? (
        <div className="py-16 text-center text-gray-400">
          <div className="text-4xl mb-3">🏪</div>
          <p>Tenant này chưa có nhà hàng nào trong khoảng thời gian đã chọn.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data?.restaurants.map((r) => (
            <RestaurantCard
              key={r.restaurantId}
              r={r}
              onClick={() => handleRestaurantClick(r.restaurantId)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
