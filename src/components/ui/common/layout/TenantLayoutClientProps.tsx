import React from 'react'
import TenantSidebar from './TenantSidebar'
import TenantHeader from './TenantHeader'

interface TenantLayoutClientProps {
  children: React.ReactNode;
}
function TenantLayoutContent({children}: {children: React.ReactNode}) {
  return (
  <div className="flex min-h-screen bg-slate-50">
    {/*Sidebar*/}
    <TenantSidebar />

    {/*Content*/}
    <div className="flex-1 flex flex-col">
        <TenantHeader/>
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
    </div>
   </div>
  )
}

export default function TenantLayout({children}: TenantLayoutClientProps) {
  return (
    <TenantLayoutContent>{children}</TenantLayoutContent>
  )
}
