"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { PaymentMethodStats } from "@/src/types/type";

interface Props {
  data: PaymentMethodStats;
}

const COLORS = ["#6366f1", "#34d399"];

export default function PaymentMethodPieChart({ data }: Props) {
  const formatVND = (v: number) => v.toLocaleString("vi-VN") + " ₫";

  const chartData = [
    { name: "Tiền mặt", value: data.cash },
    { name: "Chuyển khoản", value: data.transfer },
  ];

  const total = data.cash + data.transfer;

  return (
    <div className="bg-white p-6 rounded-2xl border shadow-sm h-full">
      <h3 className="text-base font-semibold text-slate-900 mb-1">
        Phương thức thanh toán
      </h3>
      <p className="text-xs text-slate-500 mb-4">
        Tổng: {formatVND(total)}
      </p>

      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={95}
            paddingAngle={4}
            dataKey="value"
          >
            {chartData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value, _name, item) => [formatVND(Number(value)), item.payload.name]} />
          <Legend
            formatter={(value) => (
              <span className="text-sm text-slate-600">
                {value}
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>

      <div className="grid grid-cols-2 gap-3 mt-2">
        {chartData.map((item, i) => (
          <div key={item.name} className="text-center bg-slate-50 rounded-xl py-2 px-2">
            <div className="w-3 h-3 rounded-full mx-auto mb-1" style={{ backgroundColor: COLORS[i] }} />
            <p className="text-xs text-slate-500">{item.name}</p>
            <p className="text-sm font-semibold text-slate-700">
              {formatVND(item.value)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
