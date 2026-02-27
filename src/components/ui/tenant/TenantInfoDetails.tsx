import React from 'react'
import { UserInfo } from '@/src/types/type'
import { formatDate, formatOptional, maskId } from './tenantInfoFormatters'

interface TenantInfoDetailsProps {
  userInfo: UserInfo
}

interface InfoRowProps {
  label: string
  value: string
}

const InfoRow = ({ label, value }: InfoRowProps) => (
  <div className="flex items-center justify-between gap-4 border-b border-slate-100 py-3 last:border-b-0">
    <span className="text-sm text-slate-500">{label}</span>
    <span className="text-sm font-medium text-slate-900">{value}</span>
  </div>
)

export default function TenantInfoDetails({ userInfo }: TenantInfoDetailsProps) {
  return (
    <section className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Account details</h3>
        <div className="mt-4">
          <InfoRow label="Tenant ID" value={maskId(userInfo.id)} />
          <InfoRow label="Account ID" value={maskId(userInfo.accountId)} />
          <InfoRow label="Role" value={formatOptional(userInfo.role)} />
          <InfoRow label="Created" value={formatDate(userInfo.createdAt)} />
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Compliance</h3>
        <div className="mt-4">
          <InfoRow label="Active" value={userInfo.isActive ? 'Active' : 'Inactive'} />
          <InfoRow label="Verified" value={userInfo.verified ? 'Verified' : 'Unverified'} />
          <InfoRow label="Debt started" value={formatDate(userInfo.debtStartedAt)} />
          <InfoRow label="Last warning" value={formatDate(userInfo.lastWarningSentAt)} />
        </div>
      </div>
    </section>
  )
}
