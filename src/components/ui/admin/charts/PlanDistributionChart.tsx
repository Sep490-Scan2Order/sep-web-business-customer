"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { name: "Free Trial", value: 20 },
  { name: "Basic", value: 50 },
  { name: "Premium Pro", value: 30 },
];

const COLORS = ["#8884d8", "#6366f1", "#22c55e"];

export default function PlanDistributionChart() {
  return (
    <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border shadow-sm">
      <h3 className="font-semibold mb-4">Subscription Plan Distribution</h3>

      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie data={data} innerRadius={60} outerRadius={90} dataKey="value">
            {data.map((entry, index) => (
              <Cell key={index} fill={COLORS[index]} />
            ))}
          </Pie>

          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
