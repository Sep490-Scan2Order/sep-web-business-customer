"use client";

import { RevenueSummaryMetrics } from "@/src/types/type";

interface Props {
  data: RevenueSummaryMetrics;
}

export default function RestaurantRevenueCards({ data }: Props) {
  const formatVND = (v: number) => v.toLocaleString("vi-VN") + " ₫";
  const formatNum = (v: number) => v.toLocaleString("vi-VN");

  const cards = [
    {
      label: "Doanh thu gốc",
      value: formatVND(data.grossRevenue),
      icon: "💰",
      color: "from-emerald-400 to-teal-500",
      bg: "bg-emerald-50 dark:bg-emerald-900/20",
      text: "text-emerald-700 dark:text-emerald-300",
    },
    {
      label: "Doanh thu thực nhận",
      value: formatVND(data.netRevenue),
      icon: "✅",
      color: "from-indigo-400 to-purple-500",
      bg: "bg-indigo-50 dark:bg-indigo-900/20",
      text: "text-indigo-700 dark:text-indigo-300",
    },
    {
      label: "Tổng giảm giá",
      value: formatVND(data.totalDiscount),
      icon: "🏷️",
      color: "from-amber-400 to-orange-500",
      bg: "bg-amber-50 dark:bg-amber-900/20",
      text: "text-amber-700 dark:text-amber-300",
    },
    {
      label: "Tổng hoàn tiền",
      value: formatVND(data.totalRefund),
      icon: "↩️",
      color: "from-rose-400 to-red-500",
      bg: "bg-rose-50 dark:bg-rose-900/20",
      text: "text-rose-700 dark:text-rose-300",
    },
    {
      label: "Tổng đơn hàng",
      value: formatNum(data.totalOrders),
      icon: "📋",
      color: "from-sky-400 to-blue-500",
      bg: "bg-sky-50 dark:bg-sky-900/20",
      text: "text-sky-700 dark:text-sky-300",
    },
    {
      label: "Giá trị TB / đơn",
      value: formatVND(data.averageOrderValue),
      icon: "📈",
      color: "from-violet-400 to-purple-600",
      bg: "bg-violet-50 dark:bg-violet-900/20",
      text: "text-violet-700 dark:text-violet-300",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`${card.bg} rounded-2xl p-5 border border-white/60 dark:border-white/10 shadow-sm`}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">{card.icon}</span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {card.label}
            </span>
          </div>
          <p className={`text-xl font-bold ${card.text} leading-tight`}>
            {card.value}
          </p>
        </div>
      ))}
    </div>
  );
}
