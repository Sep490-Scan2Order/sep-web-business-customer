'use client'

import React from 'react'
import { useParams } from 'next/navigation'
import { toast } from 'react-toastify'
import { ApiResponse, Restaurant } from '@/src/types/type'
import apiClient from '@/src/services/apiClient'
import { API } from '@/src/constants/api'
import RestaurantHeader from './components/RestaurantHeader'
import RestaurantHeroCard from './components/RestaurantHeroCard'
import RestaurantGeneralInfo from './components/RestaurantGeneralInfo'
import RestaurantStatistics from './components/RestaurantStatistics'
import RestaurantQRMenu from './components/RestaurantQRMenu'
import MinCashAmountModal from './components/MinCashAmountModal'

async function getRestaurantDetail(slug: string): Promise<ApiResponse<Restaurant>> {
  const encodedSlug = encodeURIComponent(slug)
  const response = await apiClient.get<ApiResponse<Restaurant>>(
    API.RESTAURANT.GET_RESTAURANT_DETAIL_BY_SLUG(encodedSlug)
  )
  return response.data
}

export default function RestaurantDetailPage() {
  const params = useParams()
  const slugParam = params.slug
  const slug = Array.isArray(slugParam) ? slugParam[0] : (slugParam as string)

  // Restaurant data
  const [restaurant, setRestaurant] = React.useState<Restaurant | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)

  // QR Menu state
  const [isRefreshingQr, setIsRefreshingQr] = React.useState(false)
  const [qrLoadFailed, setQrLoadFailed] = React.useState(false)
  const [qrPreviewKey, setQrPreviewKey] = React.useState(Date.now())

  // Min cash amount modal state
  const [isMinCashAmountModalOpen, setIsMinCashAmountModalOpen] = React.useState(false)
  const [minCashAmountInput, setMinCashAmountInput] = React.useState('')
  const [isSavingMinCashAmount, setIsSavingMinCashAmount] = React.useState(false)

  // Fetch restaurant data
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
        }
      } catch (error) {
        console.error('Error fetching restaurant detail:', error)
        toast.error('Có lỗi xảy ra khi tải thông tin nhà hàng')
      } finally {
        setIsLoading(false)
      }
    }

    if (slug) {
      fetchRestaurantDetail()
    }
  }, [slug])

  const handleRefreshQr = React.useCallback(async () => {
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
  }, [slug])

  const handleOpenMinCashAmountModal = React.useCallback(() => {
    setMinCashAmountInput(restaurant?.minCashAmount?.toString() || '')
    setIsMinCashAmountModalOpen(true)
  }, [restaurant?.minCashAmount])

  const handleSaveMinCashAmount = React.useCallback(async () => {
    if (!restaurant) return

    const amount = parseInt(minCashAmountInput, 10)
    if (isNaN(amount) || amount < 0) {
      toast.error('Vui lòng nhập số tiền hợp lệ')
      return
    }

    try {
      setIsSavingMinCashAmount(true)
      const response = await apiClient.put<ApiResponse<string>>(
        API.RESTAURANT.CONFIG_MIN_CASH_AMOUNT(restaurant.id, amount)
      )

      if (response.data.isSuccess) {
        toast.success(response.data.message || 'Đã cập nhật số tiền tối thiểu thành công')
        setIsMinCashAmountModalOpen(false)
        setMinCashAmountInput('')

        // Fetch latest restaurant data
        const updatedData = await getRestaurantDetail(slug)
        if (updatedData.isSuccess && updatedData.data) {
          setRestaurant(updatedData.data)
        }
        return
      }

      toast.error(response.data.message || 'Cập nhật số tiền tối thiểu thất bại')
    } catch {
      toast.error('Có lỗi xảy ra khi cập nhật số tiền tối thiểu')
    } finally {
      setIsSavingMinCashAmount(false)
    }
  }, [minCashAmountInput, restaurant, slug])

  const handleCloseMinCashModal = React.useCallback(() => {
    setIsMinCashAmountModalOpen(false)
    setMinCashAmountInput('')
  }, [])

  const handleLocationUpdated = React.useCallback((updatedRestaurant: Restaurant) => {
    setRestaurant(updatedRestaurant)
  }, [])

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-slate-600">Đang tải...</p>
      </div>
    )
  }

  if (!restaurant) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-slate-600">Không tìm thấy nhà hàng</p>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <RestaurantHeader restaurantName={restaurant.restaurantName} />

        <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
          <div className="space-y-6">
            <RestaurantHeroCard restaurant={restaurant} />

            <RestaurantGeneralInfo
              restaurant={restaurant}
              onOpenMinCashModal={handleOpenMinCashAmountModal}
              onLocationUpdated={handleLocationUpdated}
            />

            <RestaurantStatistics restaurant={restaurant} />
          </div>

          <div className="space-y-6">
            <RestaurantQRMenu
              restaurant={restaurant}
              isRefreshing={isRefreshingQr}
              qrLoadFailed={qrLoadFailed}
              qrPreviewKey={qrPreviewKey}
              onRefresh={handleRefreshQr}
              onQrLoadError={() => setQrLoadFailed(true)}
              onQrLoadSuccess={() => setQrLoadFailed(false)}
            />
          </div>
        </div>
      </div>

      <MinCashAmountModal
        isOpen={isMinCashAmountModalOpen}
        value={minCashAmountInput}
        isSaving={isSavingMinCashAmount}
        onValueChange={setMinCashAmountInput}
        onSave={handleSaveMinCashAmount}
        onCancel={handleCloseMinCashModal}
      />
    </div>
  )
}
