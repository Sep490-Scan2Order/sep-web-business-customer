import React from "react";
import { UserInfo } from "@/src/types/type";
import {
  formatDate,
  formatMoney,
  formatNumber,
  formatOptional,
} from "./tenantInfoFormatters";

interface TenantInfoStatsProps {
  userInfo: UserInfo;
}

export default function TenantInfoStats({ userInfo }: TenantInfoStatsProps) {
  const stats = [
    {
      label: "Tổng công nợ",
      value: formatMoney(userInfo.totalDebtAmount),
      tone: "border-rose-200 bg-rose-50 text-rose-900",
    },
  ];

  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={`rounded-2xl border px-4 py-4 shadow-sm transition-shadow hover:shadow-md ${stat.tone}`}
        >
          <p className="text-xs font-semibold uppercase tracking-wide opacity-70">
            {stat.label}
          </p>
          <p className="mt-3 text-lg font-semibold">{stat.value}</p>
        </div>
      ))}
    </section>
  );
}
