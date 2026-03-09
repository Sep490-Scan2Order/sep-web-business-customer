import React, { useState } from "react";
import { DishesDto } from "@/src/types/type";
import { Search, Plus, Edit2, UtensilsCrossed } from "lucide-react";

interface DishListProps {
  dishes: DishesDto[];
  onCreateClick: () => void;
  onEditClick: (dish: DishesDto) => void;
}

export default function DishList({
  dishes,
  onCreateClick,
  onEditClick,
}: DishListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  
  const filteredDishes = dishes.filter((dish) =>
    dish.dishName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dish.categoryName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group dishes by category
  const groupedDishes = filteredDishes.reduce((acc, dish) => {
    const categoryName = dish.categoryName;
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(dish);
    return acc;
  }, {} as Record<string, DishesDto[]>);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND' 
    }).format(price);
  };

  return (
    <div className="p-6">
      {/* Header Section */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Dish Management</div>
          <div className="text-lg font-semibold text-slate-900">Món ăn</div>
        </div>
        <button
          onClick={onCreateClick}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Thêm món ăn
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 pl-9 text-sm text-slate-600 outline-none placeholder:text-slate-400 focus:border-slate-300 focus:bg-white"
          />
        </div>
      </div>

      {/* Dishes Grid */}
      {filteredDishes.length > 0 ? (
        <div className="space-y-8">
          {Object.entries(groupedDishes).map(([categoryName, categoryDishes]) => (
            <div key={categoryName}>
              {/* Category Header */}
              <div className="mb-4 flex items-center gap-2">
                <div className="h-px flex-1 bg-slate-200" />
                <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                  {categoryName}
                </h2>
                <div className="h-px flex-1 bg-slate-200" />
              </div>
              
              {/* Dishes Grid for this category */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {categoryDishes.map((dish) => (
                  <div
                    key={dish.id}
                    onClick={() => onEditClick(dish)}
                    className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white transition-colors hover:bg-slate-50 cursor-pointer"
                  >
                    {/* Image */}
                    {dish.imageUrl && (
                      <div className="relative aspect-video overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={dish.imageUrl}
                          alt={dish.dishName}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}

                    {/* Dish Info */}
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h3 className="font-medium text-slate-900 mb-1">
                            {dish.dishName}
                          </h3>
                          {dish.description && (
                            <p className="text-xs text-slate-500 line-clamp-2">
                              {dish.description}
                            </p>
                          )}
                          <div className="mt-2">
                            <span className="font-semibold text-slate-900">
                              {formatPrice(dish.price)}
                            </span>
                          </div>
                          <div className="mt-2">
                            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                              dish.isAvailable 
                                ? 'bg-emerald-50 text-emerald-600' 
                                : 'bg-slate-100 text-slate-600'
                            }`}>
                              <span className="h-1.5 w-1.5 rounded-full bg-current" />
                              {dish.isAvailable ? 'Còn hàng' : 'Hết hàng'}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditClick(dish);
                          }}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Empty State
        <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white py-12">
          <div className="rounded-full bg-slate-100 p-4">
            <UtensilsCrossed className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="mt-4 text-sm font-medium text-slate-900">
            {searchTerm ? "Không tìm thấy món ăn" : "Chưa có món ăn nào"}
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            {searchTerm
              ? "Thử tìm kiếm với từ khóa khác"
              : "Nhấn nút 'Thêm món ăn' để bắt đầu"}
          </p>
        </div>
      )}
    </div>
  );
}
