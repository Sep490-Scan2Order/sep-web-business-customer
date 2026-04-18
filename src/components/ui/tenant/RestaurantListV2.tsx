import React, { useState } from "react";
import { Restaurant } from "@/src/types/type";
import { Search, Store, MapPin, Phone } from "lucide-react";

interface RestaurantListProps {
  restaurants: Restaurant[];
  onRestaurantClick?: (restaurant: Restaurant) => void;
  isLoading?: boolean;
}

export default function RestaurantListV2({
  restaurants,
  onRestaurantClick,
  isLoading = false,
}: RestaurantListProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredRestaurants = restaurants.filter(
    (restaurant) =>
      restaurant.restaurantName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      restaurant.address.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const getStatusBadge = (restaurant: Restaurant) => {
    if (!restaurant.isActive) {
      return {
        bg: "bg-slate-100",
        text: "text-slate-600",
        label: "Không hoạt động",
      };
    }
    if (!restaurant.isOpened) {
      return { bg: "bg-amber-50", text: "text-amber-600", label: "Đóng cửa" };
    }
    if (!restaurant.isReceivingOrders) {
      return {
        bg: "bg-orange-50",
        text: "text-orange-600",
        label: "Không nhận đơn",
      };
    }
    return {
      bg: "bg-emerald-50",
      text: "text-emerald-600",
      label: "Hoạt động",
    };
  };

  return (
    <div className="p-6">
      {/* Header Section */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Quản lý món theo chi nhánh
          </div>
          <div className="text-lg font-semibold text-slate-900">
            Quản lý Chuỗi Món Ăn
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm nhà hàng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 pl-9 text-sm text-slate-600 outline-none placeholder:text-slate-400 focus:border-slate-300 focus:bg-white"
          />
        </div>
      </div>

      {/* Restaurants Grid */}
      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={`branch-restaurant-skeleton-${index}`}
              className="overflow-hidden rounded-xl border border-slate-200 bg-white"
            >
              <div className="aspect-video animate-pulse bg-slate-200" />
              <div className="space-y-3 p-4">
                <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200" />
                <div className="h-5 w-28 animate-pulse rounded-full bg-slate-200" />
                <div className="h-3 w-full animate-pulse rounded bg-slate-100" />
                <div className="h-3 w-3/4 animate-pulse rounded bg-slate-100" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredRestaurants.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredRestaurants.map((restaurant) => {
            const status = getStatusBadge(restaurant);
            return (
              <div
                key={restaurant.id}
                onClick={() => onRestaurantClick?.(restaurant)}
                className={`group relative overflow-hidden rounded-xl border border-slate-200 bg-white transition-all hover:shadow-lg hover:border-slate-300 ${
                  onRestaurantClick ? "cursor-pointer" : ""
                }`}
              >
                {/* Image */}
                {restaurant.image && (
                  <div className="relative aspect-video overflow-hidden bg-slate-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={restaurant.image}
                      alt={restaurant.restaurantName}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                )}

                {/* Restaurant Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 line-clamp-2">
                        {restaurant.restaurantName}
                      </h3>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="mb-3">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${status.bg} ${status.text}`}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      {status.label}
                    </span>
                  </div>

                  {/* Description */}
                  {restaurant.description && (
                    <p className="text-xs text-slate-500 line-clamp-2 mb-3">
                      {restaurant.description}
                    </p>
                  )}

                  {/* Address */}
                  <div className="flex items-start gap-2 mb-2">
                    <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span className="text-xs text-slate-600 line-clamp-2">
                      {restaurant.address}
                    </span>
                  </div>

                  {/* Phone */}
                  {restaurant.phone && (
                    <div className="flex items-start gap-2 mb-3">
                      <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span className="text-xs text-slate-600">
                        {restaurant.phone}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        // Empty State
        <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white py-12">
          <div className="rounded-full bg-slate-100 p-4">
            <Store className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="mt-4 text-sm font-medium text-slate-900">
            {searchTerm ? "Không tìm thấy nhà hàng" : "Chưa có nhà hàng nào"}
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            {searchTerm
              ? "Thử tìm kiếm với từ khóa khác"
              : "Nhấn nút 'Thêm nhà hàng' để bắt đầu"}
          </p>
        </div>
      )}
    </div>
  );
}
