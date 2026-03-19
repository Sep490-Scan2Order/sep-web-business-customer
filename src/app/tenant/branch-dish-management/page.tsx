'use client'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ApiResponse, Restaurant } from '@/src/types/type'
import apiClient from '@/src/services/apiClient'
import { API } from '@/src/constants/api'
import { toast } from 'react-toastify'
import RestaurantListV2 from '@/src/components/ui/tenant/RestaurantListV2'

export default function BranchDishManagementPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoading(true)
        const response = await apiClient.get<ApiResponse<Restaurant[]>>(API.RESTAURANT.GET_ALL_RESTAURANT_BY_TENANT_ID)
        if (response.data.isSuccess) {
          setRestaurants(response.data.data || [])
        } else {
          toast.error(response.data.message || 'Có lỗi xảy ra khi tải dữ liệu')
        }
      } catch (error: unknown) {
        const backendMessage = (
          error as { response?: { data?: { message?: string } } }
        ).response?.data?.message
        toast.error(
          backendMessage ||
            (error as { message?: string }).message ||
            'Có lỗi xảy ra khi tải dữ liệu',
        )
      } finally {
        setLoading(false)
      }
    }

    void fetchRestaurants()
  }, [])

  const handleRestaurantClick = (restaurant: Restaurant) => {
    router.push(`/tenant/branch-dish-management/${restaurant.id}`)
  }

  return (
    <div>
      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center text-sm text-slate-500">
          Đang tải danh sách nhà hàng...
        </div>
      ) : (
        <RestaurantListV2 restaurants={restaurants} onRestaurantClick={handleRestaurantClick} />
      )}
    </div>
  )
}
