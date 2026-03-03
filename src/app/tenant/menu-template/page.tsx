"use client";

import { useEffect, useState } from "react";
import apiClient from "@/src/services/apiClient";
import { API } from "@/src/constants/api";
import { ApiResponse, CategoryDto, DishesDto, Restaurant, ApplyMenuTemplateRequest } from "@/src/types/type";
import { toast } from "sonner";

interface MenuTemplate {
  id: number;
  templateName: string;
  layoutConfigJson: string;
  themeColor: string;
  fontFamily: string;
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

const getCategoriesByTenant = async (): Promise<ApiResponse<CategoryDto[]>> => {
  const response = await apiClient.get<ApiResponse<CategoryDto[]>>(
    API.CATEGORY.GET_ALL
  );
  return response.data;
};

const getDishesByTenant = async (): Promise<ApiResponse<DishesDto[]>> => {
  const response = await apiClient.get<ApiResponse<DishesDto[]>>(
    API.DISHES.GET_ALL
  );
  return response.data;
};

const getRestaurantsByTenant = async (): Promise<ApiResponse<Restaurant[]>> => {
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
  const [templates, setTemplates] = useState<MenuTemplate[]>([]);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [dishes, setDishes] = useState<DishesDto[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<MenuTemplate | null>(null);
  const [selectedLayout, setSelectedLayout] = useState<TemplateLayoutConfig | null>(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      
      const [templatesRes, categoriesRes, dishesRes, restaurantsRes] = await Promise.all([
        getAllMenuTemplates(),
        getCategoriesByTenant(),
        getDishesByTenant(),
        getRestaurantsByTenant(),
      ]);

      if (templatesRes.isSuccess && templatesRes.data) {
        setTemplates(templatesRes.data);
      } else {
        toast.error(templatesRes.message || "Failed to load templates");
      }

      if (categoriesRes.isSuccess && categoriesRes.data) {
        setCategories(categoriesRes.data);
      } else {
        toast.error(categoriesRes.message || "Failed to load categories");
      }

      if (dishesRes.isSuccess && dishesRes.data) {
        setDishes(dishesRes.data);
      } else {
        toast.error(dishesRes.message || "Failed to load dishes");
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

  const handleSelectTemplate = (template: MenuTemplate) => {
    setSelectedTemplate(template);
    setSelectedLayout(parseLayoutConfig(template.layoutConfigJson));
  };

  const groupDishesByCategory = () => {
    const grouped: { [categoryId: number]: DishesDto[] } = {};
    dishes.forEach((dish) => {
      if (dish.categoryId) {
        if (!grouped[dish.categoryId]) {
          grouped[dish.categoryId] = [];
        }
        grouped[dish.categoryId].push(dish);
      }
    });
    return grouped;
  };

  const dishesByCategory = groupDishesByCategory();

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
        toast.success("Áp dụng template vô nhà hàng thành công");
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
      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-500">Available Templates</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{templates.length}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-500">Your Restaurants</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{restaurants.length}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-500">Your Categories</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{categories.length}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-500">Your Dishes</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{dishes.length}</p>
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

      {(categories.length === 0 || dishes.length === 0) && (
        <div className="mb-6 rounded-lg border border-amber-300 bg-amber-50 p-4">
          <p className="text-sm font-semibold text-amber-900">⚠️ Chưa có dữ liệu menu</p>
          <p className="mt-1 text-xs text-amber-700">
            Bạn cần thêm categories và dishes trước khi xem preview menu. 
            Hãy vào trang quản lý để thêm dữ liệu.
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
                {categories.length === 0 ? (
                  <div className="py-8 text-center text-slate-500">
                    <p>Chưa có category nào</p>
                    <p className="mt-1 text-xs">
                      Hãy thêm category để xem menu hiển thị
                    </p>
                  </div>
                ) : (
                  categories.map((category) => (
                    <div key={category.id} className="mb-4 last:mb-0">
                      <h4
                        className="text-lg font-semibold"
                        style={{ color: selectedTemplate.themeColor }}
                      >
                        {category.categoryName}
                      </h4>
                      <ul className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2">
                        {dishesByCategory[category.id]?.length > 0 ? (
                          dishesByCategory[category.id].map((dish) => (
                            <li
                              key={dish.id}
                              className="rounded border border-slate-200 bg-white px-3 py-2 text-sm"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <p className="font-medium text-slate-900">
                                    {dish.dishName}
                                  </p>
                                  {dish.description && (
                                    <p className="mt-1 text-xs text-slate-500">
                                      {dish.description}
                                    </p>
                                  )}
                                </div>
                                <p className="ml-2 font-semibold text-slate-900">
                                  {dish.price.toLocaleString()}₫
                                </p>
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
                ℹ️ Template này đang sử dụng data thật của bạn
              </p>
              <p className="mt-1 text-xs text-blue-700">
                Categories: {categories.length} | Dishes: {dishes.length}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
