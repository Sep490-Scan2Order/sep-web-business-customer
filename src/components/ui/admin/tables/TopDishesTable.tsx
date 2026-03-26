"use client";

import { TopSellingDish } from "@/src/types/type";

interface Props {
  dishes: TopSellingDish[];
}

export default function TopDishesTable({ dishes }: Props) {
  const formatVND = (v: number) => v.toLocaleString("vi-VN") + " ₫";

  if (dishes.length === 0) {
    return (
      <div className="bg-white p-6 rounded-2xl border shadow-sm">
        <h3 className="text-base font-semibold text-slate-900 mb-1">
          Món bán chạy nhất
        </h3>
        <p className="text-xs text-slate-500 mb-4">Xếp hạng theo số lượng bán và doanh thu</p>
        <div className="py-10 text-center text-gray-400">
          <p className="text-sm">Chưa có dữ liệu món ăn</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl border shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900 mb-1">
            Món bán chạy nhất
          </h3>
          <p className="text-xs text-slate-500">Xếp hạng theo số lượng bán và doanh thu</p>
        </div>
        <span className="text-xs text-slate-500">
          {dishes.length} món
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-xs font-medium uppercase tracking-wide text-slate-500">
            <tr>
              <th className="text-left pb-3">#</th>
              <th className="text-left pb-3">
                Tên món
              </th>
              <th className="text-center pb-3">
                Qty
              </th>
              <th className="text-right pb-3">
                Doanh thu
              </th>
            </tr>
          </thead>
          <tbody>
            {dishes.map((dish, idx) => (
              <tr
                key={dish.dishId}
                className="border-t border-slate-100 hover:bg-slate-50 transition-colors"
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
                            : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {idx + 1}
                  </span>
                </td>
                <td className="py-3">
                  <span className="font-medium text-slate-700">
                    {dish.dishName}
                  </span>
                </td>
                <td className="py-3 text-center">
                  <span className="inline-flex items-center gap-1 text-slate-600">
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
