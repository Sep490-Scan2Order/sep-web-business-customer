import StatCards from "../../../components/ui/admin/stat-cards/StatCards";
import RevenueChart from "../../../components/ui/admin/charts/RevenueChart";
import PlanDistributionChart from "../../../components/ui/admin/charts/PlanDistributionChart";
import TopRestaurantsTable from "../../../components/ui/admin/tables/TopRestaurantsTable";
import ExpiringSubscriptionsTable from "../../../components/ui/admin/tables/ExpiringSubscriptionsTable";

export default function OverviewPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Row 1 */}
      <StatCards />

      {/* Row 2 */}
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <RevenueChart />
        </div>

        <div className="col-span-1">
          <PlanDistributionChart />
        </div>
      </div>

      {/* Row 3 */}
      <div className="grid grid-cols-2 gap-6">
        <TopRestaurantsTable />
        <ExpiringSubscriptionsTable />
      </div>
    </div>
  );
}
