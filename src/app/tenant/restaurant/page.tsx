'use client'

import React from 'react'
import { toast } from 'react-toastify'
import TenantInfoRequirement from '@/src/components/ui/TenantInfoRequirement'
import RestaurantEmptyState from '@/src/components/ui/RestaurantEmptyState'
import RestaurantList from '@/src/components/ui/RestaurantList'
import type { TenantInfo } from '@/src/components/ui/TenantInfoRequirement'
import type { Restaurant as RestaurantListItem } from '@/src/components/ui/RestaurantList'
import { ApiResponse, CreateRestaurantRequest, Restaurant } from '@/src/types/type'
import apiClient from '@/src/services/apiClient'
import { API } from '@/src/constants/api'

async function createRestaurant(
  data: CreateRestaurantRequest
): Promise<ApiResponse<Restaurant>> {
  const formData = new FormData();
  
  // Lưu ý: Key phải khớp chính xác tuyệt đối với Property trong C# Request DTO
  formData.append('RestaurantName', data.restaurantName);
  if (data.address) formData.append('Address', data.address);
  if (data.latitude !== undefined) formData.append('Latitude', data.latitude.toString());
  if (data.longitude !== undefined) formData.append('Longitude', data.longitude.toString());
  if (data.image) formData.append('Image', data.image); // File object từ input
  if (data.phone) formData.append('Phone', data.phone);
  if (data.description) formData.append('Description', data.description);

  const response = await apiClient.post<ApiResponse<Restaurant>>(
    API.RESTAURANT.CREATE,
    formData,
    {
      headers: {
        // Đảm bảo không bị ghi đè bởi application/json mặc định của apiClient
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return response.data;
}

async function getAllRestaurants(): Promise<ApiResponse<Restaurant[]>> {
  const response = await apiClient.get<ApiResponse<Restaurant[]>>(
    API.RESTAURANT.GET_ALL_RESTAURANT_BY_TENANT_ID
  )
  return response.data
}

export default function RestaurantPage() {
  const [showInfoModal, setShowInfoModal] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [restaurants, setRestaurants] = React.useState<RestaurantListItem[]>([])

  // Fetch restaurants on component mount
  React.useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await getAllRestaurants()
        if (response.isSuccess && response.data) {
          // Map the API response to the Restaurant type expected by RestaurantList
          const mappedRestaurants: RestaurantListItem[] = response.data.map((r) => ({
            id: r.id.toString(),
            name: r.restaurantName,
            status: r.isActive ? 'active' : 'inactive',
            image: r.image,
            slug: r.slug,
          }))
          setRestaurants(mappedRestaurants)
        }
      } catch (error) {
        console.error('Error fetching restaurants:', error)
        toast.error('Không thể tải danh sách nhà hàng')
      }
    }

    fetchRestaurants()
  }, [])

  const handleCreateClick = () => {
    setShowInfoModal(true)
  }

  const handleSubmit = async (info: TenantInfo) => {
    setIsLoading(true)
    try {
      const response = await createRestaurant({
        restaurantName: info.restaurantName,
        phone: info.phone,
        address: info.address,
        description: info.description,
        latitude: info.latitude,
        longitude: info.longitude,
        image: info.image,
      })

      if (response.isSuccess && response.data) {
        toast.success(response.message || 'Tạo nhà hàng thành công!')
        
        // Add new restaurant to list
        const newRestaurant: RestaurantListItem = {
          id: response.data.id.toString(),
          name: response.data.restaurantName,
          status: response.data.isActive ? 'active' : 'inactive',
          image: response.data.image,
          slug: response.data.slug,
        }
        setRestaurants((prev) => [...prev, newRestaurant])
        setShowInfoModal(false)
      } else {
        toast.error(response.message || 'Tạo nhà hàng thất bại')
      }
    } catch (error) {
      console.error('Error creating restaurant:', error)
      toast.error(error instanceof Error ? error.message : 'Có lỗi xảy ra khi tạo nhà hàng')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      {restaurants.length === 0 ? (
        <RestaurantEmptyState onCreateClick={handleCreateClick} />
      ) : (
        <RestaurantList restaurants={restaurants} onCreateClick={handleCreateClick} />
      )}

      <TenantInfoRequirement
        isOpen={showInfoModal}
        onClose={() => setShowInfoModal(false)}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </div>
  )
}
