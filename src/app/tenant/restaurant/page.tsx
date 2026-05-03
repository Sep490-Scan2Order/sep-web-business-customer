"use client";

import React from "react";
import { toast } from "react-toastify";
import TenantInfoRequirement from "@/src/components/ui/tenant/TenantInfoRequirement";
import RestaurantEmptyState from "@/src/components/ui/tenant/RestaurantEmptyState";
import RestaurantList from "@/src/components/ui/tenant/RestaurantList";
import type { TenantInfo } from "@/src/components/ui/tenant/TenantInfoRequirement";
import {
  ApiResponse,
  CreateRestaurantRequest,
  Restaurant,
} from "@/src/types/type";
import apiClient from "@/src/services/apiClient";
import { API } from "@/src/constants/api";

function logRestaurantCoordinateDebug(
  label: string,
  payload: CreateRestaurantRequest,
) {
  if (process.env.NODE_ENV === "production") {
    return;
  }

  console.log(`[restaurant:${label}] coordinate payload`, {
    latitude: payload.latitude,
    longitude: payload.longitude,
  });
}

function warnCoordinateMismatch(
  action: "create" | "update",
  payload: CreateRestaurantRequest,
  restaurant: Restaurant,
) {
  if (payload.latitude === undefined || payload.longitude === undefined) {
    return;
  }

  const latDiff = Math.abs((restaurant.latitude ?? 0) - payload.latitude);
  const lngDiff = Math.abs((restaurant.longitude ?? 0) - payload.longitude);
  const mismatchThreshold = 0.000001;

  if (latDiff > mismatchThreshold || lngDiff > mismatchThreshold) {
    console.warn(`[restaurant:${action}] Coordinate mismatch`, {
      sent: {
        latitude: payload.latitude,
        longitude: payload.longitude,
      },
      received: {
        latitude: restaurant.latitude,
        longitude: restaurant.longitude,
      },
    });

    toast.warn(
      "Tọa độ API trả về khác với tọa độ đã gửi. Vui lòng kiểm tra backend.",
    );
  }
}

function buildRestaurantFormData(data: CreateRestaurantRequest): FormData {
  const formData = new FormData();

  // Key names must match backend DTO properties exactly.
  formData.append("RestaurantName", data.restaurantName);
  if (data.address !== undefined) formData.append("Address", data.address);
  if (data.latitude !== undefined)
    formData.append("Latitude", data.latitude.toString());
  if (data.longitude !== undefined)
    formData.append("Longitude", data.longitude.toString());
  if (data.image !== undefined) formData.append("Image", data.image);
  if (data.phone !== undefined) formData.append("Phone", data.phone);
  if (data.description !== undefined)
    formData.append("Description", data.description);
  if (data.openTime !== undefined && data.openTime !== "")
    formData.append("OpenTime", data.openTime);
  if (data.closeTime !== undefined && data.closeTime !== "")
    formData.append("CloseTime", data.closeTime);

  return formData;
}

