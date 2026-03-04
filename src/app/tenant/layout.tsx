import React from 'react'
import TenantLayout from '@/src/components/ui/common/layout/TenantLayoutClientProps'
import { TenantAuthProvider } from '@/src/components/providers/TenantAuthProvider'

export const metadata = {
  title: 'Scan To Order - Tenant',
  description: 'Trang quan ly danh cho khach hang su dung dich vu Scan To Order.',
}

export default function TenantPageLayout({children}: {children: React.ReactNode}) {
  return (
    <TenantAuthProvider>
      <TenantLayout>{children}</TenantLayout>
    </TenantAuthProvider>
  )
}
