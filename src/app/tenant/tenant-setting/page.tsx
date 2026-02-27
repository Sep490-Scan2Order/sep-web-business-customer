"use client"

import React from 'react'
import { UserInfo } from '@/src/types/type'
import TenantInfoHeader from '@/src/components/ui/tenant/TenantInfoHeader'
import TenantInfoStats from '@/src/components/ui/tenant/TenantInfoStats'
import TenantInfoVerification from '@/src/components/ui/tenant/TenantInfoVerification'
import TenantInfoDetails from '@/src/components/ui/tenant/TenantInfoDetails'
import { useAuth } from '@/src/hooks/useAuth'

export default function TenantSettingPage() {
  const { user } = useAuth()
  const tenantInfo = (user ?? null) as UserInfo | null

  if (!tenantInfo) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <p className="text-sm font-semibold text-slate-900">Chưa có thông tin tenant</p>
            <p className="mt-2 text-sm text-slate-500">Vui lòng đăng nhập để xem thông tin tài khoản.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">
            Tenant settings
          </p>
          <h2 className="text-3xl font-semibold text-slate-900">Account overview</h2>
          <p className="max-w-2xl text-sm text-slate-600">
            Review tenant information, verification status, and operational metrics in one place.
          </p>
        </div>

        <div className="space-y-8">
          <TenantInfoHeader userInfo={tenantInfo} />
          <TenantInfoStats userInfo={tenantInfo} />
          <TenantInfoVerification userInfo={tenantInfo} />
          <TenantInfoDetails userInfo={tenantInfo} />
        </div>
      </div>
    </div>
  )
}
