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
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Chi tiết tài khoản</h3>
        <div className="mt-4">
          <InfoRow label="Mã tenant" value={maskId(userInfo.id)} />
          <InfoRow label="Mã tài khoản" value={maskId(userInfo.accountId)} />
          <InfoRow label="Vai trò" value={formatOptional(userInfo.role)} />
          <InfoRow label="Ngày tạo" value={formatDate(userInfo.createdAt)} />
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Trạng thái tuân thủ</h3>
        <div className="mt-4">
          <InfoRow label="Hoạt động" value={userInfo.isActive ? 'Đang hoạt động' : 'Ngưng hoạt động'} />
          <InfoRow label="Xác thực" value={userInfo.verified ? 'Đã xác thực' : 'Chưa xác thực'} />
          <InfoRow label="Bắt đầu nợ" value={formatDate(userInfo.debtStartedAt)} />
          <InfoRow label="Cảnh báo gần nhất" value={formatDate(userInfo.lastWarningSentAt)} />
        </div>
      </div>
    </section>
  )
}
