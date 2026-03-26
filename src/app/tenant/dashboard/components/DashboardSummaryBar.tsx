type DashboardSummaryBarProps = {
  tenantName?: string;
  filterSummary: string;
};

export default function DashboardSummaryBar({
  tenantName,
  filterSummary,
}: DashboardSummaryBarProps) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
      <span>
        Tenant: <strong className="text-slate-900">{tenantName || "N/A"}</strong>
      </span>
      <span>
        Bộ lọc: <strong className="text-slate-900">{filterSummary}</strong>
      </span>
    </div>
  );
}
