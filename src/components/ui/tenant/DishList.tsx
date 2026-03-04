import React, { useState } from "react";
import { DishesDto } from "@/src/types/type";
import { Search, Plus, Edit2, UtensilsCrossed, Eye, EyeOff } from "lucide-react";

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

  // Array of gradient colors for dishes
  const gradients = [
    "from-emerald-400 to-emerald-600",
    "from-blue-400 to-blue-600",
    "from-purple-400 to-purple-600",
    "from-orange-400 to-orange-600",
    "from-pink-400 to-pink-600",
    "from-indigo-400 to-indigo-600",
    "from-teal-400 to-teal-600",
    "from-rose-400 to-rose-600",
  ];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND' 
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header Section */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 p-3 shadow-lg">
                <UtensilsCrossed className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">
                  Quản lý món ăn
                </h1>
                <p className="text-sm text-slate-600 mt-1">
                  Tổng cộng {dishes.length} món ăn
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={onCreateClick}
            className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-orange-700 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/30 transition-all hover:scale-105 hover:shadow-xl hover:shadow-orange-500/40"
          >
            <Plus className="h-5 w-5 transition-transform group-hover:rotate-90" />
            Thêm món ăn mới
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm món ăn theo tên hoặc danh mục..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border-2 border-slate-200 bg-white py-3 pl-12 pr-4 text-sm text-slate-900 placeholder-slate-400 shadow-sm transition-all focus:border-orange-500 focus:outline-none focus:ring-4 focus:ring-orange-500/10"
            />
          </div>
        </div>

        {/* Dishes Grid */}
        {filteredDishes.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredDishes.map((dish, index) => {
              const gradient = gradients[index % gradients.length];
              return (
                <div
                  key={dish.id}
                  onClick={() => onEditClick(dish)}
                  className="group relative overflow-hidden rounded-2xl bg-white shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl cursor-pointer"
                >
                  {/* Image or Gradient Background */}
                  <div className="relative aspect-[4/3] overflow-hidden">
                    {dish.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={dish.imageUrl}
                        alt={dish.dishName}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    ) : (
                      <div className={`h-full w-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                        <UtensilsCrossed className="h-16 w-16 text-white/30" />
                      </div>
                    )}

                    {/* Availability Badge */}
                    <div className="absolute top-3 right-3">
                      <div className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold backdrop-blur-sm ${
                        dish.isAvailable 
                          ? 'bg-emerald-500/90 text-white' 
                          : 'bg-slate-700/90 text-white'
                      }`}>
                        {dish.isAvailable ? (
                          <>
                            <Eye className="h-3 w-3" />
                            Còn hàng
                          </>
                        ) : (
                          <>
                            <EyeOff className="h-3 w-3" />
                            Hết hàng
                          </>
                        )}
                      </div>
                    </div>

                    {/* Edit Button Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      <div className="rounded-full bg-white p-3 shadow-xl">
                        <Edit2 className="h-6 w-6 text-slate-900" />
                      </div>
                    </div>
                  </div>

                  {/* Dish Info */}
                  <div className="p-5">
                    <div className="mb-2">
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                        {dish.categoryName}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 truncate mb-1">
                      {dish.dishName}
                    </h3>
                    <p className="text-sm text-slate-500 line-clamp-2 mb-3 min-h-[40px]">
                      {dish.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-orange-600">
                        {formatPrice(dish.price)}
                      </span>
                      <span className="text-xs text-slate-500">
                        SL: {dish.dishAvailability}
                      </span>
                    </div>
                  </div>

                  {/* Bottom Border Animation */}
                  <div className={`h-1 w-0 bg-gradient-to-r ${gradient} transition-all duration-300 group-hover:w-full`} />
                </div>
              );
            })}
          </div>
        ) : (
          // Empty State
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-white py-20">
            <div className="rounded-full bg-slate-100 p-6">
              <UtensilsCrossed className="h-16 w-16 text-slate-400" />
            </div>
            <h3 className="mt-6 text-xl font-semibold text-slate-900">
              {searchTerm ? "Không tìm thấy món ăn" : "Chưa có món ăn nào"}
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              {searchTerm
                ? "Thử tìm kiếm với từ khóa khác"
                : "Nhấn nút 'Thêm món ăn mới' để bắt đầu"}
            </p>
            {!searchTerm && (
              <button
                onClick={onCreateClick}
                className="mt-6 flex items-center gap-2 rounded-xl bg-orange-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:bg-orange-700"
              >
                <Plus className="h-5 w-5" />
                Thêm món ăn đầu tiên
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
