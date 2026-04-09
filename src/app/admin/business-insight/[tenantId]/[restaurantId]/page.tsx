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
import { Package } from "lucide-react";
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
  const [startDate, setStartDate] = useState(startDateParam);
  const [endDate, setEndDate] = useState(endDateParam);

  const [data, setData] = useState<RevenueSummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const applyFilter = () => {
    router.push(
      `/admin/business-insight/${tenantId}/${restaurantId}?startDate=${startDate}&endDate=${endDate}`,
    );
  };

  useEffect(() => {
    setLoading(true);
    setError(null);
    getRestaurantRevenueSummary(
      restaurantId,
      new Date(startDate).toISOString(),
      new Date(endDate + "T23:59:59").toISOString(),
    )
      .then(setData)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Có lỗi xảy ra"),
      )
      .finally(() => setLoading(false));
  }, [restaurantId, startDate, endDate]);

  const formatVND = (v: number) => v.toLocaleString("vi-VN") + " ₫";

  const orderTypeChartData = data
    ? [
        {
          name: "Đơn hàng thường",
          revenue: data.orderTypes.regular.revenue,
          count: data.orderTypes.regular.count,
          fill: "#10b981",
        },
        ...(data.summary.totalRefund > 0 || data.orderTypes.refund.count > 0
          ? [
              {
                name: "Hoàn tiền",
                revenue: data.summary.totalRefund,
                count: data.orderTypes.refund.count,
                fill: "#f43f5e",
              },
            ]
          : []),
      ]
    : [];

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
          <button
            onClick={() => router.back()}
            className="cursor-pointer hover:text-indigo-600 transition-colors"
          >
            Tenant
          </button>
          <span>›</span>
          <span className="text-slate-800 font-medium">Nhà hàng #{restaurantId}</span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Chi tiết doanh thu</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {startDate} → {endDate}
            </p>
          </div>
          <button
            onClick={() => router.back()}
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
            onClick={applyFilter}
            className="cursor-pointer md:ml-auto bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-2 rounded-lg transition-colors"
          >
            Lọc
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-24 bg-gray-100 rounded-2xl animate-pulse"
              />
            ))}
          </div>
          <div className="h-64 bg-gray-100 rounded-2xl animate-pulse" />
        </div>
      ) : error ? (
        <div className="bg-white border rounded-2xl shadow-sm py-16 text-center text-red-500">
          <p>{error}</p>
        </div>
      ) : data ? (
        <>
          <RestaurantRevenueCards data={data.summary} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <PaymentMethodPieChart data={data.paymentMethods} />
            </div>

            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border shadow-sm">
              <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">
                <Package className="w-5 h-5 text-emerald-500" />
                Phân tích loại đơn hàng
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={orderTypeChartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#64748b", fontSize: 12 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#64748b", fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "12px",
                        border: "none",
                        boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                      }}
                      cursor={{ fill: "#f8fafc" }}
                      formatter={(value, name) => {
                        if (name === "Doanh thu") return [formatVND(Number(value)), "Doanh thu"];
                        return [value, name];
                      }}
                    />
                    <Bar
                      dataKey="revenue"
                      name="Doanh thu"
                      radius={[6, 6, 0, 0]}
                      barSize={40}
                    >
                      {orderTypeChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <TopDishesTable dishes={data.topSellingDishes} />
        </>
      ) : null}
    </div>
  );
}
