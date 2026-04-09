'use client'

import React from 'react'
import { X } from 'lucide-react'

export interface TenantTaxInfo{
    taxCode: string
}

interface TenantTaxInfoRequirementProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (info: TenantTaxInfo) => void
  isLoading?: boolean
}

export default function VerifyTaxModelPopUp({ isOpen, onClose, onSubmit, isLoading }: TenantTaxInfoRequirementProps) {
   const [formData, setFormData] = React.useState<TenantTaxInfo>({
       taxCode: ''
     })
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({
          ...prev,
          [name]: value,
        }))
      }

       const handleSubmit = (e: React.FormEvent) => {
          e.preventDefault()
          onSubmit(formData)
        }
      
        if (!isOpen) return null
      
    
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg">
        {/* Phần đầu với nút đóng */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">Thông tin mã số thuế</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng hộp thoại"
            className="flex items-center justify-center rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="mb-6 text-sm text-slate-500">
          Vui lòng điền các thông tin bắt buộc để tiếp tục sử dụng dịch vụ
        </p>

        {/* Form */}
          <div>
            <label htmlFor="taxCode" className="block text-sm font-medium text-slate-700">
              Mã số thuế <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="taxCode"
              name="taxCode"
              value={formData.taxCode}
              onChange={handleChange}
              required
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              placeholder="Nhập mã số thuế"
            />
          </div>

          {/* Actions */}
          <div className="mt-6 flex gap-3">
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
              onClick={handleSubmit}
              className="flex-1 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'Đang xử lý...' : 'Xác nhận'}
            </button>
          </div>
      </div>
    </div>
  )
}
