"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import {
  PieChart,
  Pie,
  Tooltip,
  ResponsiveContainer,
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

  const orderTypeChartData = useMemo(() => {
    if (!data) return [];
    const stats: { name: string; value: number; color: string }[] = [
      {
        name: "Đơn thành công",
        value: data.orderTypes.regular.revenue,
        color: "#10b981",
      },
    ];

    const { refund } = data.orderTypes;
    if (refund.objective && refund.objective.revenue > 0) {
      stats.push({
        name: "Hoàn tiền (Khách quan)",
        value: refund.objective.revenue,
        color: "#f59e0b",
      });
    }
    if (refund.staffError && refund.staffError.revenue > 0) {
      stats.push({
        name: "Hoàn tiền (Lỗi NV)",
        value: refund.staffError.revenue,
        color: "#ef4444",
      });
    }
    if (refund.systemError && refund.systemError.revenue > 0) {
      stats.push({
        name: "Hoàn tiền (Lỗi HT)",
        value: refund.systemError.revenue,
        color: "#6366f1",
      });
    }

    if (stats.length === 1 && refund.revenue > 0) {
      stats.push({
        name: "Hoàn tiền",
        value: refund.revenue,
        color: "#f43f5e",
      });
    }

    return stats;
  }, [data]);

  return (
    <div className="p-6 space-y-6">
      <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-4">
        <nav className="flex items-center gap-2 text-sm text-slate-500">
          <button
            onClick={() => router.push("/admin/business-insight")}
            className="cursor-pointer hover:text-indigo-600 transition-colors"
          >
            Phân tích kinh doanh
          </button>
          <span>›</span>
          <button
            onClick={() => router.back()}
            className="cursor-pointer hover:text-indigo-600 transition-colors"
          >
            Chi tiết tenant
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
              <div className="h-80 flex flex-col md:flex-row items-center gap-6">
                <div className="w-full md:w-1/2 h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={orderTypeChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={100}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {orderTypeChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(val: any) => [formatVND(Number(val || 0)), "Doanh thu"]}
                        contentStyle={{
                          borderRadius: "12px",
                          border: "none",
                          boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-full md:w-1/2 space-y-3">
                  {orderTypeChartData.map((item, index) => (
                    <div
                      key={`order-type-list-${index}`}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100/50"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        ></div>
                        <span className="text-sm font-medium text-slate-600">
                          {item.name}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-slate-800">
                        {formatVND(item.value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <TopDishesTable dishes={data.topSellingDishes} />
        </>
      ) : null}
    </div>
  );
}
