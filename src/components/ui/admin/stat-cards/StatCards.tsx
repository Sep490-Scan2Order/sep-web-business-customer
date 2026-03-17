"use client";

import { useEffect, useState } from "react";
import StatCard from "./StatCard";
import { Store, Users, Wallet, Building2 } from "lucide-react";
import { getSummaryMetrics } from "@/src/services/adminService";
import { AdminSummaryMetrics } from "@/src/types/type";

export default function StatCards() {
  const [data, setData] = useState<AdminSummaryMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSummaryMetrics()
      .then(setData)
      .catch((err) => console.error("Failed to load summary metrics:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex gap-6">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="flex-1 bg-white dark:bg-zinc-900 p-5 rounded-2xl shadow-sm border animate-pulse"
          >
            <div className="h-4 bg-gray-200 dark:bg-zinc-700 rounded w-24 mb-3" />
            <div className="h-7 bg-gray-200 dark:bg-zinc-700 rounded w-16 mb-2" />
            <div className="h-3 bg-gray-200 dark:bg-zinc-700 rounded w-20" />
          </div>
        ))}
      </div>
    );
  }

  const formatVND = (value: number) => value.toLocaleString("vi-VN") + " ₫";

  return (
    <div className="flex gap-6">
      <div className="flex-1">
        <StatCard
          title="Total Tenants"
          value={data?.totalTenants?.toLocaleString() ?? "0"}
          icon={<Building2 size={20} />}
        />
      </div>

      <div className="flex-1">
        <StatCard
          title="Total Restaurants"
          value={data?.totalRestaurants?.toLocaleString() ?? "0"}
          icon={<Store size={20} />}
        />
      </div>

      <div className="flex-1">
        <StatCard
          title="Platform Revenue"
          value={data ? formatVND(data.platformRevenue) : "0 ₫"}
          icon={<Wallet size={20} />}
        />
      </div>

      <div className="flex-1">
        <StatCard
          title="Active Accounts"
          value={data?.activeAccounts?.toLocaleString() ?? "0"}
          icon={<Users size={20} />}
        />
      </div>
    </div>
  );
}
