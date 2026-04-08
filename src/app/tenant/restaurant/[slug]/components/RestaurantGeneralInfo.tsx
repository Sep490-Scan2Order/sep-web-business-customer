import React from 'react'
import { Restaurant } from '@/src/types/type'
import LocationPicker from './LocationPicker'
import { MapPin, Phone, FileText, Wallet } from 'lucide-react'

interface Props {
  restaurant: Restaurant
  onOpenMinCashModal: () => void
  onLocationUpdated: (restaurant: Restaurant) => void
}

const RestaurantGeneralInfo = React.memo(function RestaurantGeneralInfo({
  restaurant,
  onOpenMinCashModal,
  onLocationUpdated,
}: Props) {
  const [isMapPickerOpen, setIsMapPickerOpen] = React.useState(false)
  const hasMinCash = restaurant.minCashAmount !== null && restaurant.minCashAmount !== undefined
  const hasOpenTime = Boolean(restaurant.openTime)
  const hasCloseTime = Boolean(restaurant.closeTime)

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Restaurant Detail</p>
        <h3 className="mt-1 text-lg font-semibold text-slate-900">Thông tin chung</h3>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
            <MapPin className="h-3.5 w-3.5" />
            Địa chỉ
          </p>
          <p className="mt-2 text-sm text-slate-900">{restaurant.address || 'Chưa cập nhật'}</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
            <Phone className="h-3.5 w-3.5" />
            Số điện thoại
          </p>
          <p className="mt-2 text-sm text-slate-900">{restaurant.phone || 'Chưa cập nhật'}</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Giờ hoạt động</p>
          <p className="mt-2 text-sm text-slate-900">
            {hasOpenTime || hasCloseTime
              ? `${restaurant.openTime || '--:--'} - ${restaurant.closeTime || '--:--'}`
              : 'Chưa cập nhật'}
          </p>
        </div>

        <div className="sm:col-span-2 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
            <FileText className="h-3.5 w-3.5" />
            Mô tả
          </p>
          <p className="mt-2 text-sm text-slate-900">{restaurant.description || 'Chưa có mô tả'}</p>
        </div>

        <div className="sm:col-span-2 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Vị trí</p>
          <div className="mt-2 rounded-xl border border-slate-200 bg-white p-3">
            <p className="text-sm text-slate-900">
              Latitude: {restaurant.latitude ?? 'N/A'}, Longitude: {restaurant.longitude ?? 'N/A'}
            </p>
            <button
              type="button"
              onClick={() => setIsMapPickerOpen((prev) => !prev)}
              className="cursor-pointer mt-3 inline-flex items-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              {isMapPickerOpen ? 'Đóng chọn vị trí' : 'Chọn vị trí'}
            </button>

            <LocationPicker
              restaurant={restaurant}
              isOpen={isMapPickerOpen}
              onLocationUpdated={onLocationUpdated}
            />
          </div>
        </div>

        <div className="sm:col-span-2 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
            <Wallet className="h-3.5 w-3.5" />
            Số tiền tối thiểu trong két
          </p>
          <div className="mt-2 rounded-xl border border-slate-200 bg-white p-3">
            <p className="text-sm font-semibold text-slate-900">
              {hasMinCash ? restaurant.minCashAmount.toLocaleString('vi-VN') + ' VND' : 'N/A'}
            </p>
            <button
              type="button"
              onClick={onOpenMinCashModal}
              className="cursor-pointer mt-3 inline-flex items-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              Chỉnh sửa
            </button>
          </div>
        </div>
      </div>
    </div>
  )
})

export default RestaurantGeneralInfo
