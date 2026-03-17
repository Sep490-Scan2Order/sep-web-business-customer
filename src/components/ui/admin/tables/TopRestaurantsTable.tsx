"use client";

import { useEffect, useState } from "react";
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
    <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border shadow-sm">
      <h3 className="font-semibold mb-4">Top Performing Restaurants</h3>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-10 bg-gray-100 dark:bg-zinc-800 rounded animate-pulse"
            />
          ))}
        </div>
      ) : restaurants.length === 0 ? (
        <div className="py-8 text-center text-gray-400">
          No restaurant data available
        </div>
      ) : (
        <table className="w-full text-sm">
          <thead className="text-gray-500">
            <tr>
              <th className="text-left pb-3">Restaurant</th>
              <th className="pb-3">Plan</th>
              <th className="pb-3">Orders</th>
              <th className="text-right pb-3">Revenue</th>
            </tr>
          </thead>

          <tbody>
            {restaurants.map((r) => (
              <tr key={r.restaurantId} className="border-t">
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    {r.avatarUrl ? (
                      <img
                        src={r.avatarUrl}
                        alt={r.restaurantName}
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

                <td className="text-center">
                  <span className="px-2 py-1 bg-indigo-100 text-indigo-600 rounded text-xs">
                    {r.currentPlan}
                  </span>
                </td>

                <td className="text-center">{r.totalOrders.toLocaleString()}</td>

                <td className="text-right font-medium">
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
