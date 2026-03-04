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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Gradient */}
        <div className="relative overflow-hidden rounded-t-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-8 py-6">
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
          <div className="absolute -right-4 -bottom-4 h-24 w-24 rounded-full bg-white/10" />
          
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-white/20 p-2.5 backdrop-blur-sm">
                {categoryData ? (
                  <Edit2 className="h-6 w-6 text-white" />
                ) : (
                  <Plus className="h-6 w-6 text-white" />
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {categoryData ? "Cập nhật danh mục" : "Tạo danh mục mới"}
                </h2>
                <p className="text-sm text-emerald-50">
                  {categoryData ? "Chỉnh sửa thông tin danh mục" : "Thêm danh mục mới vào hệ thống"}
                </p>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="rounded-lg bg-white/20 p-2 text-white backdrop-blur-sm transition-all hover:bg-white/30 hover:rotate-90"
              disabled={isLoading}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Layers className="h-4 w-4 text-emerald-600" />
              Tên danh mục
              <span className="text-red-500">*</span>
            </label>
            <input
              ref={inputRef}
              type="text"
              placeholder="Nhập tên danh mục..."
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 placeholder-slate-400 transition-all focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <p className="text-xs text-slate-500">
              Tên danh mục sẽ được hiển thị trong menu của bạn
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 rounded-b-2xl bg-slate-50 px-8 py-5">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="rounded-xl border-2 border-slate-200 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Hủy bỏ
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading || !categoryName.trim()}
            className="group relative flex items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition-all hover:scale-105 hover:shadow-xl hover:shadow-emerald-500/40 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
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