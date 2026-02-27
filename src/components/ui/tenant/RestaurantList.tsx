'use client'

import React from 'react'
import { useRouter } from 'next/navigation'

export interface Restaurant {
  id: string
  name: string
  status?: 'active' | 'inactive'
  image?: string
  slug?: string
}

interface RestaurantListProps {
  restaurants: Restaurant[]
  onCreateClick: () => void
}

export default function RestaurantList({ restaurants, onCreateClick }: RestaurantListProps) {
  const router = useRouter()
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-slate-900">QUẢN LÝ NHÀ HÀNG</h2>
        <button
          onClick={onCreateClick}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
        >
          + Thêm nhà hàng
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {restaurants.map((restaurant) => (
          <div
            key={restaurant.id}
            onClick={() => {
              if (restaurant.slug) {
                const encodedSlug = encodeURIComponent(restaurant.slug)
                router.push(`/tenant/restaurant/${encodedSlug}`)
              }
            }}
            className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          >
            <div 
              className="aspect-video bg-emerald-600 bg-cover bg-center"
              style={{
                backgroundImage: restaurant.image 
                  ? `url(${restaurant.image})` 
                  : undefined
              }}
            />
            <div className="p-4">
              <p className="text-sm font-medium text-slate-700 truncate">
                {restaurant.name}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
