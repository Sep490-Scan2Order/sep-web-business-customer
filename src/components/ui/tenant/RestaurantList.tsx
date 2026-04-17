"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import {
  Search,
  Plus,
  Store,
  Pencil,
  Loader2,
  Lock,
  Unlock,
} from "lucide-react";
import { API } from "@/src/constants/api";
import ConfirmActionPopup from "@/src/components/ui/common/ConfirmActionPopup";

export interface Restaurant {
  id: string;
  name: string;
  status?: "active" | "inactive";
  isActive?: boolean;
  image?: string;
  slug?: string;
  imageVersion?: number;
  openTime?: string | null;
  closeTime?: string | null;
}

interface RestaurantListProps {
  restaurants: Restaurant[];
  onCreateClick: () => void;
  onEditClick: (restaurantId: string) => void;
  onUpdateStatus: (
    restaurantId: string,
    nextIsActive: boolean,
  ) => void | Promise<void>;
}

export default function RestaurantList({
  restaurants,
  onCreateClick,
  onEditClick,
  onUpdateStatus,
}: RestaurantListProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = React.useState("");
  const [pendingStatusRestaurant, setPendingStatusRestaurant] =
    React.useState<Restaurant | null>(null);
  const [isSubmittingStatus, setIsSubmittingStatus] = React.useState(false);

  const resolveImageSrc = React.useCallback(
    (image?: string, imageVersion?: number) => {
      if (!image?.trim()) {
        return "";
      }

      const normalizedPath = image.trim().replace(/\\/g, "/");
      const isAbsolute = /^(https?:)?\/\//i.test(normalizedPath);
      const isInlineData =
        normalizedPath.startsWith("data:") ||
        normalizedPath.startsWith("blob:");

      const baseUrl = API.BASE_URL?.replace(/\/$/, "");
      const absoluteUrl =
        isAbsolute || isInlineData || !baseUrl
          ? normalizedPath
          : `${baseUrl}/${normalizedPath.replace(/^\/+/, "")}`;

      if (!imageVersion) {
        return absoluteUrl;
      }

      const separator = absoluteUrl.includes("?") ? "&" : "?";
      return `${absoluteUrl}${separator}v=${imageVersion}`;
    },
    [],
  );

  const filteredRestaurants = React.useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    if (!normalizedSearch) {
      return restaurants;
    }

    return restaurants.filter((restaurant) =>
      restaurant.name.toLowerCase().includes(normalizedSearch),
    );
  }, [restaurants, searchTerm]);

  const inactiveRestaurantCount = React.useMemo(
    () =>
      filteredRestaurants.filter(
        (restaurant) =>
          !(restaurant.isActive ?? restaurant.status === "active"),
      ).length,
    [filteredRestaurants],
  );

  const handleConfirmStatusUpdate = async () => {
    if (!pendingStatusRestaurant) {
      return;
    }

    const nextIsActive = !(
      pendingStatusRestaurant.isActive ??
      pendingStatusRestaurant.status === "active"
    );

    setIsSubmittingStatus(true);
    try {
      await onUpdateStatus(pendingStatusRestaurant.id, nextIsActive);
      setPendingStatusRestaurant(null);
    } finally {
      setIsSubmittingStatus(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Quản lý nhà hàng
          </div>
          <div className="text-lg font-semibold text-slate-900">Nhà hàng</div>
        </div>
        <button
          onClick={onCreateClick}
          className="cursor-pointer flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
        >
          <Plus className="h-4 w-4" />
          Thêm nhà hàng
        </button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm nhà hàng..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 pl-9 text-sm text-slate-600 outline-none placeholder:text-slate-400 focus:border-slate-300 focus:bg-white"
          />
        </div>
      </div>

      {filteredRestaurants.length > 0 ? (
        <>
          {inactiveRestaurantCount > 0 ? (
            <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Có {inactiveRestaurantCount} nhà hàng đang không hoạt
              động. Bạn có thể bật lại bằng nút Mở nhà hàng.
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredRestaurants.map((restaurant) => {
              const imageSrc = resolveImageSrc(
                restaurant.image,
                restaurant.imageVersion,
              );
              const isActive =
                restaurant.isActive ?? restaurant.status === "active";
              const nextActionText = isActive ? "Đóng nhà hàng" : "Mở nhà hàng";
              const isPendingThisRestaurant =
                pendingStatusRestaurant?.id === restaurant.id;

              return (
                <div
                  key={restaurant.id}
                  onClick={() => {
                    if (!isActive) {
                      toast.info(
                        `Nhà hàng ${restaurant.name} đang không hoạt động`,
                      );
                      return;
                    }

                    if (restaurant.slug) {
                      const encodedSlug = encodeURIComponent(restaurant.slug);
                      router.push(`/tenant/restaurant/${encodedSlug}`);
                      return;
                    }

                    toast.info("Nhà hàng chưa có đường dẫn chi tiết");
                  }}
                  className={`group relative overflow-hidden rounded-xl border bg-white transition-colors ${
                    isActive
                      ? "cursor-pointer border-slate-200 hover:bg-slate-50"
                      : "cursor-not-allowed border-amber-200 bg-amber-50/30"
                  }`}
                >
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onEditClick(restaurant.id);
                    }}
                    className="absolute right-2 top-2 z-10 cursor-pointer rounded-lg border border-slate-200 bg-white/95 p-1.5 text-slate-600 shadow-sm transition-colors hover:bg-white"
                    aria-label={`Sửa thông tin ${restaurant.name}`}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      setPendingStatusRestaurant(restaurant);
                    }}
                    disabled={isSubmittingStatus}
                    className={`absolute right-12 top-2 z-10 cursor-pointer rounded-lg border p-1.5 shadow-sm transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                      isActive
                        ? "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
                        : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                    }`}
                    aria-label={`${nextActionText} ${restaurant.name}`}
                  >
                    {isSubmittingStatus && isPendingThisRestaurant ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : isActive ? (
                      <Lock className="h-3.5 w-3.5" />
                    ) : (
                      <Unlock className="h-3.5 w-3.5" />
                    )}
                  </button>

                  {imageSrc ? (
                    <div className="relative aspect-video overflow-hidden bg-slate-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imageSrc}
                        alt={restaurant.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex aspect-video items-center justify-center bg-slate-100">
                      <Store className="h-8 w-8 text-slate-400" />
                    </div>
                  )}

                  <div className="p-4">
                    <p className="line-clamp-1 text-sm font-semibold text-slate-900">
                      {restaurant.name}
                    </p>

                    <div className="mt-2">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                          isActive
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {isActive ? "Hoạt động" : "Tạm dừng"}
                      </span>
                    </div>

                    {!isActive ? (
                      <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-2 py-1 text-xs text-amber-800">
                        Nhà hàng đang không hoạt động. Vui lòng mở nhà hàng để
                        xem chi tiết.
                      </p>
                    ) : null}

                    {(restaurant.openTime || restaurant.closeTime) && (
                      <p className="mt-3 text-xs text-slate-500">
                        Giờ mở cửa: {restaurant.openTime || "--:--"} -{" "}
                        {restaurant.closeTime || "--:--"}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
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
              : "Nhấn nút Thêm nhà hàng để bắt đầu"}
          </p>
        </div>
      )}

      <ConfirmActionPopup
        isOpen={Boolean(pendingStatusRestaurant)}
        title="Xác nhận cập nhật trạng thái"
        message={
          pendingStatusRestaurant
            ? `Bạn có chắc muốn ${(pendingStatusRestaurant.isActive ?? pendingStatusRestaurant.status === "active") ? "đóng" : "mở"} nhà hàng ${pendingStatusRestaurant.name} không?`
            : "Bạn có chắc muốn thực hiện hành động này không?"
        }
        confirmText={
          pendingStatusRestaurant
            ? (pendingStatusRestaurant.isActive ??
              pendingStatusRestaurant.status === "active")
              ? "Đóng nhà hàng"
              : "Mở nhà hàng"
            : "Xác nhận"
        }
        confirmVariant={
          (pendingStatusRestaurant?.isActive ??
          pendingStatusRestaurant?.status === "active")
            ? "danger"
            : "default"
        }
        isLoading={isSubmittingStatus}
        onClose={() => {
          if (isSubmittingStatus) {
            return;
          }
          setPendingStatusRestaurant(null);
        }}
        onConfirm={handleConfirmStatusUpdate}
      />
    </div>
  );
}
