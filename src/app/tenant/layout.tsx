import React from 'react'
import TenantLayout from '@/src/components/ui/common/layout/TenantLayoutClientProps'

export const metadata = {
  title: 'Scan To Order - Tenant',
  description: 'Trang quan ly danh cho khach hang su dung dich vu Scan To Order.',
}

export default function TenantPageLayout({children}: {children: React.ReactNode}) {
  return (
    <TenantLayout>{children}</TenantLayout>
  )
}
