import { ChartNoAxesCombined, HandCoins, Landmark, Store } from "lucide-react";
import { TenantDashboardRevenue } from "@/src/types/type";
import DashboardStatCard from "./DashboardStatCard";
import { formatVnd } from "./dashboardUtils";

type DashboardStatsGridProps = {
  dashboardData: TenantDashboardRevenue;
};

export default function DashboardStatsGrid({ dashboardData }: DashboardStatsGridProps) {
  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      <DashboardStatCard
        title="Net revenue"
        value={formatVnd(dashboardData.netRevenue)}
        subtitle="Doanh thu thực thu"
        icon={<Landmark className="h-5 w-5" />}
      />
      <DashboardStatCard
        title="Gross revenue"
        value={formatVnd(dashboardData.grossRevenue)}
        subtitle="Tổng tiền trước giảm"
        icon={<ChartNoAxesCombined className="h-5 w-5" />}
      />
      <DashboardStatCard
        title="Total orders"
        value={dashboardData.totalOrders.toLocaleString("vi-VN")}
        subtitle={`${dashboardData.totalRestaurants} nhà hàng`}
        icon={<Store className="h-5 w-5" />}
      />
      <DashboardStatCard
        title="Total discount"
        value={formatVnd(dashboardData.totalDiscount)}
        subtitle={`AOV: ${formatVnd(dashboardData.averageOrderValue)}`}
        icon={<HandCoins className="h-5 w-5" />}
      />
    </section>
  );
}
