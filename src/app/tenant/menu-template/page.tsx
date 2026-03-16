"use client";

import { useEffect, useState } from "react";
import apiClient from "@/src/services/apiClient";
import { API } from "@/src/constants/api";
import { ApiResponse, MenuCategoryDto, Restaurant, ApplyMenuTemplateRequest } from "@/src/types/type";
import { useAuth } from "@/src/hooks/useAuth";
import { toast } from "react-toastify";

interface MenuTemplate {
  id: number;
  templateName: string;
  layoutConfigJson: string;
  themeColor: string;
  fontFamily: string;
  backgroundImageUrl?: string;
}

interface TemplateLayoutConfig {
  version: number;
  canvas?: {
    width: number;
    height: number;
    backgroundMode?: "color" | "image";
    backgroundColor?: string;
    backgroundImageUrl?: string;
  };
  dataMapping?: {
    categories: {
      source: string;
      displayField: string;
    };
    dishes: {
      source: string;
      groupBy: string;
      displayFields: string[];
    };
  };
}

const getAllMenuTemplates = async (): Promise<ApiResponse<MenuTemplate[]>> => {
  const response = await apiClient.get<ApiResponse<MenuTemplate[]>>(
    API.MENU_TEMPLATE.GET_ALL
  );
  return response.data;
};

const getMenuTemplateById = async (
  id: number
): Promise<ApiResponse<MenuTemplate>> => {
  const response = await apiClient.get<ApiResponse<MenuTemplate>>(
    API.MENU_TEMPLATE.GET_BY_ID(id)
  );
  return response.data;
};

const getMenuByRestaurant = async (restaurantId: number): Promise<ApiResponse<MenuCategoryDto[]>> => {
  const response = await apiClient.get<ApiResponse<MenuCategoryDto[]>>(
    API.RESTAURANT.GET_MENU(restaurantId)
  );
  return response.data;
};

const getRestaurantsByTenant = async (): Promise<ApiResponse<Restaurant[]>> => {
  // API này lấy tất cả restaurants của tenant hiện tại từ JWT token
  const response = await apiClient.get<ApiResponse<Restaurant[]>>(
    API.RESTAURANT.GET_ALL_RESTAURANT_BY_TENANT_ID
  );
  return response.data;
};

const applyTemplateToRestaurant = async (request: ApplyMenuTemplateRequest): Promise<ApiResponse<any>> => {
  const response = await apiClient.post<ApiResponse<any>>(
    API.MENU_RESTAURANT.APPLY_TEMPLATE,
    request
  );
  return response.data;
};

