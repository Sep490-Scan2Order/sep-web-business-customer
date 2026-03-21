'use client'

import React, { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { X, MapPin, Upload, Loader2, Plus, Save } from 'lucide-react'
import { toast } from 'react-toastify'
import { ProvinceSummary, DistrictSummary } from '@/src/types/type'
import type { RestaurantLocationMapProps } from '@/src/components/ui/tenant/RestaurantLocationMap'

export interface TenantInfo {
  restaurantName: string
  phone: string
  description?: string
  image?: File
  address?: string
  provinceCode?: string
  districtCode?: string
  latitude?: number
  longitude?: number
}

interface TenantInfoRequirementProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (info: TenantInfo) => void
  isLoading?: boolean
  mode?: 'create' | 'edit'
  initialData?: Partial<TenantInfo> & { imageUrl?: string }
}

const defaultFormData: TenantInfo = {
  restaurantName: '',
  phone: '',
  description: '',
  address: '',
}

const RestaurantLocationMap = dynamic<RestaurantLocationMapProps>(
  () => import('@/src/components/ui/tenant/RestaurantLocationMap'),
  {
  ssr: false,
  loading: () => (
    <div className="flex h-72 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-500">
      Đang tải bản đồ...
    </div>
  ),
}
)

export default function TenantInfoRequirement({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  mode = 'create',
  initialData,
}: TenantInfoRequirementProps) {
  const [formData, setFormData] = React.useState<TenantInfo>(defaultFormData)
  
  const [provinces, setProvinces] = useState<ProvinceSummary[]>([])
  const [districts, setDistricts] = useState<DistrictSummary[]>([])
  const [selectedProvinceCode, setSelectedProvinceCode] = useState('')
  const [selectedDistrictCode, setSelectedDistrictCode] = useState('')
  const [locationServiceAvailable, setLocationServiceAvailable] = useState(true)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen) {
      return
    }

    setFormData({
      restaurantName: initialData?.restaurantName ?? '',
      phone: initialData?.phone ?? '',
      description: initialData?.description ?? '',
      address: initialData?.address ?? '',
      latitude: initialData?.latitude,
      longitude: initialData?.longitude,
      image: undefined,
      provinceCode: '',
      districtCode: '',
    })
    setSelectedProvinceCode('')
    setSelectedDistrictCode('')
    setDistricts([])
    setImagePreview(initialData?.imageUrl ?? null)
  }, [initialData, isOpen])


  // Load provinces from API
  useEffect(() => {
    let isMounted = true

    const loadProvinces = async () => {
      try {
        const response = await fetch("https://provinces.open-api.vn/api/v1/?depth=2")
        if (!response.ok) {
          throw new Error("Failed to fetch provinces")
        }
        const data = (await response.json()) as ProvinceSummary[]
        if (isMounted) {
          setProvinces(data)
          setLocationServiceAvailable(true)
        }
      } catch (error) {
        console.warn("Failed to fetch provinces:", error)
        toast.error("Không thể tải danh sách tỉnh thành, vui lòng nhập địa chỉ thủ công.")
        if (isMounted) {
          setLocationServiceAvailable(false)
          setProvinces([])
          setDistricts([])
          setSelectedProvinceCode('')
          setSelectedDistrictCode('')
        }
      }
    }

    if (isOpen) {
      loadProvinces()
    }

    return () => {
      isMounted = false
    }
  }, [isOpen])

  // Update districts when province changes
  useEffect(() => {
    if (!locationServiceAvailable) {
      setDistricts([])
      setSelectedDistrictCode('')
      return
    }

    if (selectedProvinceCode === '') {
      setDistricts([])
      setSelectedDistrictCode('')
      return
    }

    const province = provinces.find((entry) => entry.code === Number(selectedProvinceCode))
    setDistricts(province?.districts ?? [])
    setSelectedDistrictCode((previous) => {
      if (!previous) {
        return ''
      }
      const match = province?.districts?.some((district) => district.code === Number(previous))
      return match ? previous : ''
    })
  }, [locationServiceAvailable, provinces, selectedProvinceCode])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Vui lòng chọn file ảnh hợp lệ')
        return
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Kích thước ảnh không được vượt quá 5MB')
        return
      }

      setFormData((prev) => ({ ...prev, image: file }))
      
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value
    setSelectedProvinceCode(code)
    setSelectedDistrictCode('')
  }

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDistrictCode(e.target.value)
  }

  const handleMapLocationChange = React.useCallback((latitude: number, longitude: number) => {
    setFormData((prev) => ({
      ...prev,
      latitude,
      longitude,
    }))
  }, [])

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Trình duyệt không hỗ trợ định vị hiện tại')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        handleMapLocationChange(position.coords.latitude, position.coords.longitude)
      },
      () => {
        toast.error('Không thể lấy vị trí hiện tại. Vui lòng kiểm tra quyền truy cập vị trí.')
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const handleClearCoordinates = () => {
    setFormData((prev) => ({
      ...prev,
      latitude: undefined,
      longitude: undefined,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const hasLatitude = formData.latitude !== undefined
    const hasLongitude = formData.longitude !== undefined

    if (hasLatitude !== hasLongitude) {
      toast.error('Vui lòng nhập đầy đủ cả vĩ độ và kinh độ')
      return
    }

    if (
      hasLatitude &&
      hasLongitude &&
      ((formData.latitude as number) < -90 ||
        (formData.latitude as number) > 90 ||
        (formData.longitude as number) < -180 ||
        (formData.longitude as number) > 180)
    ) {
      toast.error('Tọa độ không hợp lệ. Vĩ độ: -90 đến 90, kinh độ: -180 đến 180')
      return
    }
    
    // Build address from province and district if using location service
    let fullAddress = ''
    if (locationServiceAvailable && selectedProvinceCode && selectedDistrictCode) {
      const province = provinces.find((p) => p.code === Number(selectedProvinceCode))
      const district = districts.find((d) => d.code === Number(selectedDistrictCode))
      
      // Build address: detailed address + district + province
      const parts = []
      if (formData.address?.trim()) {
        parts.push(formData.address.trim())
      }
      if (district?.name) {
        parts.push(district.name)
      }
      if (province?.name) {
        parts.push(province.name)
      }
      fullAddress = parts.join(', ')
    } else {
      // If location service not available, use manual address
      fullAddress = formData.address || ''
    }
    
    onSubmit({
      ...formData,
      address: fullAddress,
      provinceCode: selectedProvinceCode,
      districtCode: selectedDistrictCode,
    })
  }

  if (!isOpen) return null

  const isEditMode = mode === 'edit'
  const requireLocationSelection = !isEditMode
  const modalTitle = isEditMode ? 'Cập nhật nhà hàng' : 'Tạo nhà hàng mới'
  const modalDescription = isEditMode
    ? 'Chỉnh sửa thông tin nhà hàng'
    : 'Thêm thông tin nhà hàng để bắt đầu quản lý'
  const submitLabel = isEditMode ? 'Cập nhật' : 'Tạo mới'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="relative my-8 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg">
        {/* Header với close button */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{modalTitle}</h2>
            <p className="text-sm text-slate-500">{modalDescription}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          {/* Tên nhà hàng */}
          <div>
            <label htmlFor="restaurantName" className="mb-2 block text-sm font-medium text-slate-700">
              Tên nhà hàng <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="restaurantName"
              name="restaurantName"
              value={formData.restaurantName}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-slate-300 focus:bg-white"
              placeholder="Nhập tên nhà hàng"
            />
          </div>

          {/* Số điện thoại */}
          <div>
            <label htmlFor="phone" className="mb-2 block text-sm font-medium text-slate-700">
              Số điện thoại <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-slate-300 focus:bg-white"
              placeholder="Nhập số điện thoại"
            />
          </div>

          {/* Địa chỉ - Province & District */}
          {locationServiceAvailable ? (
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <MapPin className="h-4 w-4 text-slate-500" />
                Địa chỉ {requireLocationSelection ? <span className="text-red-500">*</span> : null}
              </label>
              
              <div className="grid grid-cols-2 gap-3">
                {/* Province */}
                <div>
                  <select
                    value={selectedProvinceCode}
                    onChange={handleProvinceChange}
                    required={requireLocationSelection}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-300 focus:bg-white"
                  >
                    <option value="">Chọn Tỉnh/Thành phố</option>
                    {provinces.map((province) => (
                      <option key={province.code} value={province.code}>
                        {province.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* District */}
                <div>
                  <select
                    value={selectedDistrictCode}
                    onChange={handleDistrictChange}
                    required={requireLocationSelection}
                    disabled={!selectedProvinceCode}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-300 focus:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Chọn Quận/Huyện</option>
                    {districts.map((district) => (
                      <option key={district.code} value={district.code}>
                        {district.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Địa chỉ chi tiết */}
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Số nhà, tên đường (tùy chọn)"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-slate-300 focus:bg-white"
              />
            </div>
          ) : (
            <div>
              <label htmlFor="address" className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <MapPin className="h-4 w-4 text-slate-500" />
                Địa chỉ
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-slate-300 focus:bg-white"
                placeholder="Nhập địa chỉ đầy đủ"
              />
            </div>
          )}

          {/* Location picker */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <label className="text-sm font-medium text-slate-700">Vị trí nhà hàng trên bản đồ</label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleGetCurrentLocation}
                  className="cursor-pointer rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Dùng vị trí hiện tại
                </button>
                <button
                  type="button"
                  onClick={handleClearCoordinates}
                  disabled={formData.latitude === undefined && formData.longitude === undefined}
                  className="cursor-pointer rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Xóa tọa độ
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-500">Nhấn vào bản đồ để chọn vị trí. Tọa độ sẽ tự động cập nhật.</p>

            <RestaurantLocationMap
              latitude={formData.latitude}
              longitude={formData.longitude}
              onChange={handleMapLocationChange}
            />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="mb-1 text-xs font-medium text-slate-500">Vĩ độ (Latitude)</p>
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900">
                  {formData.latitude !== undefined ? formData.latitude.toFixed(6) : 'Chưa chọn'}
                </div>
              </div>
              <div>
                <p className="mb-1 text-xs font-medium text-slate-500">Kinh độ (Longitude)</p>
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900">
                  {formData.longitude !== undefined ? formData.longitude.toFixed(6) : 'Chưa chọn'}
                </div>
              </div>
            </div>
          </div>

          {/* Mô tả */}
          <div>
            <label htmlFor="description" className="mb-2 block text-sm font-medium text-slate-700">
              Mô tả
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-slate-300 focus:bg-white"
              placeholder="Mô tả về nhà hàng của bạn..."
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Hình ảnh nhà hàng
            </label>
            <div className="flex items-start gap-4">
              {/* Preview */}
              {imagePreview && (
                <div className="relative h-24 w-24 rounded-lg overflow-hidden border-2 border-slate-200">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview(null)
                      setFormData(prev => ({ ...prev, image: undefined }))
                    }}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
              
              {/* Upload Button */}
              <label className="flex-1 cursor-pointer">
                <div className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-6 transition-colors hover:border-slate-400">
                  <Upload className="h-5 w-5 text-slate-400" />
                  <span className="text-sm text-slate-600">
                    {formData.image ? 'Chọn ảnh khác' : 'Chọn ảnh nhà hàng'}
                  </span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Định dạng: JPG, PNG. Kích thước tối đa: 5MB
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 border-t border-slate-200 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isLoading}
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="cursor-pointer flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  {isEditMode ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  {submitLabel}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
