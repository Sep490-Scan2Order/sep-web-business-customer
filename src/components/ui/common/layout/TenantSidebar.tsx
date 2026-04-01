"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronsLeft,
  ChevronsRight,
  ChevronRight,
  ChevronDown,
  LayoutDashboard,
  Store,
  Users,
  UtensilsCrossed,
  LogOut,
  Settings,
  SquareMenu,
  NotepadText,
  TicketPercent,
  Receipt,
} from "lucide-react";
import { ROUTES, TENANT_ROUTES } from "@/src/constants/routes";
import { useAuth } from "@/src/hooks/useAuth";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { UserInfo } from '@/src/types/type'

type ChildItem = {
  label: string;
  href: string;
};

type NavItem = {
  label: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  hasChildren?: boolean;
  children?: ChildItem[];
  match?: "exact" | "prefix";
};

const sections: { label: string; items: NavItem[] }[] = [
  {
    label: "Dashboards",
    items: [
      {
        label: "Overview",
        href: TENANT_ROUTES.DASHBOARD,
        icon: LayoutDashboard,
        match: "prefix",
      },
    ],
  },
  {
    label: "User Management",
    items: [
      {
        label: "Staff Management",
        href: TENANT_ROUTES.USERS,
        icon: Users,
        hasChildren: true,
        match: "prefix",
      },
      {
        label: "Shift Management",
        href: TENANT_ROUTES.SHIFT_REPORTS,
        icon: NotepadText,
        hasChildren: true,
        match: "prefix",
      },
    ],
  },
  {
    label: "Management",
    items: [
      {
        label: "Restaurant",
        href: TENANT_ROUTES.RESTAURANT,
        icon: Store,
        hasChildren: true,
        match: "prefix",
      },
      {
        label: "Order Management",
        href: TENANT_ROUTES.ORDERS,
        icon: Receipt,
        hasChildren: true,
        match: "prefix",
      },
      {
        label: "Meals Management",
        icon: UtensilsCrossed,
        hasChildren: true,
        children: [
          {
            label: "Category",
            href: TENANT_ROUTES.CATEGORY,
          },
          {
            label: "Dish",
            href: TENANT_ROUTES.DISH,
          },
          {
            label: "Branch Dish Management",
            href: TENANT_ROUTES.BRANCH_DISH_MANAGEMENT,
          }
        ],
        match: "prefix",
      },
      {
        label: "Menu Template",
        href: TENANT_ROUTES.MENU_TEMPLATE,
        icon: SquareMenu,
        hasChildren: true,
        match: "prefix",
      },
      {
        label: "Promotion",
        href: TENANT_ROUTES.PROMOTION,
        icon: TicketPercent,
        hasChildren: true,
        match: "prefix",
      }
    ],
  },
  {
    label: "Subscription",
    items: [
      {
        label: "Plans",
        href: TENANT_ROUTES.PLAN,
        icon: NotepadText,
        match: "prefix",
      },
    ],
  },
];


