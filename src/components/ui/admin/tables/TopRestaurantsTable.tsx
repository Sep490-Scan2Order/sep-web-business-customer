"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { getTopPerformingRestaurants } from "@/src/services/adminService";
import { TopPerformingRestaurant } from "@/src/types/type";

export default function TopRestaurantsTable() {
  const [restaurants, setRestaurants] = useState<TopPerformingRestaurant[]>(
    [],
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTopPerformingRestaurants(5)
      .then(setRestaurants)
      .catch((err) =>
        console.error("Failed to load top restaurants:", err),
      )
      .finally(() => setLoading(false));
  }, []);

  const formatVND = (value: number) =>
    value.toLocaleString("vi-VN") + " ₫";

  return (
    <div className="bg-white p-6 rounded-2xl border shadow-sm">
      <h3 className="text-base font-semibold text-slate-900 mb-1">
        Nhà hàng hoạt động tốt nhất
      </h3>
      <p className="text-xs text-slate-500 mb-4">Những nhà hàng có doanh thu cao nhất</p>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-10 bg-gray-100 rounded animate-pulse"
            />
          ))}
        </div>
      ) : restaurants.length === 0 ? (
        <div className="py-8 text-center text-gray-400">
          Chưa có dữ liệu nhà hàng
        </div>
      ) : (
        <table className="w-full text-sm">
          <thead className="text-xs font-medium uppercase tracking-wide text-slate-500">
            <tr>
              <th className="text-left pb-3">Nhà hàng</th>
              <th className="pb-3">Gói</th>
              <th className="pb-3">Đơn hàng</th>
              <th className="text-right pb-3">Doanh thu</th>
            </tr>
          </thead>

          <tbody>
            {restaurants.map((r) => (
              <tr key={r.restaurantId} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    {r.avatarUrl ? (
                      <Image
                        src={r.avatarUrl}
                        alt={r.restaurantName}
                        width={32}
                        height={32}
                        unoptimized
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold text-xs">
                        {r.restaurantName.charAt(0)}
                      </div>
                    )}
                    <span className="font-medium truncate max-w-[160px]">
                      {r.restaurantName}
                    </span>
                  </div>
                </td>

                <td className="text-center py-3">
                  <span className="px-2 py-1 bg-indigo-100 text-indigo-600 rounded text-xs">
                    {r.currentPlan}
                  </span>
                </td>

                <td className="text-center py-3 text-slate-600">{r.totalOrders.toLocaleString()}</td>

                <td className="text-right py-3 font-medium text-slate-800">
                  {formatVND(r.totalRevenue)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
