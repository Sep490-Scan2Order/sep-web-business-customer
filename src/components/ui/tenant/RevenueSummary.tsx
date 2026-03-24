"use client";

import React, { useEffect, useState, useMemo } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from "recharts";
import { 
  TrendingUp, Users, ShoppingBag, CreditCard, Banknote, 
  ArrowUpRight, ArrowDownRight, Calendar, Package, Utensils
} from "lucide-react";
import { RevenueSummaryData } from "@/src/types/type";
import apiClient from "@/src/services/apiClient";
import { API } from "@/src/constants/api";
import { formatMoney, formatNumber } from "./tenantInfoFormatters";
import { toast } from "react-toastify";

interface RevenueSummaryProps {
  restaurantId: number;
}

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"];

const RevenueSummary: React.FC<RevenueSummaryProps> = ({ restaurantId }) => {
  const [data, setData] = useState<RevenueSummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("today"); // today, week, month, all

  const fetchRevenueSummary = async () => {
    setLoading(true);
    try {
      // In a real app, you'd calculate startDate and endDate based on dateRange
      // For now, let's keep it simple as per user request example
      const response = await apiClient.get(API.RESTAURANT.REVENUE_SUMMARY(restaurantId));
      if (response.data.isSuccess) {
        setData(response.data.data);
      } else {
        toast.error(response.data.message || "Không thể tải dữ liệu doanh thu");
      }
    } catch (error) {
      console.error("Error fetching revenue summary:", error);
      toast.error("Có lỗi xảy ra khi tải dữ liệu doanh thu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (restaurantId) {
      fetchRevenueSummary();
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
    return [
      { name: "Đơn hàng thường", revenue: data.orderTypes.regular.revenue, count: data.orderTypes.regular.count },
      { name: "Hoàn tiền", revenue: data.orderTypes.refund.revenue, count: data.orderTypes.refund.count },
    ];
  }, [data]);

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
      {/* Date Filter & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Tổng quan doanh thu</h2>
          <p className="text-slate-500 text-sm">
            Báo cáo từ {new Date(data.period.startDate).toLocaleDateString("vi-VN")} đến {new Date(data.period.endDate).toLocaleDateString("vi-VN")}
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
              {range === "today" ? "Hôm nay" : range === "week" ? "Tuần này" : range === "month" ? "Tháng này" : "Tất cả"}
            </button>
          ))}
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          title="Tổng doanh thu (Gross)" 
          value={formatMoney(data.summary.grossRevenue)} 
          icon={<TrendingUp className="w-5 h-5 text-emerald-600" />} 
          trend="+12.5%" 
          color="bg-emerald-50 text-emerald-600"
        />
        <MetricCard 
          title="Doanh thu thuần (Net)" 
          value={formatMoney(data.summary.netRevenue)} 
          icon={<Banknote className="w-5 h-5 text-blue-600" />} 
          trend="+8.2%" 
          color="bg-blue-50 text-blue-600"
        />
        <MetricCard 
          title="Tổng số đơn hàng" 
          value={formatNumber(data.summary.totalOrders)} 
          icon={<ShoppingBag className="w-5 h-5 text-amber-600" />} 
          trend="+5.4%" 
          color="bg-amber-50 text-amber-600"
        />
        <MetricCard 
          title="Giá trị đơn trung bình" 
          value={formatMoney(data.summary.averageOrderValue)} 
          icon={<CreditCard className="w-5 h-5 text-purple-600" />} 
          trend="-2.1%" 
          color="bg-purple-50 text-purple-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Breakdown Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">
            <Package className="w-5 h-5 text-emerald-500" />
            Phân tích loại đơn hàng
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={orderTypeData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }}
                  cursor={{ fill: "#f8fafc" }}
                />
                <Bar dataKey="revenue" name="Doanh thu" fill="#10b981" radius={[6, 6, 0, 0]} barSize={40} />
                <Bar dataKey="count" name="Số lượng" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Methods Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-blue-500" />
            Phương thức thanh toán
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
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 w-full space-y-2">
              {paymentData.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                    <span className="text-slate-600">{item.name}</span>
                  </div>
                  <span className="font-semibold text-slate-800">{formatMoney(item.value)}</span>
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
              <Utensils className="w-5 h-5 text-rose-500" />
              Món ăn bán chạy nhất
            </h3>
            <button className="text-emerald-600 text-sm font-medium hover:underline">Xem tất cả</button>
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
                  const percentage = (dish.revenue / data.summary.grossRevenue) * 100 || 0;
                  return (
                    <tr key={dish.dishId} className="group hover:bg-slate-50 transition-colors">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs ring-1 ring-slate-200">
                            {index + 1}
                          </div>
                          <span className="font-medium text-slate-700 group-hover:text-emerald-600 transition-colors">{dish.dishName}</span>
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
                              className="h-full bg-emerald-500 rounded-full" 
                              style={{ width: `${Math.min(100, percentage)}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-slate-400 w-8">{percentage.toFixed(0)}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Refund vs Regular Summary */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
          <h3 className="text-lg font-semibold text-slate-800 mb-6">Chi tiết giao dịch</h3>
          <div className="flex-1 space-y-6">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-slate-500">Giảm giá & Ưu đãi</span>
                <span className="text-sm font-semibold text-rose-500">-{formatMoney(data.summary.totalDiscount)}</span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full">
                <div 
                  className="h-full bg-rose-400 rounded-full" 
                  style={{ width: `${(data.summary.totalDiscount / data.summary.grossRevenue) * 100 || 0}%` }}
                ></div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Đơn hàng hoàn tất</p>
                  <p className="text-lg font-bold text-slate-800">{data.orderTypes.regular.count} đơn</p>
                  <p className="text-xs text-emerald-600 font-medium">{formatMoney(data.orderTypes.regular.revenue)}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-rose-100 text-rose-600">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Đơn hàng hoàn tiền</p>
                  <p className="text-lg font-bold text-slate-800">{data.orderTypes.refund.count} đơn</p>
                  <p className="text-xs text-rose-600 font-medium">-{formatMoney(data.orderTypes.refund.revenue)}</p>
                </div>
              </div>
            </div>
            
            <div className="mt-auto pt-6 border-t border-slate-100">
              <div className="bg-emerald-600 text-white p-4 rounded-xl shadow-lg shadow-emerald-200">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-emerald-100 text-sm">Lợi nhuận ước tính</span>
                  <div className="p-1 bg-emerald-500 rounded-full">
                    <TrendingUp className="w-3 h-3" />
                  </div>
                </div>
                <p className="text-2xl font-bold">{formatMoney(data.summary.netRevenue)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MetricCard: React.FC<{ 
  title: string; 
  value: string; 
  icon: React.ReactNode; 
  trend: string; 
  color: string;
}> = ({ title, value, icon, trend, color }) => {
  const isPositive = trend.startsWith("+");
  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2.5 rounded-xl ${color}`}>{icon}</div>
        <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${isPositive ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
          {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {trend}
        </div>
      </div>
      <div>
        <p className="text-sm text-slate-500 font-medium mb-1">{title}</p>
        <p className="text-2xl font-bold text-slate-800 tracking-tight">{value}</p>
      </div>
    </div>
  );
};

export default RevenueSummary;
