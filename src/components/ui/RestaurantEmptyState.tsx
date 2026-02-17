'use client'

import React from 'react'
import { Plus } from 'lucide-react'

interface RestaurantEmptyStateProps {
  onCreateClick: () => void
}

export default function RestaurantEmptyState({ onCreateClick }: RestaurantEmptyStateProps) {
  return (
    <div className="flex min-h-[600px] items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        <div className="rounded-3xl border-2 border-dashed border-slate-300 bg-slate-50 p-16">
          <Plus className="h-16 w-16 text-slate-400" strokeWidth={1.5} />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-slate-900">Tạo nhà hàng của bạn</h2>
          <p className="mt-2 text-slate-600">Bắt đầu quản lý nhà hàng của bạn từ bây giờ</p>
        </div>
        <button
          onClick={onCreateClick}
          className="rounded-lg bg-emerald-600 px-6 py-3 font-medium text-white hover:bg-emerald-700"
        >
          Tạo nhà hàng
        </button>
      </div>
    </div>
  )
}
