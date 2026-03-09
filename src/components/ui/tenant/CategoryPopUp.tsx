import { CategoryDto } from '@/src/types/type'
import React, { useState, useEffect, useRef } from 'react'
import { X, Layers, Plus, Edit2, Loader2 } from 'lucide-react'

interface CategoryProps {
  onClose: () => void
  onSubmit: (categoryName: string) => void
  onUpdate: (categoryId: number, categoryName: string) => void
  isLoading?: boolean
  categoryData: CategoryDto | null
}

export default function CategoryPopUp({ onClose, onSubmit, onUpdate, isLoading, categoryData }: CategoryProps) {
  const [categoryName, setCategoryName] = useState(categoryData?.categoryName || "");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Auto focus input when popup opens
    inputRef.current?.focus();
  }, []);

  const handleSubmit = () => {
    if (categoryData?.id) {
      onUpdate(categoryData.id, categoryName);
    } else {
      onSubmit(categoryName);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && categoryName.trim() && !isLoading) {
      handleSubmit();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-md rounded-xl border border-slate-200 bg-white shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {categoryData ? "Cập nhật danh mục" : "Tạo danh mục mới"}
            </h2>
            <p className="text-sm text-slate-500">
              {categoryData ? "Chỉnh sửa thông tin danh mục" : "Thêm danh mục mới vào menu"}
            </p>
          </div>
          
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            disabled={isLoading}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Tên danh mục <span className="text-red-500">*</span>
            </label>
            <input
              ref={inputRef}
              type="text"
              placeholder="Nhập tên danh mục..."
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-slate-300 focus:bg-white disabled:cursor-not-allowed disabled:opacity-50"
            />
            <p className="text-xs text-slate-500">
              Tên danh mục sẽ được hiển thị trong menu của bạn
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-slate-200 px-6 py-4">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Hủy bỏ
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading || !categoryName.trim()}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Đang xử lý...
              </>
            ) : categoryData ? (
              <>
                <Edit2 className="h-4 w-4" />
                Cập nhật
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Tạo mới
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}