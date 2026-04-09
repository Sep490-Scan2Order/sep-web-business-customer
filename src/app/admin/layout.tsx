import React from 'react'
import AdminLayoutClient from '@/src/components/ui/common/layout/AdminLayoutClientProps'
import { AdminAuthProvider } from '@/src/components/providers/AdminAuthProvider'

export const metadata = {
  title: 'Scan To Order - Quản trị',
  description: 'Trang quản lý dành cho người quản trị hệ thống.',
}


export default function AdminLayout({children}: {children: React.ReactNode}) {
  return (
    <AdminAuthProvider>
      <AdminLayoutClient>{children}</AdminLayoutClient>
    </AdminAuthProvider>
  )
}
