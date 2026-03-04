import { DishesDto, CategoryDto } from '@/src/types/type'
import React, { useState, useEffect, useRef } from 'react'
import { X, UtensilsCrossed, Plus, Edit2, Loader2, DollarSign, Layers, FileText, Package, Upload, Image as ImageIcon } from 'lucide-react'

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
  const [dishAvailability, setDishAvailability] = useState<string>(dishData?.dishAvailability?.toString() || "");
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
    formData.append('dishAvailability', dishAvailability);
    
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

  const isFormValid = dishName.trim() && price && parseFloat(price) > 0 && dishAvailability && parseInt(dishAvailability) >= 0 && categoryId;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-3xl my-8 rounded-2xl bg-white shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Gradient */}
        <div className="relative overflow-hidden rounded-t-2xl bg-gradient-to-r from-orange-500 to-orange-600 px-8 py-6">
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
          <div className="absolute -right-4 -bottom-4 h-24 w-24 rounded-full bg-white/10" />
          
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-white/20 p-2.5 backdrop-blur-sm">
                {dishData ? (
                  <Edit2 className="h-6 w-6 text-white" />
                ) : (
                  <Plus className="h-6 w-6 text-white" />
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {dishData ? "Cập nhật món ăn" : "Tạo món ăn mới"}
                </h2>
                <p className="text-sm text-orange-50">
                  {dishData ? "Chỉnh sửa thông tin món ăn" : "Thêm món ăn mới vào hệ thống"}
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
        <div className="p-8 max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              {/* Category */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <Layers className="h-4 w-4 text-orange-600" />
                  Danh mục
                  <span className="text-red-500">*</span>
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(parseInt(e.target.value))}
                  disabled={isLoading}
                  className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 transition-all focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.categoryName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dish Name */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <UtensilsCrossed className="h-4 w-4 text-orange-600" />
                  Tên món ăn
                  <span className="text-red-500">*</span>
                </label>
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Nhập tên món ăn..."
                  value={dishName}
                  onChange={(e) => setDishName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isLoading}
                  className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 placeholder-slate-400 transition-all focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              {/* Price */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <DollarSign className="h-4 w-4 text-orange-600" />
                  Giá tiền (VNĐ)
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  placeholder="Nhập giá tiền..."
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isLoading}
                  min="0"
                  className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 placeholder-slate-400 transition-all focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              {/* Dish Availability */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <Package className="h-4 w-4 text-orange-600" />
                  Số lượng
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  placeholder="Nhập số lượng..."
                  value={dishAvailability}
                  onChange={(e) => setDishAvailability(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isLoading}
                  min="0"
                  className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 placeholder-slate-400 transition-all focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {/* Description */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <FileText className="h-4 w-4 text-orange-600" />
                  Mô tả
                </label>
                <textarea
                  placeholder="Nhập mô tả món ăn..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isLoading}
                  rows={4}
                  className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 placeholder-slate-400 transition-all focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-500/10 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                />
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <ImageIcon className="h-4 w-4 text-orange-600" />
                  Hình ảnh
                </label>
                <div className="space-y-3">
                  {imagePreview && (
                    <div className="relative aspect-video w-full overflow-hidden rounded-xl border-2 border-slate-200">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    </div>
                  )}
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
                    className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-600 transition-all hover:border-orange-500 hover:bg-orange-50 hover:text-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Upload className="h-4 w-4" />
                    {imagePreview ? "Thay đổi hình ảnh" : "Tải lên hình ảnh"}
                  </button>
                </div>
              </div>
            </div>
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
            disabled={isLoading || !isFormValid}
            className="group relative flex items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-orange-600 to-orange-700 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/30 transition-all hover:scale-105 hover:shadow-xl hover:shadow-orange-500/40 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
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