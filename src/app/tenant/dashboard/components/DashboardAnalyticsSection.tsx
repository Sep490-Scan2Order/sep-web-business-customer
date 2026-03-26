import { TenantDashboardRevenue } from "@/src/types/type";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatVnd } from "./dashboardUtils";

type ChartData = {
  name: string;
  revenue: number;
};

type DashboardAnalyticsSectionProps = {
  chartData: ChartData[];
  dashboardData: TenantDashboardRevenue;
};

export default function DashboardAnalyticsSection({
  chartData,
  dashboardData,
}: DashboardAnalyticsSectionProps) {
  return (
    <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
      <div className="xl:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-base font-semibold text-slate-900">Top nhà hàng theo doanh thu</h3>
        <p className="mt-1 text-xs text-slate-500">Hiển thị 6 nhà hàng có doanh thu cao nhất.</p>
        <div className="mt-4 h-[300px]">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} angle={-15} textAnchor="end" height={62} />
                <YAxis tickFormatter={(value) => Number(value).toLocaleString("vi-VN")} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value) => [formatVnd(Number(value)), "Doanh thu"]} />
                <Bar dataKey="revenue" fill="#059669" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-slate-500">
              Chưa có dữ liệu doanh thu để hiển thị biểu đồ.
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-base font-semibold text-slate-900">Hiệu suất chung</h3>
        <div className="mt-4 space-y-3 text-sm">
          <div className="rounded-xl bg-slate-50 px-3 py-2">
            <p className="text-slate-500">Trung bình đơn hàng</p>
            <p className="mt-1 font-semibold text-slate-900">{formatVnd(dashboardData.averageOrderValue)}</p>
          </div>
          <div className="rounded-xl bg-slate-50 px-3 py-2">
            <p className="text-slate-500">Tỷ lệ giảm giá / gross</p>
            <p className="mt-1 font-semibold text-slate-900">
              {dashboardData.grossRevenue > 0
                ? `${((dashboardData.totalDiscount / dashboardData.grossRevenue) * 100).toFixed(2)}%`
                : "0.00%"}
            </p>
          </div>
          <div className="rounded-xl bg-slate-50 px-3 py-2">
            <p className="text-slate-500">Tỷ lệ net / gross</p>
            <p className="mt-1 font-semibold text-slate-900">
              {dashboardData.grossRevenue > 0
                ? `${((dashboardData.netRevenue / dashboardData.grossRevenue) * 100).toFixed(2)}%`
                : "0.00%"}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
