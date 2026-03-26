"use client";

import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { getRevenueTrends } from "@/src/services/adminService";
import { RevenueTrendItem } from "@/src/types/type";

export default function RevenueChart() {
  const [data, setData] = useState<RevenueTrendItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRevenueTrends(6)
      .then(setData)
      .catch((err) => console.error("Failed to load revenue trends:", err))
      .finally(() => setLoading(false));
  }, []);

  const formatVND = (value: number) =>
    value.toLocaleString("vi-VN") + " ₫";

  return (
    <div className="bg-white p-6 rounded-2xl border shadow-sm">
      <h3 className="text-base font-semibold text-slate-900 mb-1">
        Xu hướng doanh thu gói đăng ký
      </h3>
      <p className="text-xs text-slate-500 mb-4">Trong 6 tháng gần nhất</p>

      {loading ? (
        <div className="h-[300px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
        </div>
      ) : data.length === 0 ? (
        <div className="h-[300px] flex items-center justify-center text-gray-400">
          Chưa có dữ liệu doanh thu
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" />
            <YAxis tickFormatter={(v) => v.toLocaleString("vi-VN")} />
            <Tooltip
              formatter={(value) => [formatVND(Number(value)), "Doanh thu"]}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#6366f1"
              fill="url(#colorRevenue)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
