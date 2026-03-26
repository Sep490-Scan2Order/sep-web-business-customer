"use client";

import { TopSellingDish } from "@/src/types/type";

interface Props {
  dishes: TopSellingDish[];
}

export default function TopDishesTable({ dishes }: Props) {
  const formatVND = (v: number) => v.toLocaleString("vi-VN") + " ₫";

  if (dishes.length === 0) {
    return (
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border shadow-sm">
        <h4 className="font-semibold text-slate-800 dark:text-slate-100 mb-4">
          Món bán chạy nhất
        </h4>
        <div className="py-10 text-center text-gray-400">
          <div className="text-3xl mb-2">🍽️</div>
          <p className="text-sm">Chưa có dữ liệu món ăn</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-slate-800 dark:text-slate-100">
          Món bán chạy nhất
        </h4>
        <span className="text-xs text-slate-400">
          {dishes.length} món
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 dark:border-zinc-700">
              <th className="text-left pb-3 text-slate-500 font-medium">#</th>
              <th className="text-left pb-3 text-slate-500 font-medium">
                Tên món
              </th>
              <th className="text-center pb-3 text-slate-500 font-medium">
                Qty
              </th>
              <th className="text-right pb-3 text-slate-500 font-medium">
                Doanh thu
              </th>
            </tr>
          </thead>
          <tbody>
            {dishes.map((dish, idx) => (
              <tr
                key={dish.dishId}
                className="border-b border-slate-50 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800/40 transition-colors"
              >
                <td className="py-3 pr-2">
                  <span
                    className={`inline-flex w-6 h-6 items-center justify-center rounded-full text-xs font-bold ${
                      idx === 0
                        ? "bg-amber-400 text-white"
                        : idx === 1
                          ? "bg-slate-300 text-white"
                          : idx === 2
                            ? "bg-amber-700 text-white"
                            : "bg-slate-100 text-slate-500 dark:bg-zinc-700 dark:text-slate-400"
                    }`}
                  >
                    {idx + 1}
                  </span>
                </td>
                <td className="py-3">
                  <span className="font-medium text-slate-700 dark:text-slate-200">
                    {dish.dishName}
                  </span>
                </td>
                <td className="py-3 text-center">
                  <span className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-300">
                    <span className="tabular-nums">
                      {dish.quantitySold.toLocaleString()}
                    </span>
                    <span className="text-slate-400 text-xs">phần</span>
                  </span>
                </td>
                <td className="py-3 text-right font-semibold text-emerald-600">
                  {formatVND(dish.revenue)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
