"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";
import { getRestaurantRevenueSummary } from "@/src/services/adminService";
import { RevenueSummaryData } from "@/src/types/type";
import RestaurantRevenueCards from "@/src/components/ui/admin/stat-cards/RestaurantRevenueCards";
import PaymentMethodPieChart from "@/src/components/ui/admin/charts/PaymentMethodPieChart";
import TopDishesTable from "@/src/components/ui/admin/tables/TopDishesTable";

export default function RestaurantRevenuePage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const tenantId = params.tenantId as string;
  const restaurantId = Number(params.restaurantId);

  // Inherit dates from Cấp 2 if passed via query params
  const defaultEnd = new Date().toISOString().split("T")[0];
  const defaultStart = new Date(Date.now() - 30 * 86400000)
    .toISOString()
    .split("T")[0];

  const startDateParam = searchParams.get("startDate") ?? defaultStart;
  const endDateParam = searchParams.get("endDate") ?? defaultEnd;

  const [data, setData] = useState<RevenueSummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getRestaurantRevenueSummary(
      restaurantId,
      new Date(startDateParam).toISOString(),
      new Date(endDateParam + "T23:59:59").toISOString(),
    )
      .then(setData)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Có lỗi xảy ra"),
      )
      .finally(() => setLoading(false));
  }, [restaurantId, startDateParam, endDateParam]);

  const formatVND = (v: number) => v.toLocaleString("vi-VN") + " ₫";

  const orderTypeChartData = data
    ? [
        {
          name: "Đơn thường",
          revenue: data.orderTypes.regular.revenue,
          count: data.orderTypes.regular.count,
          fill: "#6366f1",
        },
        {
          name: "Hoàn tiền",
          revenue: data.orderTypes.refund.revenue,
          count: data.orderTypes.refund.count,
          fill: "#f43f5e",
        },
      ]
    : [];

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
        <button
          onClick={() => router.back()}
          className="hover:text-indigo-600 transition-colors"
        >
          Chi nhánh
        </button>
        <span>›</span>
        <span className="text-slate-800 dark:text-slate-100 font-medium">
          Nhà hàng #{restaurantId}
        </span>
      </nav>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Chi tiết doanh thu
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {startDateParam} → {endDateParam}
          </p>
        </div>
        <button
          onClick={() => router.back()}
          className="text-sm text-indigo-600 hover:text-indigo-700 border border-indigo-200 px-4 py-2 rounded-lg hover:bg-indigo-50 transition-colors"
        >
          ← Quay lại
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-24 bg-gray-100 dark:bg-zinc-800 rounded-2xl animate-pulse"
              />
            ))}
          </div>
          <div className="h-64 bg-gray-100 dark:bg-zinc-800 rounded-2xl animate-pulse" />
        </div>
      ) : error ? (
        <div className="py-16 text-center text-red-500">
          <div className="text-4xl mb-3">⚠️</div>
          <p>{error}</p>
        </div>
      ) : data ? (
        <>
          {/* Stat Cards */}
          <RestaurantRevenueCards data={data.summary} />

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Payment method pie chart */}
            <div className="lg:col-span-1">
              <PaymentMethodPieChart data={data.paymentMethods} />
            </div>

            {/* Order types bar chart */}
            <div className="lg:col-span-2 bg-white dark:bg-zinc-900 p-6 rounded-2xl border shadow-sm">
              <h4 className="font-semibold text-slate-800 dark:text-slate-100 mb-1">
                Phân loại đơn hàng
              </h4>
              <p className="text-xs text-slate-500 mb-4">
                Đơn thường vs Hoàn tiền
              </p>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={orderTypeChartData}
                  margin={{ top: 4, right: 20, left: 0, bottom: 4 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis
                    tickFormatter={(v) => (v / 1_000_000).toFixed(1) + "M"}
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip
                    formatter={(value, name) => {
                      if (name === "revenue")
                        return [formatVND(Number(value)), "Doanh thu"];
                      return [value, name];
                    }}
                  />
                  <Bar dataKey="revenue" radius={[6, 6, 0, 0]} name="revenue">
                    {orderTypeChartData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>

              {/* Count summary */}
              <div className="mt-4 grid grid-cols-2 gap-4">
                {orderTypeChartData.map((d) => (
                  <div
                    key={d.name}
                    className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-zinc-800"
                  >
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: d.fill }}
                    />
                    <div>
                      <p className="text-xs text-slate-500">{d.name}</p>
                      <p className="font-semibold text-slate-700 dark:text-slate-200 text-sm">
                        {d.count.toLocaleString()} đơn
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Selling Dishes */}
          <TopDishesTable dishes={data.topSellingDishes} />
        </>
      ) : null}
    </div>
  );
}
