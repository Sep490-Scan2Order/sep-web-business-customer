"use client"
import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import {
  ChevronsLeft,
  ChevronsRight,
  ChevronRight,
  LayoutDashboard,
  TrendingUp,
  Store,
  Users,
  UtensilsCrossed,
  CreditCard,
  FileText,
  Bot,
  Settings,
  Paperclip,
} from 'lucide-react'

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
      { label: 'Overview', href: "/admin/overview", icon: LayoutDashboard, match: 'prefix' },
      { label: 'Business Insight', href: "/admin/business-insight", icon: TrendingUp, match: 'prefix' },
    ],
  },
  {
    label: 'Management',
    items: [
      { label: 'User Management', href: "/admin/user-management", icon: Users, hasChildren: true, match: 'prefix' },
      { label: 'Tenant Management', href: "/admin/tenant-management", icon: Store, hasChildren: true, match: 'prefix' },
      { label: 'Restaurant Management', href: "/admin/restaurant-management", icon: UtensilsCrossed, hasChildren: true, match: 'prefix' },
      { label: 'Billing & Subscriptions', href: "/admin/billing-subscriptions", icon: CreditCard, hasChildren: true, match: 'prefix' },
      { label: 'Template Management', href: "/admin/template-management", icon: FileText, hasChildren: true, match: 'prefix' },
      { label: 'Blog Management', href: "/admin/blog-management", icon: Paperclip, hasChildren: true, match: 'prefix' },
    ],
  },
  {
    label: 'Settings',
    items: [
      { label: 'AI Settings', href: "/admin/ai-settings", icon: Bot, hasChildren: true, match: 'prefix' },
      { label: 'Global Settings', href: "/admin/global-settings", icon: Settings, hasChildren: true, match: 'prefix' },
    ],
  },
]

export default function AdminSidebar() {
 const pathname = usePathname() || ''
  const [collapsed, setCollapsed] = React.useState(false)
  const sidebarWidth = collapsed ? 'w-20' : 'w-72'

  return (
    <aside className={`flex h-screen ${sidebarWidth} shrink-0 flex-col border-r border-slate-200 bg-white px-4 py-5 transition-all`}>
      <div className={`mb-6 flex items-center gap-3 ${collapsed ? 'justify-center' : 'px-2'}`}>
        {!collapsed ? <div className="h-8 w-8 rounded-full bg-slate-200" /> : null}
        {!collapsed ? (
          <div className="flex flex-1 items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-slate-800">Admin</div>
              <div className="text-xs text-slate-400">Admin Portal</div>
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

    </aside>
  )
}
