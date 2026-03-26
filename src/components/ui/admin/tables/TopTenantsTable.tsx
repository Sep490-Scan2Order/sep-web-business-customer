"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getTopTenants } from "@/src/services/adminService";
import { TopTenantItem } from "@/src/types/type";

export default function TopTenantsTable() {
  const router = useRouter();
  const [tenants, setTenants] = useState<TopTenantItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTopTenants(10)
      .then(setTenants)
      .catch((err) => console.error("Failed to load top tenants:", err))
      .finally(() => setLoading(false));
  }, []);

  const formatVND = (value: number) => value.toLocaleString("vi-VN") + " ₫";

  const handleRowClick = (tenantId: string) => {
    router.push(`/admin/business-insight/${tenantId}`);
  };

  const getInitials = (name: string) =>
    name
      .split(" ")
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase();

  return (
    <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-lg">
            Top 10 Tenants
          </h3>
          <p className="text-sm text-slate-500 mt-0.5">
            Doanh thu cộng dồn toàn bộ nhà hàng • Click để xem chi tiết
          </p>
        </div>
        <span className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full font-medium border border-indigo-100">
          All-time revenue
        </span>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-14 bg-gray-100 dark:bg-zinc-800 rounded-xl animate-pulse"
            />
          ))}
        </div>
      ) : tenants.length === 0 ? (
        <div className="py-16 text-center text-gray-400">
          <div className="text-4xl mb-3">📊</div>
          <p>Chưa có dữ liệu tenant</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-zinc-700">
                <th className="text-left pb-3 text-slate-500 font-medium">#</th>
                <th className="text-left pb-3 text-slate-500 font-medium">
                  Tenant
                </th>
                <th className="text-center pb-3 text-slate-500 font-medium">
                  Nhà hàng
                </th>
                <th className="text-center pb-3 text-slate-500 font-medium">
                  Đơn hàng
                </th>
                <th className="text-right pb-3 text-slate-500 font-medium">
                  Tổng doanh thu
                </th>
                <th className="text-right pb-3 text-slate-500 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {tenants.map((t, idx) => (
                <tr
                  key={t.tenantId}
                  onClick={() => handleRowClick(t.tenantId)}
                  className="border-b border-slate-50 dark:border-zinc-800 hover:bg-indigo-50/50 dark:hover:bg-zinc-800/60 cursor-pointer transition-colors group"
                >
                  <td className="py-4 pr-3">
                    <span className="text-slate-400 font-mono text-xs">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                  </td>
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0 shadow-sm">
                        {getInitials(t.tenantName)}
                      </div>
                      <span className="font-medium text-slate-800 dark:text-slate-100 truncate max-w-[200px]">
                        {t.tenantName}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 text-center">
                    <span className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-300">
                      <span className="text-xs">🏪</span>
                      {t.totalRestaurants}
                    </span>
                  </td>
                  <td className="py-4 text-center">
                    <span className="text-slate-600 dark:text-slate-300">
                      {t.totalOrders.toLocaleString()}
                    </span>
                  </td>
                  <td className="py-4 text-right">
                    <span className="font-semibold text-emerald-600">
                      {formatVND(t.totalRevenue)}
                    </span>
                  </td>
                  <td className="py-4 pl-4 text-right">
                    <span className="text-slate-300 group-hover:text-indigo-500 transition-colors text-lg">
                      →
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
