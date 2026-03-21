import React from 'react'
import { Restaurant } from '@/src/types/type'
import { MapPin, Phone, Store } from 'lucide-react'
import { API } from '@/src/constants/api'

interface Props {
  restaurant: Restaurant
  imageVersion?: number
}

const RestaurantHeroCard = React.memo(function RestaurantHeroCard({ restaurant, imageVersion }: Props) {
  const imageSrc = React.useMemo(() => {
    const rawImage = restaurant.image
    if (!rawImage?.trim()) {
      return ''
    }

    const normalizedPath = rawImage.trim().replace(/\\/g, '/')
    const isAbsolute = /^(https?:)?\/\//i.test(normalizedPath)
    const isInlineData = normalizedPath.startsWith('data:') || normalizedPath.startsWith('blob:')

    const baseUrl = API.BASE_URL?.replace(/\/$/, '')
    const absoluteUrl =
      isAbsolute || isInlineData || !baseUrl
        ? normalizedPath
        : `${baseUrl}/${normalizedPath.replace(/^\/+/, '')}`

    if (!imageVersion) {
      return absoluteUrl
    }

    const separator = absoluteUrl.includes('?') ? '&' : '?'
    return `${absoluteUrl}${separator}v=${imageVersion}`
  }, [imageVersion, restaurant.image])

  const activeStatus = restaurant.isActive
    ? { label: 'Hoạt động', classes: 'bg-emerald-50 text-emerald-600' }
    : { label: 'Không hoạt động', classes: 'bg-slate-100 text-slate-600' }

  const openedStatus = restaurant.isOpened
    ? { label: 'Đang mở cửa', classes: 'bg-blue-50 text-blue-700' }
    : { label: 'Đang đóng cửa', classes: 'bg-amber-50 text-amber-600' }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="grid gap-0 lg:grid-cols-[280px_1fr]">
        <div className="relative aspect-[4/3] overflow-hidden bg-slate-100 lg:aspect-auto lg:min-h-[240px]">
          {imageSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageSrc}
              alt={restaurant.restaurantName}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-slate-100">
              <Store className="h-10 w-10 text-slate-400" />
            </div>
          )}
        </div>

        <div className="p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Restaurant Profile</p>
          <h2 className="mt-1 text-xl font-semibold text-slate-900">{restaurant.restaurantName}</h2>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${activeStatus.classes}`}>
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
              {activeStatus.label}
            </span>
            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${openedStatus.classes}`}>
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
              {openedStatus.label}
            </span>
          </div>

          {restaurant.description ? (
            <p className="mt-4 line-clamp-2 text-sm text-slate-600">{restaurant.description}</p>
          ) : null}

          <div className="mt-4 space-y-2">
            <div className="flex items-start gap-2 text-sm text-slate-600">
              <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-400" />
              <span className="line-clamp-2">{restaurant.address || 'Chưa cập nhật địa chỉ'}</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Phone className="h-4 w-4 flex-shrink-0 text-slate-400" />
              <span>{restaurant.phone || 'Chưa cập nhật số điện thoại'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})

export default RestaurantHeroCard
