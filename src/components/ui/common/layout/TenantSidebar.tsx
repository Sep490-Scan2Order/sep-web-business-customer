"use client"

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  ChevronsLeft,
  ChevronsRight,
  ChevronRight,
  LayoutDashboard,
  Layers,
  Store,
  Users,
  UtensilsCrossed,
  LogOut
} from 'lucide-react'
import { ROUTES, TENANT_ROUTES } from '@/src/constants/routes'
import { useAuth } from '@/src/hooks/useAuth'
import apiClient from '@/src/services/apiClient'
import { API } from '@/src/constants/api'
import { toast } from 'react-toastify'
import { useRouter } from 'next/navigation'

type NavItem = {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  hasChildren?: boolean
  match?: 'exact' | 'prefix'
}

const sections: { label: string; items: NavItem[] }[] = [
  {
    label: 'Dashboards',
    items: [
      { label: 'Overview', href: TENANT_ROUTES.DASHBOARD, icon: LayoutDashboard, match: 'prefix' },
    ],
  },
  {
    label: 'User Management',
    items: [
      { label: 'Staff Management', href: TENANT_ROUTES.USERS, icon: Users, hasChildren: true, match: 'prefix' },
    ],
  },
  {
    label: 'Management',
    items: [
      { label: 'Restaurant', href: TENANT_ROUTES.RESTAURANT, icon: Store, hasChildren: true, match: 'prefix' },
      { label: 'Meals Management', href: TENANT_ROUTES.MEALS, icon: UtensilsCrossed, hasChildren: true, match: 'prefix' },
      { label: 'Menu Template', href: TENANT_ROUTES.MENU_TEMPLATE, icon: Layers, hasChildren: true, match: 'prefix' },
    ],
  },
]

export default function TenantSidebar() {
  const pathname = usePathname() || ''
  const [collapsed, setCollapsed] = React.useState(false)
  const sidebarWidth = collapsed ? 'w-20' : 'w-72'
  const {user , logout} = useAuth() 
  const router = useRouter();

  const handleLogOut = async () => {
    const response = await apiClient.post(API.AUTH.LOGOUT);
    if(response.data?.isSuccess) {
      logout();
      toast.success("Đăng xuất thành công");
      router.push(ROUTES.HOME);
    }
  }

  return (
    <aside className={`flex h-screen ${sidebarWidth} shrink-0 flex-col border-r border-slate-200 bg-white px-4 py-5 transition-all`}>
      <div className={`mb-6 flex items-center gap-3 ${collapsed ? 'justify-center' : 'px-2'}`}>
        {!collapsed ? <div className="h-8 w-8 rounded-full bg-slate-200" /> : null}
        {!collapsed ? (
          <div className="flex flex-1 items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-slate-800">Business Customer</div>
              <div className="text-xs text-slate-400">Tenant Portal</div>
            </div>
            <button
              type="button"
              className="flex items-center justify-center rounded-lg border border-slate-200 p-1 text-slate-600 hover:bg-slate-50"
              onClick={() => setCollapsed(true)}
              aria-label="Collapse sidebar"
            >
              <ChevronsLeft className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="flex items-center justify-center rounded-lg border border-slate-200 p-1 text-slate-600 hover:bg-slate-50"
            onClick={() => setCollapsed(false)}
            aria-label="Expand sidebar"
          >
            <ChevronsRight className="h-4 w-4" />
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-6">
        {sections.map((section) => (
          <div key={section.label}>
            {!collapsed ? (
              <div className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                {section.label}
              </div>
            ) : null}
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive = item.match === 'prefix'
                  ? pathname.startsWith(item.href)
                  : pathname === item.href
                const ItemIcon = item.icon

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors ${
                      collapsed ? 'justify-center px-2' : ''
                    } ${
                      isActive
                        ? 'bg-slate-100 text-slate-900'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <ItemIcon className={`h-4 w-4 ${isActive ? 'text-slate-900' : 'text-slate-500'}`} />
                    {!collapsed ? <span className="flex-1 text-left">{item.label}</span> : null}
                    {!collapsed && item.hasChildren ? (
                      <ChevronRight className="h-4 w-4 text-slate-400" />
                    ) : null}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>
      <div className={`mt-auto flex items-center gap-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 hover:bg-red-100 ${collapsed ? 'justify-center' : ''}`}>
        <button onClick={handleLogOut} className="flex items-center gap-2">
          <LogOut className="h-4 w-4" />
          {!collapsed ? <span className="text-sm font-medium">Logout</span> : null}
        </button>
      </div>
    </aside>
  )
}
