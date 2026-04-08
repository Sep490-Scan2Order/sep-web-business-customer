'use client'

import React from 'react'
import { toast } from 'react-toastify'
import TenantInfoRequirement from '@/src/components/ui/tenant/TenantInfoRequirement'
import RestaurantEmptyState from '@/src/components/ui/tenant/RestaurantEmptyState'
import RestaurantList from '@/src/components/ui/tenant/RestaurantList'
import type { TenantInfo } from '@/src/components/ui/tenant/TenantInfoRequirement'
import { ApiResponse, CreateRestaurantRequest, Restaurant } from '@/src/types/type'
import apiClient from '@/src/services/apiClient'
import { API } from '@/src/constants/api'

function logRestaurantCoordinateDebug(label: string, payload: CreateRestaurantRequest) {
  if (process.env.NODE_ENV === 'production') {
    return
  }

  console.log(`[restaurant:${label}] coordinate payload`, {
    latitude: payload.latitude,
    longitude: payload.longitude,
  })
}

function warnCoordinateMismatch(
  action: 'create' | 'update',
  payload: CreateRestaurantRequest,
  restaurant: Restaurant
) {
  if (payload.latitude === undefined || payload.longitude === undefined) {
    return
  }

  const latDiff = Math.abs((restaurant.latitude ?? 0) - payload.latitude)
  const lngDiff = Math.abs((restaurant.longitude ?? 0) - payload.longitude)
  const mismatchThreshold = 0.000001

  if (latDiff > mismatchThreshold || lngDiff > mismatchThreshold) {
    console.warn(`[restaurant:${action}] Coordinate mismatch`, {
      sent: {
        latitude: payload.latitude,
        longitude: payload.longitude,
      },
      received: {
        latitude: restaurant.latitude,
        longitude: restaurant.longitude,
      },
    })

    toast.warn('Tọa độ API trả về khác với tọa độ đã gửi. Vui lòng kiểm tra backend.')
  }
}

function buildRestaurantFormData(data: CreateRestaurantRequest): FormData {
  const formData = new FormData()

  // Key names must match backend DTO properties exactly.
  formData.append('RestaurantName', data.restaurantName)
  if (data.address !== undefined) formData.append('Address', data.address)
  if (data.latitude !== undefined) formData.append('Latitude', data.latitude.toString())
  if (data.longitude !== undefined) formData.append('Longitude', data.longitude.toString())
  if (data.image !== undefined) formData.append('Image', data.image)
  if (data.phone !== undefined) formData.append('Phone', data.phone)
  if (data.description !== undefined) formData.append('Description', data.description)
  if (data.openTime !== undefined && data.openTime !== '') formData.append('OpenTime', data.openTime)
  if (data.closeTime !== undefined && data.closeTime !== '') formData.append('CloseTime', data.closeTime)

  return formData
}

async function createRestaurant(
  data: CreateRestaurantRequest
): Promise<ApiResponse<Restaurant>> {
  const formData = buildRestaurantFormData(data)

  const response = await apiClient.post<ApiResponse<Restaurant>>(
    API.RESTAURANT.CREATE,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  )

  return response.data
}

