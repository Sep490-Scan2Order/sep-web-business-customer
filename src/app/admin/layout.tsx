import React from 'react'
import AdminLayoutClient from '@/src/components/ui/common/layout/AdminLayoutClientProps'
import { AdminAuthProvider } from '@/src/components/providers/AdminAuthProvider'

export const metadata = {
  title: 'Scan To Order - Admin',
  description: 'Trang quan ly danh cho nguoi quan tri he thong.',
}


export default function AdminLayout({children}: {children: React.ReactNode}) {
  return (
    <AdminAuthProvider>
      <AdminLayoutClient>{children}</AdminLayoutClient>
    </AdminAuthProvider>
  )
}
