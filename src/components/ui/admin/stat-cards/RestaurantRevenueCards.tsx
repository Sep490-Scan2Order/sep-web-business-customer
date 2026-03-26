"use client";

import { RevenueSummaryMetrics } from "@/src/types/type";
import {
  BadgeDollarSign,
  HandCoins,
  TicketPercent,
  RotateCcw,
  ClipboardList,
  ChartLine,
} from "lucide-react";

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
      icon: <BadgeDollarSign className="w-4 h-4 text-emerald-600" />,
      text: "text-emerald-600",
    },
    {
      label: "Doanh thu thực nhận",
      value: formatVND(data.netRevenue),
      icon: <HandCoins className="w-4 h-4 text-indigo-600" />,
      text: "text-indigo-600",
    },
    {
      label: "Tổng giảm giá",
      value: formatVND(data.totalDiscount),
      icon: <TicketPercent className="w-4 h-4 text-amber-600" />,
      text: "text-amber-600",
    },
    {
      label: "Tổng hoàn tiền",
      value: formatVND(data.totalRefund),
      icon: <RotateCcw className="w-4 h-4 text-rose-600" />,
      text: "text-rose-600",
    },
    {
      label: "Tổng đơn hàng",
      value: formatNum(data.totalOrders),
      icon: <ClipboardList className="w-4 h-4 text-sky-600" />,
      text: "text-sky-600",
    },
    {
      label: "Giá trị TB / đơn",
      value: formatVND(data.averageOrderValue),
      icon: <ChartLine className="w-4 h-4 text-violet-600" />,
      text: "text-violet-600",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-2xl p-5 border bg-white shadow-sm"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">
              {card.icon}
            </span>
            <span className="text-xs font-medium text-slate-500">
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