async function updateRestaurant(
  id: string,
  data: CreateRestaurantRequest
): Promise<ApiResponse<Restaurant>> {
  const formData = buildRestaurantFormData(data)

  const response = await apiClient.put<ApiResponse<Restaurant>>(
    API.RESTAURANT.UPDATE(id),
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  )

  return response.data
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
  const [restaurants, setRestaurants] = React.useState<Restaurant[]>([])
  const [restaurantImageVersions, setRestaurantImageVersions] = React.useState<Record<number, number>>({})
  const [modalMode, setModalMode] = React.useState<'create' | 'edit'>('create')
  const [editingRestaurantId, setEditingRestaurantId] = React.useState<string | null>(null)

  // Fetch restaurants on component mount
  React.useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await getAllRestaurants()
        console.log('Fetched restaurants:', response)
        if (response.isSuccess && response.data) {
          setRestaurants(response.data)
          setRestaurantImageVersions({})
        }
      } catch (error) {
        console.error('Error fetching restaurants:', error)
        toast.error('Không thể tải danh sách nhà hàng')
      }
    }

    fetchRestaurants()
  }, [])

  const handleCreateClick = () => {
    setModalMode('create')
    setEditingRestaurantId(null)
    setShowInfoModal(true)
  }

  const handleCloseModal = React.useCallback(() => {
    setShowInfoModal(false)
    setModalMode('create')
    setEditingRestaurantId(null)
  }, [])

  const handleEditClick = React.useCallback((restaurantId: string) => {
    setModalMode('edit')
    setEditingRestaurantId(restaurantId)
    setShowInfoModal(true)
  }, [])

  const editingRestaurant = React.useMemo(() => {
    if (!editingRestaurantId) {
      return null
    }
    return restaurants.find((restaurant) => restaurant.id.toString() === editingRestaurantId) ?? null
  }, [editingRestaurantId, restaurants])

  const handleSubmit = async (info: TenantInfo) => {
    setIsLoading(true)
    try {
      const payload: CreateRestaurantRequest = {
        restaurantName: info.restaurantName,
        phone: info.phone,
        address: info.address,
        description: info.description,
        openTime: info.openTime,
        closeTime: info.closeTime,
        latitude: info.latitude,
        longitude: info.longitude,
        image: info.image,
      }

      if (modalMode === 'edit') {
        if (!editingRestaurantId || !editingRestaurant) {
          toast.error('Không xác định được nhà hàng cần cập nhật')
          return
        }
        logRestaurantCoordinateDebug('update:before-submit', payload)
        console.log('Updating restaurant with ID:', editingRestaurantId, 'Payload:', payload)
        const response = await updateRestaurant(editingRestaurantId, {
          ...payload,
          latitude: payload.latitude ?? editingRestaurant.latitude,
          longitude: payload.longitude ?? editingRestaurant.longitude,
        })
        console.log('Update response:', response)
        if (response.isSuccess && response.data) {
          const updatedRestaurant = response.data
          warnCoordinateMismatch('update', payload, updatedRestaurant)
          toast.success(response.message || 'Cập nhật nhà hàng thành công!')
          const imageRefreshVersion = Date.now()
          setRestaurants((prev) =>
            prev.map((restaurant) =>
              restaurant.id === updatedRestaurant.id ? updatedRestaurant : restaurant
            )
          )
          setRestaurantImageVersions((prev) => ({
            ...prev,
            [updatedRestaurant.id]: imageRefreshVersion,
          }))
          handleCloseModal()
        } else {
          toast.error(response.message || 'Cập nhật nhà hàng thất bại')
        }
        return
      }

      logRestaurantCoordinateDebug('create:before-submit', payload)
      const response = await createRestaurant(payload)

      if (response.isSuccess && response.data) {
        warnCoordinateMismatch('create', payload, response.data)
        toast.success(response.message || 'Tạo nhà hàng thành công!')

        setRestaurants((prev) => [...prev, response.data as Restaurant])
        handleCloseModal()
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
        <RestaurantList
          restaurants={restaurants.map((restaurant) => ({
            id: restaurant.id.toString(),
            name: restaurant.restaurantName,
            status: restaurant.isActive ? 'active' : 'inactive',
            image: restaurant.image,
            slug: restaurant.slug,
            openTime: restaurant.openTime,
            closeTime: restaurant.closeTime,
            imageVersion: restaurantImageVersions[restaurant.id],
          }))}
          onCreateClick={handleCreateClick}
          onEditClick={handleEditClick}
        />
      )}

      <TenantInfoRequirement
        isOpen={showInfoModal}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        mode={modalMode}
        initialData={
          editingRestaurant
            ? {
                restaurantName: editingRestaurant.restaurantName,
                phone: editingRestaurant.phone,
                description: editingRestaurant.description,
                address: editingRestaurant.address,
                latitude: editingRestaurant.latitude,
                longitude: editingRestaurant.longitude,
                openTime: editingRestaurant.openTime ?? undefined,
                closeTime: editingRestaurant.closeTime ?? undefined,
                imageUrl: editingRestaurant.image,
              }
            : undefined
        }
      />
    </div>
  )
}
