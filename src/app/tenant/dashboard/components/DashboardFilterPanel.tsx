import { CalendarRange, RefreshCw } from "lucide-react";
import { TenantDashboardPreset } from "@/src/services/tenantService";

type PresetOption = {
  label: string;
  value: TenantDashboardPreset;
};

type DashboardFilterPanelProps = {
  selectedPreset: TenantDashboardPreset;
  startDate: string;
  endDate: string;
  isDashboardLoading: boolean;
  presetOptions: PresetOption[];
  onPresetChange: (preset: TenantDashboardPreset) => void;
  onApplyPreset: () => void;
  onReload: () => void;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onApplyCustomRange: () => void;
};

export default function DashboardFilterPanel({
  selectedPreset,
  startDate,
  endDate,
  isDashboardLoading,
  presetOptions,
  onPresetChange,
  onApplyPreset,
  onReload,
  onStartDateChange,
  onEndDateChange,
  onApplyCustomRange,
}: DashboardFilterPanelProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">Tenant dashboard</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">Tổng quan doanh thu</h1>
          <p className="mt-1 text-sm text-slate-500">
            Theo dõi doanh thu theo chu kỳ hoặc all-time của toàn bộ nhà hàng thuộc tenant.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedPreset}
            onChange={(e) => onPresetChange(e.target.value as TenantDashboardPreset)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-emerald-400 focus:outline-none"
          >
            {presetOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={onApplyPreset}
            disabled={isDashboardLoading}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <CalendarRange className="h-4 w-4" />
            Áp dụng preset
          </button>

          <button
            type="button"
            onClick={onReload}
            disabled={isDashboardLoading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${isDashboardLoading ? "animate-spin" : ""}`} />
            Tải lại
          </button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
        <input
          type="date"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-emerald-400 focus:outline-none"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-emerald-400 focus:outline-none"
        />
        <button
          type="button"
          onClick={onApplyCustomRange}
          disabled={isDashboardLoading}
          className="rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Lọc theo khoảng ngày
        </button>
      </div>
    </section>
  );
}
