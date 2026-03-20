import React from 'react'
import { Restaurant } from '@/src/types/type'

interface Props {
  restaurant: Restaurant
}

const RestaurantStatistics = React.memo(function RestaurantStatistics({ restaurant }: Props) {
  const totalOrder = restaurant.totalOrder || 0

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
        Operational Overview
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Tổng đơn hàng</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{totalOrder}</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Trạng thái cửa hàng</p>
          <span
            className={`mt-2 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
              restaurant.isOpened ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {restaurant.isOpened ? 'Đang mở cửa' : 'Đang đóng cửa'}
          </span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Nhận đơn</p>
          <span
            className={`mt-2 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
              restaurant.isReceivingOrders ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-600'
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {restaurant.isReceivingOrders ? 'Có nhận đơn' : 'Tạm dừng'}
          </span>
        </div>
      </div>
    </div>
  )
})

export default RestaurantStatistics
