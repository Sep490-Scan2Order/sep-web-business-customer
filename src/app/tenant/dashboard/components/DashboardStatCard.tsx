import React from "react";

type DashboardStatCardProps = {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
};

export default function DashboardStatCard({
  title,
  value,
  subtitle,
  icon,
}: DashboardStatCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{title}</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
          <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
        </div>
        <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600">{icon}</div>
      </div>
    </div>
  );
}
