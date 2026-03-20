import React from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

interface Props {
  restaurantName: string
}

export default function RestaurantHeader({ restaurantName }: Props) {
  const router = useRouter()

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Restaurant Management</p>
          <h1 className="mt-1 text-lg font-semibold text-slate-900">{restaurantName}</h1>
          <p className="mt-1 text-sm text-slate-500">Chi tiết nhà hàng và cấu hình vận hành</p>
        </div>

        <button
          onClick={() => router.back()}
          className="cursor-pointer inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại danh sách
        </button>
      </div>
    </div>
  )
}
