import React from 'react'
import AdminSidebar from './AdminSidebar'
import AdminHeader from './AdminHeader'

interface AdminLayoutClientProps {
  children: React.ReactNode;
}

function AdminLayoutContent({children}: {children: React.ReactNode}) {
  return (
  <div className="flex min-h-screen bg-slate-50">
    {/*Sidebar*/}
    <AdminSidebar />

    {/*Content*/}
    <div className="flex-1 flex flex-col">
        <AdminHeader/>
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
    </div>
    </div>
  )
}


export default function AdminLayout({children}: AdminLayoutClientProps) {
  return (
    <AdminLayoutContent>{children}</AdminLayoutContent>
  )
}   
    