async function createRestaurant(
  data: CreateRestaurantRequest,
): Promise<ApiResponse<Restaurant>> {
  const formData = buildRestaurantFormData(data);

  const response = await apiClient.post<ApiResponse<Restaurant>>(
    API.RESTAURANT.CREATE,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return response.data;
}

async function updateRestaurant(
  id: string,
  data: CreateRestaurantRequest,
): Promise<ApiResponse<Restaurant>> {
  const formData = buildRestaurantFormData(data);

  const response = await apiClient.put<ApiResponse<Restaurant>>(
    API.RESTAURANT.UPDATE(id),
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return response.data;
}

async function getAllRestaurants(): Promise<ApiResponse<Restaurant[]>> {
  const response = await apiClient.get<ApiResponse<Restaurant[]>>(
    API.RESTAURANT.GET_ALL_RESTAURANT_BY_TENANT_ID,
  );
  return response.data;
}

async function updateRestaurantActiveStatus(
  id: number,
  isActive: boolean,
): Promise<ApiResponse<Restaurant>> {
  try {
    const response = await apiClient.put<ApiResponse<Restaurant>>(
      API.RESTAURANT.UPDATE_ISACTIVE(id, isActive),
      null,
    );
    return response.data;
  } catch (error: unknown) {
    // Handle axios error response
    if (
      typeof error === "object" &&
      error !== null &&
      "response" in error &&
      (error as { response?: { data?: unknown } }).response?.data
    ) {
      const errorData = (error as { response: { data: unknown } }).response
        .data as ApiResponse<Restaurant>;
      return errorData;
    }

    // Return error response format
    return {
      isSuccess: false,
      message:
        error instanceof Error ? error.message : "Lỗi khi cập nhật trạng thái",
      errors: null,
      timestamp: new Date().toISOString(),
    };
  }
}

export default function RestaurantPage() {
  const [showInfoModal, setShowInfoModal] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isInitialLoading, setIsInitialLoading] = React.useState(true);
  const [restaurants, setRestaurants] = React.useState<Restaurant[]>([]);
  const [restaurantImageVersions, setRestaurantImageVersions] = React.useState<
    Record<number, number>
  >({});
  const [modalMode, setModalMode] = React.useState<"create" | "edit">("create");
  const [editingRestaurantId, setEditingRestaurantId] = React.useState<
    string | null
  >(null);

  // Fetch restaurants on component mount
  React.useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await getAllRestaurants();
        console.log("Fetched restaurants:", response);
        if (response.isSuccess && response.data) {
          setRestaurants(response.data);
          setRestaurantImageVersions({});
        }
      } catch (error) {
        console.error("Error fetching restaurants:", error);
        toast.error("Không thể tải danh sách nhà hàng");
      } finally {
        setIsInitialLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  const handleCreateClick = () => {
    setModalMode("create");
    setEditingRestaurantId(null);
    setShowInfoModal(true);
  };

  const handleCloseModal = React.useCallback(() => {
    setShowInfoModal(false);
    setModalMode("create");
    setEditingRestaurantId(null);
  }, []);

  const handleEditClick = React.useCallback((restaurantId: string) => {
    setModalMode("edit");
    setEditingRestaurantId(restaurantId);
    setShowInfoModal(true);
  }, []);

  const editingRestaurant = React.useMemo(() => {
    if (!editingRestaurantId) {
      return null;
    }

    return (
      restaurants.find(
        (restaurant) => String(restaurant.id ?? "") === editingRestaurantId,
      ) ?? null
    );
  }, [editingRestaurantId, restaurants]);

  const restaurantListItems = React.useMemo(
    () =>
      restaurants
        .filter(
          (restaurant) =>
            typeof restaurant?.id === "number" &&
            Number.isFinite(restaurant.id),
        )
        .map((restaurant) => ({
          id: String(restaurant.id),
          name: restaurant.restaurantName,
          status: restaurant.isActive
            ? "active"
            : ("inactive" as "active" | "inactive"),
          isActive: restaurant.isActive,
          image: restaurant.image,
          slug: restaurant.slug,
          openTime: restaurant.openTime,
          closeTime: restaurant.closeTime,
          imageVersion: restaurantImageVersions[restaurant.id],
        })),
    [restaurants, restaurantImageVersions],
  );

  const handleSubmit = async (info: TenantInfo) => {
    setIsLoading(true);
    try {
      const payload: CreateRestaurantRequest = {
        restaurantName: info.restaurantName,
        phone: info.phone,
        address: info.address,
        description: info.description,
        openTime: info.openTime,
        closeTime: info.closeTime,
        latitude: info.latitude,
        longitude: info.longitude,
        image: info.image,
      };

      if (modalMode === "edit") {
        if (!editingRestaurantId || !editingRestaurant) {
          toast.error("Không xác định được nhà hàng cần cập nhật");
          return;
        }
        logRestaurantCoordinateDebug("update:before-submit", payload);
        console.log(
          "Updating restaurant with ID:",
          editingRestaurantId,
          "Payload:",
          payload,
        );
        const response = await updateRestaurant(editingRestaurantId, {
          ...payload,
          latitude: payload.latitude ?? editingRestaurant.latitude,
          longitude: payload.longitude ?? editingRestaurant.longitude,
        });
        console.log("Update response:", response);
        if (response.isSuccess && response.data) {
          const updatedRestaurant = response.data;
          warnCoordinateMismatch("update", payload, updatedRestaurant);
          toast.success(response.message || "Cập nhật nhà hàng thành công!");
          const imageRefreshVersion = Date.now();
          setRestaurants((prev) =>
            prev.map((restaurant) =>
              restaurant.id === updatedRestaurant.id
                ? updatedRestaurant
                : restaurant,
            ),
          );
          setRestaurantImageVersions((prev) => ({
            ...prev,
            [updatedRestaurant.id]: imageRefreshVersion,
          }));
          handleCloseModal();
        } else {
          toast.error(response.message || "Cập nhật nhà hàng thất bại");
        }
        return;
      }

      logRestaurantCoordinateDebug("create:before-submit", payload);
      const response = await createRestaurant(payload);

      if (response.isSuccess && response.data) {
        warnCoordinateMismatch("create", payload, response.data);
        toast.success(response.message || "Tạo nhà hàng thành công!");

        setRestaurants((prev) => [...prev, response.data as Restaurant]);
        handleCloseModal();
      } else {
        toast.error(response.message || "Tạo nhà hàng thất bại");
      }
    } catch (error: unknown) {
      const backendMessage = (
        error as { response?: { data?: { message?: string } } }
      ).response?.data?.message;

      toast.error(
        backendMessage ||
          (error as { message?: string }).message ||
          "Có lỗi xảy ra khi tạo nhà hàng",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateRestaurantStatus = React.useCallback(
    async (restaurantId: string, nextIsActive: boolean) => {
      const parsedId = Number(restaurantId);

      if (!Number.isFinite(parsedId) || parsedId <= 0) {
        toast.error("ID nhà hàng không hợp lệ");
        throw new Error("ID nhà hàng không hợp lệ");
      }

      try {
        const response = await updateRestaurantActiveStatus(
          parsedId,
          nextIsActive,
        );

        if (!response.isSuccess) {
          toast.error(
            response.message || "Cập nhật trạng thái nhà hàng thất bại",
          );
          throw new Error(
            response.message || "Cập nhật trạng thái nhà hàng thất bại",
          );
        }

        setRestaurants((prev) =>
          prev.map((restaurant) => {
            if (restaurant.id !== parsedId) {
              return restaurant;
            }

            if (response.data) {
              return {
                ...restaurant,
                ...response.data,
                id: restaurant.id,
                isActive:
                  typeof response.data.isActive === "boolean"
                    ? response.data.isActive
                    : nextIsActive,
              };
            }

            return {
              ...restaurant,
              isActive: nextIsActive,
            };
          }),
        );

        toast.success(
          response.message ||
            `${nextIsActive ? "Mở" : "Đóng"} nhà hàng thành công`,
        );
      } catch (error) {
        console.error("Error updating restaurant status:", error);
        throw error;
      }
    },
    [],
  );

  return (
    <div>
      {isInitialLoading ? (
        <div className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <div className="h-3 w-28 animate-pulse rounded bg-slate-200" />
              <div className="mt-2 h-6 w-40 animate-pulse rounded bg-slate-200" />
            </div>
            <div className="h-10 w-36 animate-pulse rounded-xl bg-slate-200" />
          </div>

          <div className="mb-6 h-10 w-full animate-pulse rounded-xl bg-slate-100" />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={`restaurant-skeleton-${index}`}
                className="overflow-hidden rounded-xl border border-slate-200 bg-white"
              >
                <div className="aspect-video animate-pulse bg-slate-200" />
                <div className="space-y-3 p-4">
                  <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200" />
                  <div className="h-5 w-24 animate-pulse rounded-full bg-slate-200" />
                  <div className="h-3 w-2/3 animate-pulse rounded bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : restaurantListItems.length === 0 ? (
        <RestaurantEmptyState onCreateClick={handleCreateClick} />
      ) : (
        <RestaurantList
          restaurants={restaurantListItems}
          onCreateClick={handleCreateClick}
          onEditClick={handleEditClick}
          onUpdateStatus={handleUpdateRestaurantStatus}
        />
      )}

      <TenantInfoRequirement
        isOpen={showInfoModal}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        mode={modalMode}
        initialData={
          editingRestaurant
            ? {
                restaurantName: editingRestaurant.restaurantName,
                phone: editingRestaurant.phone,
                description: editingRestaurant.description,
                address: editingRestaurant.address,
                latitude: editingRestaurant.latitude,
                longitude: editingRestaurant.longitude,
                openTime: editingRestaurant.openTime ?? undefined,
                closeTime: editingRestaurant.closeTime ?? undefined,
                imageUrl: editingRestaurant.image,
              }
            : undefined
        }
      />
    </div>
  );
}