export default function MenuTemplatePage() {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<MenuTemplate[]>([]);
  const [restaurantMenu, setRestaurantMenu] = useState<MenuCategoryDto[]>([]);
  const [menuLoading, setMenuLoading] = useState(false);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<MenuTemplate | null>(null);
  const [selectedLayout, setSelectedLayout] = useState<TemplateLayoutConfig | null>(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);

  useEffect(() => {
    if (!user?.id) {
      return;
    }
    loadAllData();
  }, [user?.id]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      
      // Đảm bảo có tenantId trước khi load data
      if (!user?.id) {
        toast.error("Không tìm thấy thông tin tenant");
        return;
      }

      const [templatesRes, restaurantsRes] = await Promise.all([
        getAllMenuTemplates(),
        getRestaurantsByTenant(),
      ]);

      if (templatesRes.isSuccess && templatesRes.data) {
        setTemplates(templatesRes.data);
      } else {
        toast.error(templatesRes.message || "Failed to load templates");
      }

      if (restaurantsRes.isSuccess && restaurantsRes.data) {
        setRestaurants(restaurantsRes.data);
        // Auto-select first restaurant if only one
        if (restaurantsRes.data.length === 1) {
          setSelectedRestaurant(restaurantsRes.data[0]);
        }
      } else {
        toast.error(restaurantsRes.message || "Failed to load restaurants");
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Error loading data");
    } finally {
      setLoading(false);
    }
  };

  const parseLayoutConfig = (value: string): TemplateLayoutConfig | null => {
    try {
      return JSON.parse(value) as TemplateLayoutConfig;
    } catch {
      return null;
    }
  };

  const mapLayoutWithApiBackground = (
    layout: TemplateLayoutConfig | null,
    backgroundImageUrl?: string
  ): TemplateLayoutConfig | null => {
    if (!layout) {
      return null;
    }

    if (!backgroundImageUrl?.trim()) {
      return layout;
    }

    return {
      ...layout,
      canvas: {
        width: layout.canvas?.width ?? 1000,
        height: layout.canvas?.height ?? 800,
        backgroundMode: layout.canvas?.backgroundMode,
        backgroundColor: layout.canvas?.backgroundColor,
        backgroundImageUrl: backgroundImageUrl.trim(),
      },
    };
  };

  const handleSelectTemplate = async (template: MenuTemplate) => {
    try {
      const detailRes = await getMenuTemplateById(template.id);

      if (detailRes.isSuccess && detailRes.data) {
        setSelectedTemplate(detailRes.data);
        const parsedLayout = parseLayoutConfig(detailRes.data.layoutConfigJson);
        setSelectedLayout(
          mapLayoutWithApiBackground(parsedLayout, detailRes.data.backgroundImageUrl)
        );
        return;
      }

      // Fallback khi không lấy được detail: vẫn cho xem preview từ dữ liệu list
      setSelectedTemplate(template);
      setSelectedLayout(parseLayoutConfig(template.layoutConfigJson));
      toast.error(detailRes.message || "Không tải được chi tiết template");
    } catch (error) {
      console.error("Error loading template detail:", error);
      setSelectedTemplate(template);
      setSelectedLayout(parseLayoutConfig(template.layoutConfigJson));
      toast.error("Không tải được chi tiết template");
    }
  };

  useEffect(() => {
    if (!selectedRestaurant?.id) {
      setRestaurantMenu([]);
      return;
    }
    const fetchMenu = async () => {
      try {
        setMenuLoading(true);
        const menuRes = await getMenuByRestaurant(selectedRestaurant.id);
        if (menuRes.isSuccess && menuRes.data) {
          setRestaurantMenu(menuRes.data);
        } else {
          toast.error(menuRes.message || "Không thể tải menu nhà hàng");
          setRestaurantMenu([]);
        }
      } catch (error) {
        console.error("Error loading restaurant menu:", error);
        toast.error("Có lỗi xảy ra khi tải menu nhà hàng");
        setRestaurantMenu([]);
      } finally {
        setMenuLoading(false);
      }
    };
    fetchMenu();
  }, [selectedRestaurant?.id]);

  const handleApplyTemplate = async () => {
    if (!selectedTemplate || !selectedRestaurant) {
      toast.error("Vui lòng chọn template và restaurant");
      return;
    }

    try {
      setApplying(true);
      const request: ApplyMenuTemplateRequest = {
        restaurantId: selectedRestaurant.id,
        templateId: selectedTemplate.id,
      };

      const response = await applyTemplateToRestaurant(request);
      
      if (response.isSuccess) {
        toast.success("Bạn đã áp dụng template vào menu thành công");
      } else {
        toast.error(response.message || "Không thể áp dụng template");
      }
    } catch (error) {
      console.error("Error applying template:", error);
      toast.error("Có lỗi xảy ra khi áp dụng template");
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-slate-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Menu Templates</h1>
        <p className="mt-2 text-slate-600">
          Chọn template và xem menu của bạn với dữ liệu thật
        </p>
      </div>

      {/* Data Summary */}
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-500">Available Templates</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{templates.length}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-500">Your Restaurants</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{restaurants.length}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-500">Menu Categories</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {menuLoading ? "..." : restaurantMenu.length}
          </p>
          {!selectedRestaurant && (
            <p className="mt-1 text-xs text-slate-400">Chọn nhà hàng để xem</p>
          )}
        </div>
      </div>

      {/* Warning if no data */}
      {restaurants.length === 0 && (
        <div className="mb-6 rounded-lg border border-red-300 bg-red-50 p-4">
          <p className="text-sm font-semibold text-red-900">⚠️ Chưa có nhà hàng</p>
          <p className="mt-1 text-xs text-red-700">
            Bạn cần tạo ít nhất một nhà hàng để có thể áp dụng template.
          </p>
        </div>
      )}

      {selectedRestaurant && !menuLoading && restaurantMenu.length === 0 && (
        <div className="mb-6 rounded-lg border border-amber-300 bg-amber-50 p-4">
          <p className="text-sm font-semibold text-amber-900">⚠️ Chưa có dữ liệu menu</p>
          <p className="mt-1 text-xs text-amber-700">
            Nhà hàng này chưa có dữ liệu menu. Hãy thêm categories và dishes trước khi xem preview.
          </p>
        </div>
      )}

      {/* Restaurant Selection */}
      {restaurants.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">
            Chọn Nhà Hàng
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {restaurants.map((restaurant) => (
              <button
                key={restaurant.id}
                onClick={() => setSelectedRestaurant(restaurant)}
                className={`rounded-lg border p-4 text-left transition-all hover:shadow-md ${
                  selectedRestaurant?.id === restaurant.id
                    ? "border-green-500 bg-green-50"
                    : "border-slate-200 bg-white"
                }`}
              >
                <div className="flex items-start gap-3">
                  {restaurant.image && (
                    <img
                      src={restaurant.image}
                      alt={restaurant.restaurantName}
                      className="h-12 w-12 rounded-lg object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900">
                      {restaurant.restaurantName}
                    </h3>
                    {restaurant.address && (
                      <p className="mt-1 text-xs text-slate-600">{restaurant.address}</p>
                    )}
                  </div>
                </div>
                {selectedRestaurant?.id === restaurant.id && (
                  <div className="mt-3 rounded bg-green-600 px-2 py-1 text-center text-xs font-medium text-white">
                    ✓ Đã chọn
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Templates List */}
      <div className="mb-6">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">
          Chọn Template
        </h2>
        {templates.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 py-8 text-center">
            <p className="text-slate-600">Chưa có template nào</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {templates.map((template) => (
              <button
                key={template.id}
                onClick={() => handleSelectTemplate(template)}
                className={`rounded-lg border p-4 text-left transition-all hover:shadow-md ${
                  selectedTemplate?.id === template.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-slate-200 bg-white"
                }`}
              >
                <div
                  className="mb-3 h-12 w-full rounded-lg border border-slate-200"
                  style={{ backgroundColor: template.themeColor }}
                />
                <h3 className="font-semibold text-slate-900">
                  {template.templateName}
                </h3>
                <div className="mt-2 space-y-1 text-sm text-slate-600">
                  <p>Font: {template.fontFamily}</p>
                  <p>Color: {template.themeColor}</p>
                </div>
                {selectedTemplate?.id === template.id && (
                  <div className="mt-3 rounded bg-blue-600 px-2 py-1 text-center text-xs font-medium text-white">
                    ✓ Đã chọn
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Preview with Real Data */}
      {selectedTemplate && selectedLayout && (
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Preview: {selectedTemplate.templateName}
              </h2>
              {selectedRestaurant && (
                <p className="mt-1 text-sm text-slate-600">
                  Áp dụng cho: {selectedRestaurant.restaurantName}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              {selectedRestaurant && (
                <button
                  onClick={handleApplyTemplate}
                  disabled={applying}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-slate-400"
                >
                  {applying ? "Đang xử lý..." : "✓ Xác nhận áp dụng"}
                </button>
              )}
              <button
                onClick={() => {
                  setSelectedTemplate(null);
                  setSelectedLayout(null);
                }}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
              >
                Đóng
              </button>
            </div>
          </div>

          <div className="overflow-auto rounded-lg border border-slate-300 bg-slate-50 p-4">
            <div
              className="relative mx-auto rounded-lg border border-slate-300 p-6"
              style={{
                width: selectedLayout.canvas?.width ?? 1000,
                minHeight: selectedLayout.canvas?.height ?? 800,
                fontFamily: selectedTemplate.fontFamily,
                backgroundColor:
                  selectedLayout.canvas?.backgroundColor ?? "#FFFFFF",
                backgroundImage:
                  selectedLayout.canvas?.backgroundMode === "image" &&
                  selectedLayout.canvas?.backgroundImageUrl
                    ? `url(${selectedLayout.canvas.backgroundImageUrl})`
                    : undefined,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              {/* Header */}
              <header
                className="rounded-lg border p-4"
                style={{
                  borderColor: selectedTemplate.themeColor,
                  color: selectedTemplate.themeColor,
                  minHeight: 90,
                }}
              >
                <h3 className="text-xl font-bold">
                  {selectedRestaurant?.restaurantName || selectedTemplate.templateName}
                </h3>
                <p className="text-sm text-slate-600">
                  {selectedRestaurant?.address || "Menu Template với Data Thật"}
                </p>
              </header>

              {/* Menu Content with Real Data */}
              <section
                className="mt-4 rounded-lg border p-4"
                style={{ borderColor: selectedTemplate.themeColor }}
              >
                {menuLoading ? (
                  <div className="py-8 text-center text-slate-500">
                    <p className="text-sm">Đang tải menu...</p>
                  </div>
                ) : restaurantMenu.length === 0 ? (
                  <div className="py-8 text-center text-slate-500">
                    <p>Chưa có category nào</p>
                    <p className="mt-1 text-xs">
                      Hãy thêm category để xem menu hiển thị
                    </p>
                  </div>
                ) : (
                  restaurantMenu.map((category) => (
                    <div key={category.categoryId} className="mb-4 last:mb-0">
                      <h4
                        className="text-lg font-semibold"
                        style={{ color: selectedTemplate.themeColor }}
                      >
                        {category.categoryName}
                      </h4>
                      <ul className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2">
                        {category.dishes.length > 0 ? (
                          category.dishes.map((dish) => (
                            <li
                              key={dish.dishId}
                              className={`rounded border bg-white px-3 py-2 text-sm ${dish.isSoldOut ? "opacity-60" : "border-slate-200"}`}
                            >
                              <div className="flex items-start gap-2">
                                {dish.imageUrl && (
                                  <img
                                    src={dish.imageUrl}
                                    alt={dish.dishName}
                                    className="h-12 w-12 flex-shrink-0 rounded object-cover"
                                  />
                                )}
                                <div className="flex flex-1 items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-1">
                                      <p className="font-medium text-slate-900">
                                        {dish.dishName}
                                      </p>
                                      {dish.isSoldOut && (
                                        <span className="rounded bg-slate-200 px-1 py-0.5 text-xs text-slate-500">
                                          Hết
                                        </span>
                                      )}
                                    </div>
                                    {dish.description && (
                                      <p className="mt-0.5 text-xs text-slate-500 line-clamp-2">
                                        {dish.description}
                                      </p>
                                    )}
                                  </div>
                                  <div className="ml-2 text-right">
                                    {dish.hasPromotion ? (
                                      <>
                                        <p className="text-xs text-slate-400 line-through">
                                          {dish.price.toLocaleString()}₫
                                        </p>
                                        <p className="font-semibold text-red-600">
                                          {dish.discountedPrice.toLocaleString()}₫
                                        </p>
                                        <span className="inline-block rounded bg-red-100 px-1 py-0.5 text-xs font-medium text-red-700">
                                          {dish.promotionLabel}
                                        </span>
                                      </>
                                    ) : (
                                      <p className="font-semibold text-slate-900">
                                        {dish.price.toLocaleString()}₫
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </li>
                          ))
                        ) : (
                          <li className="col-span-2 py-2 text-center text-xs text-slate-400">
                            Chưa có món nào trong category này
                          </li>
                        )}
                      </ul>
                    </div>
                  ))
                )}
              </section>

              {/* Footer */}
              <footer
                className="mt-4 rounded-lg border p-3 text-sm text-slate-600"
                style={{ borderColor: selectedTemplate.themeColor }}
              >
                Footer / Ghi chú
              </footer>
            </div>
          </div>

          {/* Data Mapping Info */}
          {selectedLayout.dataMapping && (
            <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
              <p className="text-sm font-semibold text-blue-900">
                ℹ️ Template này đang sử dụng data thật của bạn (bao gồm khuyến mãi)
              </p>
              <p className="mt-1 text-xs text-blue-700">
                Categories: {restaurantMenu.length} | Dishes: {restaurantMenu.reduce((acc, c) => acc + c.dishes.length, 0)}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
