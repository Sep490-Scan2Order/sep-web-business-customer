import { DishesDto, CategoryDto } from '@/src/types/type'
import React, { useState, useEffect, useRef } from 'react'
import { X, Plus, Edit2, Loader2 } from 'lucide-react'

interface DishProps {
  categories: CategoryDto[]
  onClose: () => void
  onSubmit: (categoryId: number,dishData: FormData) => void
  onUpdate: (dishId: number, categoryId: number, dishData: FormData) => void
  isLoading?: boolean
  dishData: DishesDto | null
}

export default function DishPopUp({ categories, onClose, onSubmit, onUpdate, isLoading, dishData }: DishProps) {
  const [dishName, setDishName] = useState(dishData?.dishName || "");
  const [categoryId, setCategoryId] = useState<number>(dishData?.categoryId || (categories[0]?.id || 0));
  const [price, setPrice] = useState<string>(dishData?.price?.toString() || "");
  const [description, setDescription] = useState(dishData?.description || "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(dishData?.imageUrl || null);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

 const handleSubmit = () => {
    const formData = new FormData();
    formData.append('dishName', dishName);
    formData.append('price', price);
    formData.append('description', description);
    
    if (imageFile) {
      formData.append('ImageUrl', imageFile);
    }

    if (dishData?.id) {
      onUpdate(dishData.id, categoryId, formData);
    } else {
      onSubmit(categoryId, formData); 
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && dishName.trim() && price && !isLoading) {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const isFormValid = dishName.trim() && price && parseFloat(price) > 0 && categoryId;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-2xl my-8 rounded-xl border border-slate-200 bg-white shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {dishData ? "Cập nhật món ăn" : "Tạo món ăn mới"}
            </h2>
            <p className="text-sm text-slate-500">
              {dishData ? "Chỉnh sửa thông tin món ăn" : "Thêm món ăn mới vào menu"}
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
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {/* Two Column Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              {/* Category */}
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Danh mục <span className="text-red-500">*</span>
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(parseInt(e.target.value))}
                  disabled={isLoading}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-300 focus:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.categoryName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dish Name */}
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Tên món ăn <span className="text-red-500">*</span>
                </label>
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Nhập tên món ăn..."
                  value={dishName}
                  onChange={(e) => setDishName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isLoading}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-slate-300 focus:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              {/* Price */}
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Giá tiền (VNĐ) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  placeholder="Nhập giá tiền..."
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isLoading}
                  min="0"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-slate-300 focus:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Mô tả
                </label>
                <textarea
                  placeholder="Nhập mô tả món ăn..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isLoading}
                  rows={5}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-slate-300 focus:bg-white disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {/* Image Upload Button */}
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Hình ảnh
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                  className="w-full rounded-xl border-2 border-dashed border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 hover:border-slate-400 transition-colors disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                >
                  {imagePreview ? "Thay đổi hình ảnh" : "Tải lên hình ảnh"}
                </button>
              </div>

              {/* Image Preview */}
              {imagePreview && (
                <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-slate-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
            </div>
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
            disabled={isLoading || !isFormValid}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Đang xử lý...
              </>
            ) : dishData ? (
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