import React from 'react'
import { Loader2, Save, Wallet, X } from 'lucide-react'

interface Props {
  isOpen: boolean
  value: string
  isSaving: boolean
  onValueChange: (value: string) => void
  onSave: () => void
  onCancel: () => void
}

const MinCashAmountModal = React.memo(function MinCashAmountModal({
  isOpen,
  value,
  isSaving,
  onValueChange,
  onSave,
  onCancel,
}: Props) {
  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onCancel}>
      <div
        className="relative w-full max-w-md rounded-xl border border-slate-200 bg-white shadow-lg"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Cập nhật mức tiền tối thiểu</h2>
            <p className="text-sm text-slate-500">Thiết lập số tiền tối thiểu cần có trong két</p>
          </div>

          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            disabled={isSaving}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 px-6 py-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Số tiền tối thiểu (VND)</label>
            <div className="relative">
              <Wallet className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-500">
                VND
              </span>
              <input
                type="number"
                min={0}
                placeholder="Nhập số tiền tối thiểu"
                value={value}
                onChange={(e) => onValueChange(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-14 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-300 focus:bg-white"
                disabled={isSaving}
              />
            </div>

            <p className="text-xs text-slate-500">
              Giá trị này dùng để đặt mức tiền tối thiểu trong két.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-slate-200 px-6 py-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSaving}
            className="cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={isSaving}
            className="cursor-pointer flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Đang lưu...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Lưu thay đổi
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
})

export default MinCashAmountModal
