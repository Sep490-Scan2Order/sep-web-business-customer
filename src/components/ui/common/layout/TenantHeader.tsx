import React from 'react'

const IconBell = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4 stroke-slate-500" fill="none" stroke="currentColor" strokeWidth="1.6">
    <path d="M6 17h12" />
    <path d="M8 17V10a4 4 0 1 1 8 0v7" />
    <path d="M10 17a2 2 0 0 0 4 0" />
  </svg>
)

const IconSearch = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4 stroke-slate-400" fill="none" stroke="currentColor" strokeWidth="1.6">
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-3.5-3.5" />
  </svg>
)

export default function TenantHeader() {
  return (
    <header className="border-b border-slate-200 bg-white px-6 py-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className="min-w-[200px]">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Dashboards</div>
          <div className="text-lg font-semibold text-slate-900">Overview</div>
        </div>

        <div className="flex flex-1 items-center gap-3">
          <div className="flex w-full max-w-md items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
            <IconSearch />
            <input
              type="search"
              placeholder="Search..."
              className="w-full bg-transparent outline-none placeholder:text-slate-400"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
          >
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>Active</span>
          </button>

          <button
            type="button"
            className="flex items-center justify-center rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"
            aria-label="Notifications"
          >
            <IconBell />
          </button>

          <button
            type="button"
            className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            <span className="h-7 w-7 rounded-full bg-slate-200" />
            <span className="font-medium">Business Customer</span>
          </button>
        </div>
      </div>
    </header>
  )
}
