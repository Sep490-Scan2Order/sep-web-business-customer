'use client'
import React from 'react'
import { X } from 'lucide-react'

interface TenantTaxInfoRequirementProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (formData: unknown) => void
  isLoading?: boolean
}
export default function DepositVerifyTaxModelPopUp({ isOpen, onClose, onSubmit, isLoading }: TenantTaxInfoRequirementProps) {
   const handleSubmit = (e: React.FormEvent) => {
            e.preventDefault()
            onSubmit({})
          }
        
          if (!isOpen) return null
        
      
    return (
   <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg">
        {/* Header với close button */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">Thông báo</h2>
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
          Để xác thực thông tin ngân hàng và mã số thuế trùng khớp vui lòng thanh toán 5.000 VNĐ đồng vào tài khoản của chúng tôi.
        </p>

        {/* Form */}
          <div>
            <label htmlFor="taxCode" className="block text-sm font-medium text-slate-700">
             Thông tin thanh toán <span className="text-red-500">*</span>
            </label>
            <p className="mt-1 mb-4 text-sm text-slate-500">
              Vui lòng thanh toán 5.000 VNĐ vào link sau: <br />
            </p>
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
              {isLoading ? 'Đang xử lý...' : 'Đi tới trang thanh toán'}
            </button>
          </div>
      </div>
    </div>
  )
}
