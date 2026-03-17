"use client";

import { useEffect, useState } from "react";
import { getExpiringSubscriptions } from "@/src/services/adminService";
import { ExpiringSubscription } from "@/src/types/type";

export default function ExpiringSubscriptionsTable() {
  const [subs, setSubs] = useState<ExpiringSubscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getExpiringSubscriptions(30)
      .then(setSubs)
      .catch((err) =>
        console.error("Failed to load expiring subscriptions:", err),
      )
      .finally(() => setLoading(false));
  }, []);

  const getDaysColor = (days: number) => {
    if (days <= 7) return "text-red-500 font-semibold";
    if (days <= 14) return "text-amber-500 font-medium";
    return "text-yellow-500";
  };

  const formatDate = (iso: string) => {
    const date = new Date(iso);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border shadow-sm">
      <h3 className="font-semibold mb-4">Expiring Subscriptions</h3>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-10 bg-gray-100 dark:bg-zinc-800 rounded animate-pulse"
            />
          ))}
        </div>
      ) : subs.length === 0 ? (
        <div className="py-8 text-center text-gray-400">
          No expiring subscriptions
        </div>
      ) : (
        <table className="w-full text-sm">
          <thead className="text-gray-500">
            <tr>
              <th className="text-left pb-3">Restaurant</th>
              <th className="pb-3">Plan</th>
              <th className="pb-3">Days Left</th>
              <th className="text-right pb-3">Expires</th>
            </tr>
          </thead>

          <tbody>
            {subs.map((s) => (
              <tr key={s.restaurantId} className="border-t">
                <td className="py-3 font-medium">{s.restaurantName}</td>

                <td className="text-center">
                  <span className="px-2 py-1 bg-indigo-100 text-indigo-600 rounded text-xs">
                    {s.planName}
                  </span>
                </td>

                <td className={`text-center ${getDaysColor(s.daysRemaining)}`}>
                  {s.daysRemaining} days
                </td>

                <td className="text-right text-gray-500">
                  {formatDate(s.expirationDate)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
