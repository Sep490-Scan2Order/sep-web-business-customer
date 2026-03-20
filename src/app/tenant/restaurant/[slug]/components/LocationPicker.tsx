import React from 'react'
import { toast } from 'react-toastify'
import { Restaurant } from '@/src/types/type'
import { updateRestaurantLocation } from '@/src/services/apiClient'

interface LocationSearchResult {
  place_id: number
  display_name: string
  lat: string
  lon: string
}

interface Props {
  restaurant: Restaurant
  isOpen: boolean
  onLocationUpdated: (restaurant: Restaurant) => void
}

const LocationPicker = React.memo(function LocationPicker({
  restaurant,
  isOpen,
  onLocationUpdated,
}: Props) {
  const [locationQuery, setLocationQuery] = React.useState('')
  const [isSearchingLocation, setIsSearchingLocation] = React.useState(false)
  const [locationResults, setLocationResults] = React.useState<LocationSearchResult[]>([])
  const [isSavingLocation, setIsSavingLocation] = React.useState(false)

  const getGoogleMapEmbedUrl = React.useCallback(() => {
    if (restaurant?.latitude !== undefined && restaurant?.longitude !== undefined) {
      return `https://www.google.com/maps?q=${restaurant.latitude},${restaurant.longitude}&z=16&output=embed`
    }

    const fallbackQuery =
      locationQuery || restaurant?.address || restaurant?.restaurantName || 'Vietnam'
    return `https://www.google.com/maps?q=${encodeURIComponent(fallbackQuery)}&output=embed`
  }, [restaurant, locationQuery])

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

  const handleSelectLocation = React.useCallback(
    async (item: LocationSearchResult) => {
      const lat = Number(item.lat)
      const lng = Number(item.lon)

      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        toast.error('Tọa độ không hợp lệ')
        return
      }

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

        if (response.isSuccess && response.data) {
          onLocationUpdated(response.data)
          setLocationQuery(item.display_name)
          setLocationResults([])
          toast.success(response.message || 'Đã lưu vị trí thành công')
          return
        }

        toast.error(response.message || 'Lưu vị trí thất bại')
      } catch {
        toast.error('Có lỗi xảy ra khi lưu vị trí')
      } finally {
        setIsSavingLocation(false)
      }
    },
    [restaurant, onLocationUpdated]
  )

  if (!isOpen) {
    return null
  }

  return (
    <div className="mt-4 space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          value={locationQuery}
          onChange={(event) => setLocationQuery(event.target.value)}
          placeholder="Nhập địa chỉ hoặc tên địa điểm"
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-slate-300 focus:bg-white"
        />
        <button
          type="button"
          onClick={handleSearchLocation}
          disabled={isSearchingLocation || isSavingLocation}
          className="cursor-pointer rounded-xl border border-slate-200 bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
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
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-left text-xs text-slate-700 transition-colors hover:bg-slate-50"
            >
              {item.display_name}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
})

export default LocationPicker
