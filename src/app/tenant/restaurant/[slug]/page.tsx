'use client'

import React from 'react'
import { useRouter, useParams } from 'next/navigation'
import { toast } from 'react-toastify'
import { ApiResponse, Restaurant } from '@/src/types/type'
import apiClient, { updateRestaurantLocation } from '@/src/services/apiClient'
import { API } from '@/src/constants/api'

interface LocationSearchResult {
  place_id: number
  display_name: string
  lat: string
  lon: string
}

async function getRestaurantDetail(slug: string): Promise<ApiResponse<Restaurant>> {
  const encodedSlug = encodeURIComponent(slug)
  const response = await apiClient.get<ApiResponse<Restaurant>>(
    API.RESTAURANT.GET_RESTAURANT_DETAIL_BY_SLUG(encodedSlug)
  )
  return response.data
}

export default function RestaurantDetailPage() {
  const router = useRouter()
  const params = useParams()
  const slugParam = params.slug
  const slug = Array.isArray(slugParam) ? slugParam[0] : (slugParam as string)

  const [restaurant, setRestaurant] = React.useState<Restaurant | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [isRefreshingQr, setIsRefreshingQr] = React.useState(false)
  const [qrLoadFailed, setQrLoadFailed] = React.useState(false)
  const [qrPreviewKey, setQrPreviewKey] = React.useState(Date.now())
  const [isMapPickerOpen, setIsMapPickerOpen] = React.useState(false)
  const [locationQuery, setLocationQuery] = React.useState('')
  const [isSearchingLocation, setIsSearchingLocation] = React.useState(false)
  const [locationResults, setLocationResults] = React.useState<LocationSearchResult[]>([])
  const [isSavingLocation, setIsSavingLocation] = React.useState(false)

  React.useEffect(() => {
    const fetchRestaurantDetail = async () => {
      try {
        setIsLoading(true)
        const response = await getRestaurantDetail(slug)
        if (response.isSuccess && response.data) {
          setRestaurant(response.data)
          setQrLoadFailed(false)
        } else {
          toast.error(response.message || 'Không thể tải thông tin nhà hàng')
          router.push('/tenant/restaurant')
        }
      } catch (error) {
        console.error('Error fetching restaurant detail:', error)
        toast.error('Có lỗi xảy ra khi tải thông tin nhà hàng')
        router.push('/tenant/restaurant')
      } finally {
        setIsLoading(false)
      }
    }

    if (slug) {
      fetchRestaurantDetail()
    }
  }, [slug, router])

  const handleRefreshQr = async () => {
    if (!slug) return

    try {
      setIsRefreshingQr(true)
      const response = await getRestaurantDetail(slug)

      if (response.isSuccess && response.data) {
        setRestaurant(response.data)
        setQrPreviewKey(Date.now())
        setQrLoadFailed(false)
        toast.success('Đã cập nhật QR mới nhất')
        return
      }

      toast.error(response.message || 'Không thể cập nhật QR lúc này')
    } catch {
      toast.error('Có lỗi xảy ra khi cập nhật QR')
    } finally {
      setIsRefreshingQr(false)
    }
  }

  const getQrPreviewUrl = (qrUrl: string) => {
    const separator = qrUrl.includes('?') ? '&' : '?'
    return `${qrUrl}${separator}v=${qrPreviewKey}`
  }

  const getGoogleMapEmbedUrl = () => {
    if (restaurant?.latitude !== undefined && restaurant?.longitude !== undefined) {
      return `https://www.google.com/maps?q=${restaurant.latitude},${restaurant.longitude}&z=16&output=embed`
    }

    const fallbackQuery = locationQuery || restaurant?.address || restaurant?.restaurantName || 'Vietnam'
    return `https://www.google.com/maps?q=${encodeURIComponent(fallbackQuery)}&output=embed`
  }

  const handleSearchLocation = async () => {
    if (!locationQuery.trim()) {
      toast.info('Vui lòng nhập địa điểm để tìm kiếm')
      return
    }

    try {
      setIsSearchingLocation(true)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=6&q=${encodeURIComponent(locationQuery)}`
      )

      if (!response.ok) {
        throw new Error('Không thể tìm kiếm vị trí')
      }

      const data = (await response.json()) as LocationSearchResult[]
      setLocationResults(data)

      if (data.length === 0) {
        toast.info('Không tìm thấy vị trí phù hợp')
      }
    } catch {
      toast.error('Không thể tìm kiếm vị trí lúc này')
    } finally {
      setIsSearchingLocation(false)
    }
  }

  const handleSelectLocation = async (item: LocationSearchResult) => {
    if (!restaurant) {
      return
    }

    const lat = Number(item.lat)
    const lng = Number(item.lon)

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      toast.error('Tọa độ không hợp lệ')
      return
    }

    const previousLat = restaurant.latitude
    const previousLng = restaurant.longitude

    setRestaurant((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        latitude: lat,
        longitude: lng,
      }
    })
    setLocationQuery(item.display_name)
    setLocationResults([])

    try {
      setIsSavingLocation(true)
      const response = await updateRestaurantLocation({
        id: restaurant.id,
        restaurantName: restaurant.restaurantName,
        address: restaurant.address,
        phone: restaurant.phone,
        description: restaurant.description,
        latitude: lat,
        longitude: lng,
      })

      if (response.isSuccess) {
        if (response.data) {
          setRestaurant(response.data)
        }
        toast.success(response.message || 'Đã lưu vị trí thành công')
        return
      }

      setRestaurant((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          latitude: previousLat,
          longitude: previousLng,
        }
      })
      toast.error(response.message || 'Lưu vị trí thất bại')
    } catch {
      setRestaurant((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          latitude: previousLat,
          longitude: previousLng,
        }
      })
      toast.error('Có lỗi xảy ra khi lưu vị trí')
    } finally {
      setIsSavingLocation(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-slate-600">Đang tải...</p>
      </div>
    )
  }

  if (!restaurant) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-slate-600">Không tìm thấy nhà hàng</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
        >
          <span aria-hidden>←</span>
          Quay lại danh sách
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="relative h-64 bg-linear-to-r from-emerald-600 to-emerald-500">
          {restaurant.image ? (
            <>
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${restaurant.image})` }}
              />
              <div className="absolute inset-0 bg-slate-900/35" />
            </>
          ) : null}

          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <p className="text-xs uppercase tracking-[0.2em] text-white/80">Restaurant Profile</p>
            <h1 className="mt-2 text-3xl font-bold">{restaurant.restaurantName}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-medium">
              <span
                className={`rounded-full px-3 py-1 ${
                  restaurant.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                }`}
              >
                {restaurant.isActive ? 'Hoạt động' : 'Không hoạt động'}
              </span>
              <span
                className={`rounded-full px-3 py-1 ${
                  restaurant.isOpened ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                }`}
              >
                {restaurant.isOpened ? 'Đang mở cửa' : 'Đang đóng cửa'}
              </span>
            </div>
          </div>
        </div>

        <div className="grid gap-6 p-6 lg:grid-cols-[1.5fr_1fr]">
          <div className="space-y-6">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
              <h3 className="mb-4 text-sm font-semibold text-slate-500">Thông tin chung</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Địa chỉ</p>
                  <p className="mt-1 text-sm text-slate-900">{restaurant.address || '—'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Số điện thoại</p>
                  <p className="mt-1 text-sm text-slate-900">{restaurant.phone || '—'}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Mô tả</p>
                  <p className="mt-1 text-sm text-slate-900">{restaurant.description || 'Chưa có mô tả'}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Vị trí</p>
                  <div className="mt-2 rounded-lg border border-slate-200 bg-white p-3">
                    <p className="text-sm text-slate-900">
                      Latitude: {restaurant.latitude ?? '—'}, Longitude: {restaurant.longitude ?? '—'}
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsMapPickerOpen((prev) => !prev)}
                      className="mt-3 inline-flex items-center rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
                    >
                      {isMapPickerOpen ? 'Đóng chọn vị trí' : 'Chọn vị trí'}
                    </button>

                    {isMapPickerOpen ? (
                      <div className="mt-4 space-y-3">
                        <div className="flex flex-col gap-2 sm:flex-row">
                          <input
                            value={locationQuery}
                            onChange={(event) => setLocationQuery(event.target.value)}
                            placeholder="Nhập địa chỉ hoặc tên địa điểm"
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-emerald-500/20 transition focus:border-emerald-500 focus:ring-4"
                          />
                          <button
                            type="button"
                            onClick={handleSearchLocation}
                            disabled={isSearchingLocation || isSavingLocation}
                            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
                          >
                            {isSearchingLocation ? 'Đang tìm...' : 'Tìm trên map'}
                          </button>
                        </div>

                        {isSavingLocation ? (
                          <p className="text-xs text-amber-700">Đang lưu vị trí đã chọn...</p>
                        ) : null}

                        <div className="overflow-hidden rounded-lg border border-slate-200">
                          <iframe
                            title="Google Map picker"
                            src={getGoogleMapEmbedUrl()}
                            className="h-72 w-full"
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                          />
                        </div>

                        {locationResults.length > 0 ? (
                          <div className="max-h-48 space-y-2 overflow-y-auto pr-1">
                            {locationResults.map((item) => (
                              <button
                                key={item.place_id}
                                type="button"
                                onClick={() => void handleSelectLocation(item)}
                                disabled={isSavingLocation}
                                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-left text-xs text-slate-700 hover:border-emerald-300 hover:bg-emerald-50"
                              >
                                {item.display_name}
                              </button>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
                <p className="text-2xl font-bold text-slate-900">{restaurant.totalOrder || 0}</p>
                <p className="mt-1 text-sm text-slate-500">Tổng đơn hàng</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
                <p
                  className={`text-2xl font-bold ${
                    restaurant.isOpened ? 'text-emerald-600' : 'text-red-600'
                  }`}
                >
                  {restaurant.isOpened ? 'Mở' : 'Đóng'}
                </p>
                <p className="mt-1 text-sm text-slate-500">Trạng thái cửa hàng</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
                <p
                  className={`text-2xl font-bold ${
                    restaurant.isReceivingOrders ? 'text-emerald-600' : 'text-red-600'
                  }`}
                >
                  {restaurant.isReceivingOrders ? 'Có' : 'Không'}
                </p>
                <p className="mt-1 text-sm text-slate-500">Nhận đơn</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold text-slate-600">Menu QR</h3>
              <button
                onClick={handleRefreshQr}
                disabled={isRefreshingQr}
                className="inline-flex items-center rounded-lg bg-emerald-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isRefreshingQr ? 'Đang cập nhật...' : 'Cập nhật QR'}
              </button>
            </div>

            {restaurant.qrMenu ? (
              <div className="space-y-3">
                <div className="flex min-h-56 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 p-4">
                  {!qrLoadFailed ? (
                    <img
                      src={getQrPreviewUrl(restaurant.qrMenu)}
                      alt="QR menu"
                      className="h-56 w-56 rounded-lg object-contain"
                      onLoad={() => setQrLoadFailed(false)}
                      onError={() => setQrLoadFailed(true)}
                    />
                  ) : (
                    <div className="text-center">
                      <p className="text-sm font-medium text-red-600">Không tải được ảnh QR</p>
                      <p className="mt-1 text-xs text-slate-500">
                        Hãy nhấn “Cập nhật QR” để tải lại hoặc tạo QR mới nhất.
                      </p>
                    </div>
                  )}
                </div>

                <a
                  href={restaurant.qrMenu}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex text-xs font-medium text-emerald-600 hover:underline"
                >
                  Mở link QR trong tab mới
                </a>
              </div>
            ) : (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                <p className="text-sm font-medium text-amber-700">Chưa có QR menu cho nhà hàng này.</p>
                <p className="mt-1 text-xs text-amber-600">
                  Bạn có thể nhấn “Cập nhật QR” để tải lại dữ liệu mới nhất.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
