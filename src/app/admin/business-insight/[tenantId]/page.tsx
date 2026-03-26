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
  const initials = r.restaurantName
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div
      onClick={onClick}
      className="bg-white border rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-indigo-300 cursor-pointer transition-all group"
    >
      <div className="h-36 bg-slate-100 overflow-hidden relative">
        {r.image ? (
          <img
            src={r.image}
            alt={r.restaurantName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-semibold text-sm">
              {initials || "NA"}
            </div>
          </div>
        )}
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
        <h4 className="font-semibold text-slate-800 truncate mb-1">
          {r.restaurantName}
        </h4>
        {r.address && (
          <p className="text-xs text-slate-500 truncate mb-3">
            {r.address}
          </p>
        )}
        {r.currentPlan && (
          <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full">
            {r.currentPlan}
          </span>
        )}

        <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-3 gap-1 text-center">
          <div>
            <p className="text-xs text-slate-400">Đơn hàng</p>
            <p className="text-sm font-semibold text-slate-700">
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
          <span className="text-slate-300 group-hover:text-indigo-500 transition-colors">
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
      <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-4">
        <nav className="flex items-center gap-2 text-sm text-slate-500">
          <button
            onClick={() => router.push("/admin/business-insight")}
            className="cursor-pointer hover:text-indigo-600 transition-colors"
          >
            Business Insight
          </button>
          <span>›</span>
          <span className="text-slate-800 font-medium">
            {data ? data.tenantName : tenantId}
          </span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-semibold text-lg">
              {data ? data.tenantName[0].toUpperCase() : "?"}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                {data ? data.tenantName : "Dang tai..."}
              </h1>
              {data && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    data.isSuspended
                      ? "bg-red-100 text-red-600"
                      : "bg-emerald-100 text-emerald-700"
                  }`}
                >
                  {data.isSuspended ? "Suspended" : "Active"}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={() => router.push("/admin/business-insight")}
            className="cursor-pointer text-sm text-indigo-600 hover:text-indigo-700 border border-indigo-200 px-4 py-2 rounded-lg hover:bg-indigo-50 transition-colors"
          >
            Quay lại
          </button>
        </div>

        <div className="flex flex-col md:flex-row md:items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="text-sm text-slate-700 bg-transparent outline-none border border-slate-300 rounded-lg px-3 py-1.5"
          />
          <span className="text-slate-400 hidden md:inline">→</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="text-sm text-slate-700 bg-transparent outline-none border border-slate-300 rounded-lg px-3 py-1.5"
          />
          <button
            onClick={fetchData}
            className="cursor-pointer md:ml-auto bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-2 rounded-lg transition-colors"
          >
            Lọc
          </button>
        </div>
      </div>

      {data && (
        <div className="bg-white border rounded-2xl shadow-sm p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-slate-50 rounded-xl px-4 py-3">
            <p className="text-xs text-slate-500">Tổng nhà hàng</p>
            <p className="text-lg font-bold text-slate-900">
              {data.restaurants.length}
            </p>
          </div>
          <div className="bg-slate-50 rounded-xl px-4 py-3">
            <p className="text-xs text-slate-500">Tổng đơn hàng</p>
            <p className="text-lg font-bold text-slate-900">
              {data.restaurants
                .reduce((s, r) => s + r.totalOrders, 0)
                .toLocaleString()}
            </p>
          </div>
          <div className="bg-slate-50 rounded-xl px-4 py-3">
            <p className="text-xs text-slate-500">Tổng doanh thu thực nhận</p>
            <p className="text-lg font-bold text-emerald-600">
              {formatVND(data.restaurants.reduce((s, r) => s + r.netRevenue, 0))}
            </p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-64 bg-gray-100 rounded-2xl animate-pulse"
            />
          ))}
        </div>
      ) : error ? (
        <div className="bg-white border rounded-2xl shadow-sm py-16 text-center text-red-500">
          <p>{error}</p>
          <button onClick={fetchData} className="mt-4 text-sm text-indigo-600 hover:underline cursor-pointer">
            Thu lại
          </button>
        </div>
      ) : data && data.restaurants.length === 0 ? (
        <div className="bg-white border rounded-2xl shadow-sm py-16 text-center text-gray-400">
          <p>Tenant này chưa có nhà hàng nào trong khoảng thời gian đã chọn.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
