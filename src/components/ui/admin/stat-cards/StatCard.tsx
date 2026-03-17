import { ReactNode } from "react";

interface Props {
  title: string;
  value: string;
  trend: string;
  icon: ReactNode;
}

export default function StatCard({ title, value, trend, icon }: Props) {
  return (
    <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl shadow-sm border">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-500">{title}</p>

          <h2 className="text-2xl font-semibold mt-1">{value}</h2>

          <p className="text-green-500 text-sm mt-1">{trend}</p>
        </div>

        <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl text-white">
          {icon}
        </div>
      </div>
    </div>
  );
}
