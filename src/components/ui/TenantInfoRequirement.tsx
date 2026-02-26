'use client'

import React, { useEffect, useState } from 'react'
import { X, MapPin, Upload } from 'lucide-react'
import { toast } from 'react-toastify'
import { ProvinceSummary, DistrictSummary } from '@/src/types/type'

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
}

export default function TenantInfoRequirement({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}: TenantInfoRequirementProps) {
  const [formData, setFormData] = React.useState<TenantInfo>({
    restaurantName: '',
    phone: '',
    description: '',
    address: '',
  })
  
  const [provinces, setProvinces] = useState<ProvinceSummary[]>([])
  const [districts, setDistricts] = useState<DistrictSummary[]>([])
  const [selectedProvinceCode, setSelectedProvinceCode] = useState('')
  const [selectedDistrictCode, setSelectedDistrictCode] = useState('')
  const [locationServiceAvailable, setLocationServiceAvailable] = useState(true)
  const [imagePreview, setImagePreview] = useState<string | null>(null)


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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-lg">
        {/* Header với close button */}
        <div className="mb-6 flex items-center justify-between sticky top-0 bg-white pb-4">
          <h2 className="text-xl font-semibold text-slate-900">Thông tin nhà hàng</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="flex items-center justify-center rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="mb-6 text-sm text-slate-500">
          Vui lòng điền các thông tin nhà hàng để tiếp tục
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tên nhà hàng */}
          <div>
            <label htmlFor="restaurantName" className="block text-sm font-medium text-slate-700">
              Tên nhà hàng <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="restaurantName"
              name="restaurantName"
              value={formData.restaurantName}
              onChange={handleChange}
              required
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              placeholder="Nhập tên nhà hàng"
            />
          </div>

          {/* Số điện thoại */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-slate-700">
              Số điện thoại <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              placeholder="Nhập số điện thoại"
            />
          </div>

          {/* Địa chỉ - Province & District */}
          {locationServiceAvailable ? (
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <MapPin className="h-4 w-4 text-emerald-600" />
                Địa chỉ <span className="text-red-500">*</span>
              </label>
              
              <div className="grid grid-cols-2 gap-3">
                {/* Province */}
                <div>
                  <select
                    value={selectedProvinceCode}
                    onChange={handleProvinceChange}
                    required
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
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
                    required
                    disabled={!selectedProvinceCode}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 disabled:bg-slate-100 disabled:cursor-not-allowed"
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
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          ) : (
            <div>
              <label htmlFor="address" className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <MapPin className="h-4 w-4 text-emerald-600" />
                Địa chỉ
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                placeholder="Nhập địa chỉ đầy đủ"
              />
            </div>
          )}

          {/* Latitude & Longitude */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="latitude" className="block text-sm font-medium text-slate-700">
                Vĩ độ (Latitude)
              </label>
              <input
                type="number"
                id="latitude"
                name="latitude"
                step="any"
                value={formData.latitude || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, latitude: e.target.value ? parseFloat(e.target.value) : undefined }))}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                placeholder="VD: 21.0285"
              />
            </div>

            <div>
              <label htmlFor="longitude" className="block text-sm font-medium text-slate-700">
                Kinh độ (Longitude)
              </label>
              <input
                type="number"
                id="longitude"
                name="longitude"
                step="any"
                value={formData.longitude || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, longitude: e.target.value ? parseFloat(e.target.value) : undefined }))}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                placeholder="VD: 105.8542"
              />
            </div>
          </div>

          {/* Mô tả */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-700">
              Mô tả
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 resize-none"
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
                <div className="flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-6 hover:border-emerald-500 hover:bg-emerald-50 transition-colors">
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
          <div className="mt-6 flex gap-3 sticky bottom-0 bg-white pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              disabled={isLoading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex-1 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'Đang xử lý...' : 'Tạo nhà hàng'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
