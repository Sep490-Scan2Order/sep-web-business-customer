import React from 'react'
import { UserInfo } from '@/src/types/type'
import { formatDate, formatMoney, formatNumber, formatOptional } from './tenantInfoFormatters'

interface TenantInfoStatsProps {
  userInfo: UserInfo
}

export default function TenantInfoStats({ userInfo }: TenantInfoStatsProps) {
  const stats = [
    {
      label: 'Plan',
      value: formatOptional(userInfo.planName, 'No plan'),
      tone: 'border-amber-200 bg-amber-50 text-amber-900',
    },
    {
      label: 'Subscription expiry',
      value: formatDate(userInfo.subscriptionExpiryDate),
      tone: 'border-sky-200 bg-sky-50 text-sky-900',
    },
    {
      label: 'Total debt',
      value: formatMoney(userInfo.totalDebtAmount),
      tone: 'border-rose-200 bg-rose-50 text-rose-900',
    },
    {
      label: 'Restaurants',
      value: formatNumber(userInfo.totalRestaurants),
      tone: 'border-emerald-200 bg-emerald-50 text-emerald-900',
    },
    {
      label: 'Dishes',
      value: formatNumber(userInfo.totalDishes),
      tone: 'border-indigo-200 bg-indigo-50 text-indigo-900',
    },
    {
      label: 'Categories',
      value: formatNumber(userInfo.totalCategories),
      tone: 'border-slate-200 bg-slate-50 text-slate-900',
    },
  ]

  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={`rounded-2xl border px-4 py-4 shadow-sm transition-shadow hover:shadow-md ${stat.tone}`}
        >
          <p className="text-xs font-semibold uppercase tracking-wide opacity-70">{stat.label}</p>
          <p className="mt-3 text-lg font-semibold">{stat.value}</p>
        </div>
      ))}
    </section>
  )
}
