import React from "react";
import TenantSidebar from "./TenantSidebar";
import TenantHeader from "./TenantHeader";
import { SuspendedWarningBanner } from "@/src/components/ui/tenant/SuspendedWarningBanner";

interface TenantLayoutClientProps {
  children: React.ReactNode;
}
function TenantLayoutContent({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-50 flex-col">
      {/* Suspended Warning Banner */}
      <SuspendedWarningBanner />

      {/*Main content*/}
      <div className="flex flex-1">
        {/*Sidebar*/}
        <TenantSidebar />

        {/*Content*/}
        <div className="flex-1 flex flex-col">
          <TenantHeader />
          <main className="flex-1 p-8">
            <div className="max-w-7xl mx-auto">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default function TenantLayout({ children }: TenantLayoutClientProps) {
  return <TenantLayoutContent>{children}</TenantLayoutContent>;
}