export default function TenantSidebar() {
  const pathname = usePathname() || "";
  const [collapsed, setCollapsed] = React.useState(false);
  const [openDropdowns, setOpenDropdowns] = React.useState<Set<string>>(new Set());
  const sidebarWidth = collapsed ? "w-20" : "w-72";
  const { user, logout } = useAuth();
  const router = useRouter();

  const tenantInfo = (user ?? null) as UserInfo | null

  const handleLogOut = async () => {
      logout();
      toast.success("Đăng xuất thành công");
      router.push(ROUTES.HOME);
  };

  const toggleDropdown = (label: string) => {
    const newOpenDropdowns = new Set(openDropdowns);
    if (newOpenDropdowns.has(label)) {
      newOpenDropdowns.delete(label);
    } else {
      newOpenDropdowns.add(label);
    }
    setOpenDropdowns(newOpenDropdowns);
  };

  return (
    <aside
      className={`sticky top-0 flex h-screen ${sidebarWidth} shrink-0 flex-col border-r border-slate-200 bg-white px-4 py-5 transition-all`}
    >
      <div
        className={`mb-6 flex items-center gap-3 ${collapsed ? "justify-center" : "px-2"}`}
      >
        {!collapsed && tenantInfo ? (
          <div className="h-8 w-8 rounded-full bg-slate-200">
            {tenantInfo.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={tenantInfo.avatar}
                alt="Tenant avatar"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-lg font-semibold">
                {tenantInfo.name}
              </div>
            )}
          </div>
        ) : null}
        {!collapsed && tenantInfo ? (
          <div className="flex flex-1 items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-slate-800">
                {tenantInfo.name}
              </div>
              <div className="text-xs text-slate-400">Tenant Portal</div>
            </div>
            <button
              type="button"
              className="cursor-pointer flex items-center justify-center rounded-lg border border-slate-200 p-1 text-slate-600 hover:bg-slate-50"
              onClick={() => setCollapsed(true)}
              aria-label="Collapse sidebar"
            >
              <ChevronsLeft className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="cursor-pointer flex items-center justify-center rounded-lg border border-slate-200 p-1 text-slate-600 hover:bg-slate-50"
            onClick={() => setCollapsed(false)}
            aria-label="Expand sidebar"
          >
            <ChevronsRight className="h-4 w-4" />
          </button>
        )}
      </div>

      <nav className=" flex-1 space-y-6 overflow-y-auto">
        {sections.map((section) => (
          <div key={section.label}>
            {!collapsed ? (
              <div className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                {section.label}
              </div>
            ) : null}
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive =
                  item.href && item.match === "prefix"
                    ? pathname.startsWith(item.href)
                    : item.href && pathname === item.href;
                const ItemIcon = item.icon;
                const isDropdownOpen = openDropdowns.has(item.label);

                return (
                  <div key={item.label}>
                    {item.hasChildren && item.children ? (
                      <button
                        onClick={() => toggleDropdown(item.label)}
                        title={collapsed ? item.label : undefined}
                        className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors ${
                          collapsed ? "justify-center px-2" : ""
                        } ${
                          isActive
                            ? "bg-slate-100 text-slate-900"
                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                        }`}
                      >
                        <ItemIcon
                          className={`h-4 w-4 ${isActive ? "text-slate-900" : "text-slate-500"}`}
                        />
                        {!collapsed ? (
                          <>
                            <span className="flex-1 text-left">{item.label}</span>
                            <ChevronDown
                              className={`h-4 w-4 text-slate-400 transition-transform ${
                                isDropdownOpen ? "rotate-180" : ""
                              }`}
                            />
                          </>
                        ) : null}
                      </button>
                    ) : (
                      <Link
                        href={item.href || "#"}
                        title={collapsed ? item.label : undefined}
                        className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors ${
                          collapsed ? "justify-center px-2" : ""
                        } ${
                          isActive
                            ? "bg-slate-100 text-slate-900"
                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                        }`}
                      >
                        <ItemIcon
                          className={`h-4 w-4 ${isActive ? "text-slate-900" : "text-slate-500"}`}
                        />
                        {!collapsed ? (
                          <span className="flex-1 text-left">{item.label}</span>
                        ) : null}
                        {!collapsed && item.hasChildren ? (
                          <ChevronRight className="h-4 w-4 text-slate-400" />
                        ) : null}
                      </Link>
                    )}

                    {/* Dropdown menu */}
                    {item.children && isDropdownOpen && !collapsed && (
                      <div className="ml-4 mt-1 space-y-1 border-l border-slate-200 pl-4">
                        {item.children.map((child) => {
                          const isChildActive = pathname === child.href;
                          return (
                            <Link
                              key={child.label}
                              href={child.href}
                              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                                isChildActive
                                  ? "bg-slate-100 font-medium text-slate-900"
                                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                              }`}
                            >
                              <div className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                              <span>{child.label}</span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      <div
        className={`cursor-pointer mt-auto flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 ${collapsed ? "justify-center" : ""}`}
        onClick={() => router.push(TENANT_ROUTES.SETTINGS)}
      >
        <button className="cursor-pointer flex items-center gap-2">
          <Settings className="h-4 w-4" />
          {!collapsed ? (
            <span className="text-sm font-medium">Setting</span>
          ) : null}
        </button>
      </div>
      <div
        className={`cursor-pointer mt-auto flex items-center gap-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 hover:bg-red-100 ${collapsed ? "justify-center" : ""}`}
        onClick={handleLogOut}
      >
        <button className="cursor-pointer flex items-center gap-2">
          <LogOut className="h-4 w-4" />
          {!collapsed ? (
            <span className="text-sm font-medium">Logout</span>
          ) : null}
        </button>
      </div>
    </aside>
  );
}
