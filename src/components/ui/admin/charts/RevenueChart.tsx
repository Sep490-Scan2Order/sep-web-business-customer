"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { month: "Jan", revenue: 4000 },
  { month: "Feb", revenue: 5200 },
  { month: "Mar", revenue: 6100 },
  { month: "Apr", revenue: 8000 },
  { month: "May", revenue: 9800 },
  { month: "Jun", revenue: 12000 },
];

export default function RevenueChart() {
  return (
    <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border shadow-sm">
      <h3 className="font-semibold mb-4">Subscription Revenue Trends</h3>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />

          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#6366f1"
            fill="url(#colorRevenue)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
