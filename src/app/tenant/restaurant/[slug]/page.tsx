'use client'

import React from 'react'
import { useRouter, useParams } from 'next/navigation'
import { toast } from 'react-toastify'
import { ApiResponse, Restaurant } from '@/src/types/type'
import apiClient from '@/src/services/apiClient'
import { API } from '@/src/constants/api'

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
  const slug = params.slug as string

  const [restaurant, setRestaurant] = React.useState<Restaurant | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    const fetchRestaurantDetail = async () => {
      try {
        setIsLoading(true)
        console.log('Fetching restaurant with slug:', slug)
        const response = await getRestaurantDetail(slug)
        console.log('Restaurant response:', response)
        if (response.isSuccess && response.data) {
          setRestaurant(response.data)
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
    <div>
      <button
        onClick={() => router.back()}
        className="mb-6 text-slate-600 hover:text-slate-900 flex items-center gap-2"
      >
        ← Quay lại
      </button>

      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        {/* Header with image */}
        {restaurant.image && (
          <div
            className="h-64 bg-emerald-600 bg-cover bg-center"
            style={{ backgroundImage: `url(${restaurant.image})` }}
          />
        )}

        {/* Content */}
        <div className="p-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">
            {restaurant.restaurantName}
          </h1>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Left column */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-600 mb-1">Địa chỉ</h3>
                <p className="text-slate-900">{restaurant.address}</p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-600 mb-1">Số điện thoại</h3>
                <p className="text-slate-900">{restaurant.phone}</p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-600 mb-1">Trạng thái</h3>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                      restaurant.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {restaurant.isActive ? 'Hoạt động' : 'Không hoạt động'}
                  </span>
                </div>
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-600 mb-1">Vị trí</h3>
                <p className="text-slate-900">
                  Latitude: {restaurant.latitude}, Longitude: {restaurant.longitude}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-600 mb-1">Mô tả</h3>
                <p className="text-slate-900">{restaurant.description}</p>
              </div>

              {restaurant.qrMenu && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-600 mb-1">Menu QR</h3>
                  <a
                    href={restaurant.qrMenu}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-600 hover:underline"
                  >
                    {restaurant.qrMenu}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Additional info */}
          <div className="mt-6 pt-6 border-t border-slate-200">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {restaurant.totalOrder || 0}
                </p>
                <p className="text-sm text-slate-600">Tổng đơn hàng</p>
              </div>
              <div>
                <p className={`text-2xl font-bold ${restaurant.isOpened ? 'text-green-600' : 'text-red-600'}`}>
                  {restaurant.isOpened ? 'Mở' : 'Đóng'}
                </p>
                <p className="text-sm text-slate-600">Trạng thái cửa hàng</p>
              </div>
              <div>
                <p className={`text-2xl font-bold ${restaurant.isReceivingOrders ? 'text-green-600' : 'text-red-600'}`}>
                  {restaurant.isReceivingOrders ? 'Có' : 'Không'}
                </p>
                <p className="text-sm text-slate-600">Nhận đơn</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
