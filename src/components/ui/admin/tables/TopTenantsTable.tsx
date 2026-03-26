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
    <div className="bg-white p-6 rounded-2xl border shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-semibold text-slate-900 mb-1">
            Top 10 Tenant
          </h3>
          <p className="text-xs text-slate-500">
            Tổng doanh thu theo tenant trong hệ thống
          </p>
        </div>
        <span className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-full font-medium border border-slate-200">
          Xếp hạng doanh thu
        </span>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-10 bg-gray-100 rounded animate-pulse"
            />
          ))}
        </div>
      ) : tenants.length === 0 ? (
        <div className="py-8 text-center text-gray-400">
          Chưa có dữ liệu tenant
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs font-medium uppercase tracking-wide text-slate-500">
              <tr>
                <th className="text-left pb-3">#</th>
                <th className="text-left pb-3">
                  Tenant
                </th>
                <th className="text-center pb-3">
                  Nhà hàng
                </th>
                <th className="text-center pb-3">
                  Đơn hàng
                </th>
                <th className="text-right pb-3">
                  Tổng doanh thu
                </th>
                <th className="text-right pb-3"></th>
              </tr>
            </thead>
            <tbody>
              {tenants.map((t, idx) => (
                <tr
                  key={t.tenantId}
                  onClick={() => handleRowClick(t.tenantId)}
                  className="border-t hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <td className="py-4 pr-3">
                    <span className="text-slate-400 font-mono text-xs">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                  </td>
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold text-xs flex-shrink-0">
                        {getInitials(t.tenantName)}
                      </div>
                      <span className="font-medium text-slate-800 truncate max-w-[200px]">
                        {t.tenantName}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 text-center text-slate-600">{t.totalRestaurants}</td>
                  <td className="py-4 text-center">
                    <span className="text-slate-600">{t.totalOrders.toLocaleString()}</span>
                  </td>
                  <td className="py-4 text-right">
                    <span className="font-semibold text-emerald-600">
                      {formatVND(t.totalRevenue)}
                    </span>
                  </td>
                  <td className="py-4 pl-4 text-right text-xs text-indigo-600 font-medium">
                    Xem chi tiết
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
