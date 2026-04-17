"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useRouter } from "next/navigation";
import {
  TrendingUp,
  ShoppingBag,
  CreditCard,
  Banknote,
  ArrowDownRight,
  Package,
  Utensils,
} from "lucide-react";
import { RevenueSummaryData } from "@/src/types/type";
import apiClient from "@/src/services/apiClient";
import { API } from "@/src/constants/api";
import { formatMoney, formatNumber } from "./tenantInfoFormatters";
import { toast } from "react-toastify";
import { getDateInputValue, toUtcDateString } from "@/src/app/tenant/dashboard/components/dashboardUtils";

interface RevenueSummaryProps {
  restaurantId: number;
}

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function RevenueSummary({ restaurantId }: RevenueSummaryProps) {
  const router = useRouter();
  const [data, setData] = useState<RevenueSummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("today");

  const fetchRevenueSummary = async (startDate?: string, endDate?: string) => {
    setLoading(true);
    const url = API.RESTAURANT.REVENUE_SUMMARY(restaurantId, startDate, endDate);
    console.log("Fetching revenue summary:", { dateRange, startDate, endDate, url });
    try {
      const response = await apiClient.get(url);
      if (response.data.isSuccess) {
        setData(response.data.data);
      } else {
        toast.error(response.data.message || "Không thể tải dữ liệu doanh thu");
      }
    } catch (error) {
      console.error("Lỗi khi tải tổng quan doanh thu:", error);
      toast.error("Có lỗi xảy ra khi tải dữ liệu doanh thu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (restaurantId) {
      let start: string | undefined;
      let end: string | undefined;

      const now = new Date();
      if (dateRange === "today") {
        const todayStr = getDateInputValue(now);
        start = toUtcDateString(todayStr, false);
        end = toUtcDateString(todayStr, true);
      } else if (dateRange === "week") {
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        start = toUtcDateString(getDateInputValue(weekAgo), false);
        end = toUtcDateString(getDateInputValue(now), true);
      } else if (dateRange === "month") {
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        start = toUtcDateString(getDateInputValue(monthStart), false);
        end = toUtcDateString(getDateInputValue(now), true);
      } else {
        // "all" range - no dates
        start = undefined;
        end = undefined;
      }

      fetchRevenueSummary(start, end);
    }
  }, [restaurantId, dateRange]);

  const paymentData = useMemo(() => {
    if (!data) return [];
    return [
      { name: "Tiền mặt", value: data.paymentMethods.cash },
      { name: "Chuyển khoản", value: data.paymentMethods.transfer },
    ];
  }, [data]);

  const orderTypeData = useMemo(() => {
    if (!data) return [];
    const stats: any[] = [
      {
        name: "Đơn thành công",
        value: data.orderTypes.regular.revenue,
        color: "#10b981",
        typeOrder: 0,
        status: 4,
      },
    ];

    const { refund } = data.orderTypes;
    if (refund.objective && refund.objective.revenue > 0) {
      stats.push({
        name: "Hoàn tiền (Khách quan)",
        value: refund.objective.revenue,
        color: "#f59e0b",
        typeOrder: 1,
        refundType: 0,
        status: 5,
      });
    }
    if (refund.staffError && refund.staffError.revenue > 0) {
      stats.push({
        name: "Hoàn tiền (Lỗi NV)",
        value: refund.staffError.revenue,
        color: "#ef4444",
        typeOrder: 1,
        refundType: 1,
        status: 5,
      });
    }
    if (refund.systemError && refund.systemError.revenue > 0) {
      stats.push({
        name: "Hoàn tiền (Lỗi HT)",
        value: refund.systemError.revenue,
        color: "#6366f1",
        typeOrder: 1,
        refundType: 2,
        status: 5,
      });
    }

    if (stats.length === 1 && refund.revenue > 0) {
      stats.push({
        name: "Hoàn tiền",
        value: refund.revenue,
        color: "#f43f5e",
        typeOrder: 1,
        status: 5,
      });
    }

    return stats;
  }, [data]);

  const handleChartClick = (entry: any) => {
    if (!data || !entry) return;

    const params = new URLSearchParams();
    params.set("restaurantId", restaurantId.toString());

    // Lấy data từ payload của Recharts để chính xác nhất
    const payload = entry.payload || entry;

    if (payload.typeOrder !== undefined)
      params.set("typeOrder", payload.typeOrder.toString());
    if (payload.status !== undefined)
      params.set("status", payload.status.toString());
    if (payload.refundType !== undefined)
      params.set("refundType", payload.refundType.toString());

    params.set("fromDate", data.period.startDate.split("T")[0]);
    params.set("toDate", data.period.endDate.split("T")[0]);

    router.push(`/tenant/orders?${params.toString()}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            Tổng quan doanh thu
          </h2>
          <p className="text-slate-500 text-sm">
            Báo cáo từ{" "}
            {new Date(data.period.startDate).toLocaleDateString("vi-VN")} đến{" "}
            {new Date(data.period.endDate).toLocaleDateString("vi-VN")}
          </p>
        </div>
        <div className="flex items-center bg-white rounded-xl shadow-sm border border-slate-100 p-1">
          {["today", "week", "month", "all"].map((range) => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${
                dateRange === range
                  ? "bg-emerald-500 text-white shadow-md"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              {range === "today"
                ? "Hôm nay"
                : range === "week"
                  ? "Tuần này"
                  : range === "month"
                    ? "Tháng này"
                    : "Tất cả"}
            </button>
          ))}
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Tổng doanh thu (gộp)"
          value={formatMoney(data.summary.grossRevenue)}
          icon={<TrendingUp className="w-5 h-5 text-emerald-600" />}
          color="bg-emerald-50 text-emerald-600"
        />
        <MetricCard
          title="Doanh thu thuần"
          value={formatMoney(data.summary.netRevenue)}
          icon={<Banknote className="w-5 h-5 text-blue-600" />}
          color="bg-blue-50 text-blue-600"
        />
        <MetricCard
          title="Tổng số đơn hàng"
          value={formatNumber(data.summary.totalOrders)}
          icon={<ShoppingBag className="w-5 h-5 text-amber-600" />}
          color="bg-amber-50 text-amber-600"
        />
        <MetricCard
          title="Giá trị đơn trung bình"
          value={formatMoney(data.summary.averageOrderValue)}
          icon={<CreditCard className="w-5 h-5 text-purple-600" />}
          color="bg-purple-50 text-purple-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Phân tích loại đơn hàng */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">
            <Package className="w-5 h-5 text-emerald-500" /> Phân tích loại đơn
            hàng
          </h3>
          <div className="h-80 flex flex-col md:flex-row items-center gap-6">
            <div className="w-full md:w-1/2 h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={orderTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={4}
                    dataKey="value"
                    onClick={handleChartClick}
                    className="cursor-pointer"
                  >
                    {orderTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => formatMoney(Number(val || 0))}
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
              {orderTypeData.map((item, index) => (
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
                    {formatMoney(item.value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Phương thức thanh toán */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-blue-500" /> Phương thức thanh
            toán
          </h3>
          <div className="h-80 flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={paymentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {paymentData.map((entry, index) => (
                    <Cell
                      key={`pay-cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => formatMoney(Number(val || 0))}
                />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 w-full space-y-2">
              {paymentData.map((item, index) => (
                <div
                  key={`pay-list-${index}`}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    ></div>
                    <span className="text-slate-600">{item.name}</span>
                  </div>
                  <span className="font-semibold text-slate-800">
                    {formatMoney(item.value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Selling Dishes */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <Utensils className="w-5 h-5 text-rose-500" /> Món ăn bán chạy
              nhất
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-slate-400 text-xs uppercase tracking-wider">
                  <th className="pb-4 font-semibold">Tên món</th>
                  <th className="pb-4 font-semibold text-center">Số lượng</th>
                  <th className="pb-4 font-semibold text-right">Doanh thu</th>
                  <th className="pb-4 font-semibold text-right">Tỷ trọng</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {data.topSellingDishes.map((dish, index) => {
                  const percentage =
                    (dish.revenue / (data.summary.grossRevenue || 1)) * 100;
                  return (
                    <tr
                      key={dish.dishId}
                      className="group hover:bg-slate-50 transition-colors"
                    >
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs">
                            {index + 1}
                          </div>
                          <span className="font-medium text-slate-700 group-hover:text-emerald-600 transition-colors">
                            {dish.dishName}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 text-center font-medium text-slate-600">
                        {dish.quantitySold}
                      </td>
                      <td className="py-4 text-right font-semibold text-slate-800">
                        {formatMoney(dish.revenue)}
                      </td>
                      <td className="py-4 text-right w-32">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-emerald-500"
                              style={{ width: `${Math.min(100, percentage)}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-slate-400 w-8">
                            {percentage.toFixed(0)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Transaction Detail */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
          <h3 className="text-lg font-semibold text-slate-800 mb-6">
            Chi tiết giao dịch
          </h3>
          <div className="flex-1 space-y-6">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-slate-500">
                  Giảm giá & Ưu đãi
                </span>
                <span className="text-sm font-semibold text-rose-500">
                  -{formatMoney(data.summary.totalDiscount)}
                </span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full">
                <div
                  className="h-full bg-rose-400 rounded-full"
                  style={{
                    width: `${(data.summary.totalDiscount / (data.summary.grossRevenue || 1)) * 100}%`,
                  }}
                ></div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600">
                  <Package className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-slate-500 font-medium">
                      Đơn hàng hoàn tất
                    </p>
                    <span className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-bold">
                      {data.orderTypes.regular.count}
                    </span>
                  </div>
                  <p className="text-sm text-emerald-600 font-bold">
                    {formatMoney(data.orderTypes.regular.revenue)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-rose-100 text-rose-600">
                  <ArrowDownRight className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-slate-500 font-medium">
                      Đơn hàng hoàn tiền
                    </p>
                    <span className="text-xs px-2 py-0.5 bg-rose-100 text-rose-700 rounded-full font-bold">
                      {data.orderTypes.refund.count}
                    </span>
                  </div>
                  <p className="text-sm text-rose-600 font-bold">
                    -{formatMoney(data.orderTypes.refund.revenue)}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-auto pt-6 border-t border-slate-100">
              <div className="bg-emerald-600 text-white p-4 rounded-xl shadow-lg shadow-emerald-200">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-emerald-100 text-sm">
                    Lợi nhuận ước tính
                  </span>
                  <TrendingUp className="w-4 h-4" />
                </div>
                <p className="text-2xl font-bold">
                  {formatMoney(data.summary.netRevenue)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const MetricCard: React.FC<{
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}> = ({ title, value, icon, color }) => (
  <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-2.5 rounded-xl ${color}`}>{icon}</div>
    </div>
    <p className="text-sm text-slate-500 font-medium mb-1">{title}</p>
    <p className="text-2xl font-bold text-slate-800 tracking-tight">{value}</p>
  </div>
);
