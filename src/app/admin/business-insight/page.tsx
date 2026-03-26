import TopTenantsTable from "@/src/components/ui/admin/tables/TopTenantsTable";

export default function BusinessInsightPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Business Insight
        </h1>
        <p className="mt-1 text-slate-500 text-sm">
          Phân tích doanh thu theo Tenant → Nhà hàng. Click vào một tenant để xem chi tiết.
        </p>
      </div>

      {/* Cấp 1 – Top Tenants */}
      <TopTenantsTable />
    </div>
  );
}
