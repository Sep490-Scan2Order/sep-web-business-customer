'use client'

import React, { useMemo } from 'react'
import { ExternalLink, Search } from 'lucide-react'
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from 'react-leaflet'
import L from 'leaflet'

export interface RestaurantLocationMapProps {
  latitude?: number
  longitude?: number
  onChange: (latitude: number, longitude: number) => void
}

const DEFAULT_CENTER: [number, number] = [10.7769, 106.7009]
const DEFAULT_ZOOM = 12
const SELECTED_LOCATION_ZOOM = 16

interface GeocodeSearchResult {
  place_id: number
  display_name: string
  lat: string
  lon: string
}

const markerIcon = L.divIcon({
  className: 'restaurant-location-pin',
  html: '<div style="width:16px;height:16px;background:#0f172a;border:2px solid #ffffff;border-radius:9999px;box-shadow:0 0 0 4px rgba(15,23,42,0.2);"></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
})

function MapViewport({ latitude, longitude }: { latitude?: number; longitude?: number }) {
  const map = useMap()

  React.useEffect(() => {
    if (latitude === undefined || longitude === undefined) {
      return
    }

    map.flyTo([latitude, longitude], SELECTED_LOCATION_ZOOM, {
      duration: 0.5,
    })
  }, [latitude, longitude, map])

  return null
}

function MapClickHandler({
  latitude,
  longitude,
  onChange,
}: {
  latitude?: number
  longitude?: number
  onChange: (latitude: number, longitude: number) => void
}) {
  useMapEvents({
    click(event) {
      onChange(event.latlng.lat, event.latlng.lng)
    },
  })

  if (latitude === undefined || longitude === undefined) {
    return null
  }

  return <Marker position={[latitude, longitude]} icon={markerIcon} />
}

export default function RestaurantLocationMap({
  latitude,
  longitude,
  onChange,
}: RestaurantLocationMapProps) {
  const [searchKeyword, setSearchKeyword] = React.useState('')
  const [searchResults, setSearchResults] = React.useState<GeocodeSearchResult[]>([])
  const [isSearching, setIsSearching] = React.useState(false)

  const center = useMemo<[number, number]>(() => {
    if (latitude !== undefined && longitude !== undefined) {
      return [latitude, longitude]
    }

    return DEFAULT_CENTER
  }, [latitude, longitude])

  const handleSearchLocation = async () => {
    const keyword = searchKeyword.trim()

    if (!keyword) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=6&accept-language=vi&countrycodes=vn&q=${encodeURIComponent(keyword)}`
      )

      if (!response.ok) {
        throw new Error('Search request failed')
      }

      const data = (await response.json()) as GeocodeSearchResult[]
      setSearchResults(data)
    } catch {
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleSelectLocation = (result: GeocodeSearchResult) => {
    const lat = Number.parseFloat(result.lat)
    const lng = Number.parseFloat(result.lon)

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return
    }

    onChange(lat, lng)
    setSearchKeyword(result.display_name)
    setSearchResults([])
  }

  const handleOpenGoogleMaps = () => {
    if (latitude === undefined || longitude === undefined) {
      return
    }

    const url = `https://www.google.com/maps?q=${latitude},${longitude}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchKeyword}
              onChange={(event) => setSearchKeyword(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  void handleSearchLocation()
                }
              }}
              placeholder="Tìm địa điểm (VD: 1 Võ Văn Ngân, Thủ Đức)"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-300 focus:bg-white"
            />
          </div>
          <button
            type="button"
            onClick={() => {
              void handleSearchLocation()
            }}
            disabled={isSearching}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSearching ? 'Đang tìm...' : 'Tìm'}
          </button>
          <button
            type="button"
            onClick={handleOpenGoogleMaps}
            disabled={latitude === undefined || longitude === undefined}
            className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Google Maps
            <ExternalLink className="h-3.5 w-3.5" />
          </button>
        </div>

        {searchResults.length > 0 ? (
          <div className="absolute z-[1000] mt-2 max-h-52 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg">
            {searchResults.map((result) => (
              <button
                key={result.place_id}
                type="button"
                onClick={() => handleSelectLocation(result)}
                className="block w-full border-b border-slate-100 px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 last:border-b-0"
              >
                {result.display_name}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200">
        <MapContainer
          center={center}
          zoom={latitude !== undefined && longitude !== undefined ? SELECTED_LOCATION_ZOOM : DEFAULT_ZOOM}
          className="h-72 w-full"
          scrollWheelZoom
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapViewport latitude={latitude} longitude={longitude} />
          <MapClickHandler latitude={latitude} longitude={longitude} onChange={onChange} />
        </MapContainer>
      </div>
    </div>
  )
}
