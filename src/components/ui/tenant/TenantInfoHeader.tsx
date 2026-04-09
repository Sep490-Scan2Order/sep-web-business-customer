import React from 'react'
import { UserInfo } from '@/src/types/type'
import { formatOptional } from './tenantInfoFormatters'

interface TenantInfoHeaderProps {
  userInfo: UserInfo
}

const buildInitials = (name: string | null) => {
  if (!name) return 'TN'
  const words = name.trim().split(' ')
  const initials = words.slice(0, 2).map((word) => word.charAt(0).toUpperCase())
  return initials.join('') || 'TN'
}

export default function TenantInfoHeader({ userInfo }: TenantInfoHeaderProps) {
  const statusLabel = userInfo.isActive ? 'Đang hoạt động' : 'Ngưng hoạt động'
  const verifiedLabel = userInfo.verified ? 'Đã xác thực' : 'Chưa xác thực'
  const statusTone = userInfo.isActive
    ? 'bg-emerald-100 text-emerald-700'
    : 'bg-rose-100 text-rose-700'
  const verifiedTone = userInfo.verified
    ? 'bg-sky-100 text-sky-700'
    : 'bg-amber-100 text-amber-700'

  return (
    <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white">
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-50 via-white to-sky-50" />
      <div className="relative p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative h-20 w-20 overflow-hidden rounded-2xl border border-white bg-slate-900 text-white shadow-sm">
              {userInfo.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={userInfo.avatar}
                  alt={formatOptional(userInfo.name, 'Ảnh đại diện tenant')}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-lg font-semibold">
                  {buildInitials(userInfo.name)}
                </div>
              )}
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Hồ sơ tenant</p>
              <h1 className="mt-2 text-2xl font-semibold text-slate-900">
                {formatOptional(userInfo.name, 'Tenant chưa đặt tên')}
              </h1>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusTone}`}>
                  {statusLabel}
                </span>
                <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${verifiedTone}`}>
                  {verifiedLabel}
                </span>
                <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                  {formatOptional(userInfo.role, 'Vai trò')}
                </span>
              </div>
            </div>
          </div>

          <div className="grid w-full gap-4 sm:grid-cols-2 lg:w-auto">
            <div className="rounded-2xl border border-white/60 bg-white/70 px-4 py-3 shadow-sm">
              <p className="text-xs font-semibold uppercase text-slate-500">Email</p>
              <p className="mt-2 text-sm font-medium text-slate-900">
                {formatOptional(userInfo.email)}
              </p>
            </div>
            <div className="rounded-2xl border border-white/60 bg-white/70 px-4 py-3 shadow-sm">
              <p className="text-xs font-semibold uppercase text-slate-500">Số điện thoại</p>
              <p className="mt-2 text-sm font-medium text-slate-900">
                {formatOptional(userInfo.phone)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
