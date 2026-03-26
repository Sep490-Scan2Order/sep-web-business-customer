import TopTenantsTable from "@/src/components/ui/admin/tables/TopTenantsTable";

export default function BusinessInsightPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="bg-white p-6 rounded-2xl border shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">
          Business Insight
        </h1>
        <p className="mt-1 text-slate-500 text-sm">
          Theo dõi doanh thu theo Tenant và Nhà hàng. Chọn tenant để xem chi tiết.
        </p>
      </div>

      <TopTenantsTable />
    </div>
  );
}
