import { ReactNode } from "react";

interface Props {
  title: string;
  value: string;
  trend?: string;
  icon: ReactNode;
}

export default function StatCard({ title, value, trend, icon }: Props) {
  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-500">{title}</p>

          <h2 className="text-2xl font-semibold mt-1 text-slate-900">{value}</h2>

          {trend && <p className="text-green-500 text-sm mt-1">{trend}</p>}
        </div>
        <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
          {icon}
        </div>
      </div>
    </div>
  );
}
