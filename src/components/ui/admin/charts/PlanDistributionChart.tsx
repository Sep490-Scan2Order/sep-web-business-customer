"use client";

import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { getPlanDistribution } from "@/src/services/adminService";
import { PlanDistributionItem } from "@/src/types/type";

const COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

export default function PlanDistributionChart() {
  const [data, setData] = useState<PlanDistributionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPlanDistribution()
      .then(setData)
      .catch((err) =>
        console.error("Failed to load plan distribution:", err),
      )
      .finally(() => setLoading(false));
  }, []);

  const chartData = data.map((item) => ({
    name: item.planName,
    value: item.percentage,
    count: item.count,
  }));

  return (
    <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border shadow-sm">
      <h3 className="font-semibold mb-4">Subscription Plan Distribution</h3>

      {loading ? (
        <div className="h-[250px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
        </div>
      ) : chartData.length === 0 ? (
        <div className="h-[250px] flex items-center justify-center text-gray-400">
          No plan data available
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={chartData}
                innerRadius={55}
                outerRadius={85}
                dataKey="value"
                nameKey="name"
                paddingAngle={2}
              >
                {chartData.map((_, index) => (
                  <Cell
                    key={index}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name) => [
                  `${value}%`,
                  name,
                ]}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Legend */}
          <div className="flex flex-wrap gap-3 mt-3 justify-center">
            {chartData.map((item, index) => (
              <div key={index} className="flex items-center gap-1.5 text-sm">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{
                    backgroundColor: COLORS[index % COLORS.length],
                  }}
                />
                <span className="text-gray-600 dark:text-gray-300">
                  {item.name} ({item.count})
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
