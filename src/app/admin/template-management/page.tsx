"use client";

import { useEffect, useState } from "react";
import apiClient from "@/src/services/apiClient";
import { API } from "@/src/constants/api";
import { ApiResponse } from "@/src/types/type";
import { toast } from "sonner";

interface MenuTemplate {
  id: number;
  tenantId?: string;
  templateName: string;
  layoutConfigJson: string;
  themeColor: string;
  fontFamily: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  backgroundImageUrl?: string;
}

interface FixedLayoutSlot {
  key: "header" | "menu" | "footer";
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  dataSource: "static" | "menu";
}

interface MenuSection {
  id: string;
  name: string;
  dishes: string[];
}

interface DataMapping {
  categories: {
    source: string;
    displayField: string;
  };
  dishes: {
    source: string;
    groupBy: string;
    displayFields: string[];
  };
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
  slots?: FixedLayoutSlot[];
  dataMapping?: DataMapping;
  // menuStructure chỉ dùng cho old templates (backward compatibility)
  menuStructure?: MenuSection[];
}

const getAllMenuTemplates = async (): Promise<ApiResponse<MenuTemplate[]>> => {
  const response = await apiClient.get<ApiResponse<MenuTemplate[]>>(
    API.MENU_TEMPLATE.GET_ALL
  );
  return response.data;
};

const createMenuTemplate = async (
  payload: FormData
): Promise<ApiResponse<MenuTemplate>> => {
  const response = await apiClient.post<ApiResponse<MenuTemplate>>(
    API.MENU_TEMPLATE.CREATE,
    payload,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
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

const FIXED_SLOTS: FixedLayoutSlot[] = [
  {
    key: "header",
    label: "Header / Tên nhà hàng",
    x: 24,
    y: 24,
    width: 952,
    height: 90,
    dataSource: "static",
  },
  {
    key: "menu",
    label: "Khối menu (category + dishes)",
    x: 24,
    y: 130,
    width: 952,
    height: 550,
    dataSource: "menu",
  },
  {
    key: "footer",
    label: "Footer / Ghi chú",
    x: 24,
    y: 696,
    width: 952,
    height: 80,
    dataSource: "static",
  },
];

const initialSections: MenuSection[] = [
  {
    id: "section-1",
    name: "Nước uống",
    dishes: ["Cà phê", "Nước cam", "Coca"],
  },
];

export default function TemplateManagementPage() {
  const [step, setStep] = useState<"list" | "create">("list");
  const [templates, setTemplates] = useState<MenuTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedTemplateDetail, setSelectedTemplateDetail] =
    useState<MenuTemplate | null>(null);
  const [selectedTemplateLayout, setSelectedTemplateLayout] =
    useState<TemplateLayoutConfig | null>(null);
  const [loadingDetailId, setLoadingDetailId] = useState<number | null>(null);

  const [templateName, setTemplateName] = useState("");
  const [themeColor, setThemeColor] = useState("#3B82F6");
  const [fontFamily, setFontFamily] = useState("Arial");
  const [backgroundMode, setBackgroundMode] = useState<"color" | "image">(
    "color"
  );
  const [backgroundColor, setBackgroundColor] = useState("#FFFFFF");
  const [backgroundImageUrl, setBackgroundImageUrl] = useState("");
  const [backgroundImageFile, setBackgroundImageFile] = useState<File | null>(null);
  const [backgroundImagePreviewUrl, setBackgroundImagePreviewUrl] = useState("");
  const [sections, setSections] = useState<MenuSection[]>(initialSections);

  useEffect(() => {
    loadTemplates();
  }, []);

  useEffect(() => {
    if (!backgroundImageFile) {
      setBackgroundImagePreviewUrl("");
      return;
    }

    const localPreviewUrl = URL.createObjectURL(backgroundImageFile);
    setBackgroundImagePreviewUrl(localPreviewUrl);

    return () => {
      URL.revokeObjectURL(localPreviewUrl);
    };
  }, [backgroundImageFile]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const response = await getAllMenuTemplates();
      if (response.isSuccess && response.data) {
        setTemplates(response.data);
      } else {
        toast.error(response.message || "Failed to load templates");
      }
    } catch (error) {
      console.error("Error loading templates:", error);
      toast.error("Error loading templates");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTemplateName("");
    setThemeColor("#3B82F6");
    setFontFamily("Arial");
    setBackgroundMode("color");
    setBackgroundColor("#FFFFFF");
    setBackgroundImageUrl("");
    setBackgroundImageFile(null);
    setSections(initialSections);
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

  const handleViewTemplateDetail = async (id: number) => {
    try {
      setLoadingDetailId(id);
      const response = await getMenuTemplateById(id);
      if (response.isSuccess && response.data) {
        setSelectedTemplateDetail(response.data);
        const parsedLayout = parseLayoutConfig(response.data.layoutConfigJson);
        setSelectedTemplateLayout(
          mapLayoutWithApiBackground(parsedLayout, response.data.backgroundImageUrl)
        );
      } else {
        toast.error(response.message || "Failed to load template detail");
      }
    } catch (error) {
      console.error("Error loading template detail:", error);
      toast.error("Error loading template detail");
    } finally {
      setLoadingDetailId(null);
    }
  };

  const addCategory = () => {
    const newIndex = sections.length + 1;
    setSections((prev) => [
      ...prev,
      {
        id: `section-${Date.now()}`,
        name: `Category ${newIndex}`,
        dishes: ["Dish mới"],
      },
    ]);
  };

  const removeCategory = (sectionId: string) => {
    setSections((prev) => {
      if (prev.length <= 1) {
        toast.error("Cần ít nhất 1 category");
        return prev;
      }
      return prev.filter((section) => section.id !== sectionId);
    });
  };

  const updateCategoryName = (sectionId: string, name: string) => {
    setSections((prev) =>
      prev.map((section) =>
        section.id === sectionId ? { ...section, name } : section
      )
    );
  };

  const addDish = (sectionId: string) => {
    setSections((prev) =>
      prev.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              dishes: [...section.dishes, `Dish ${section.dishes.length + 1}`],
            }
          : section
      )
    );
  };

  const removeDish = (sectionId: string, dishIndex: number) => {
    setSections((prev) =>
      prev.map((section) => {
        if (section.id !== sectionId) {
          return section;
        }
        if (section.dishes.length <= 1) {
          toast.error("Mỗi category cần ít nhất 1 dish");
          return section;
        }
        return {
          ...section,
          dishes: section.dishes.filter((_, index) => index !== dishIndex),
        };
      })
    );
  };

  const updateDishName = (sectionId: string, dishIndex: number, value: string) => {
    setSections((prev) =>
      prev.map((section) => {
        if (section.id !== sectionId) {
          return section;
        }
        return {
          ...section,
          dishes: section.dishes.map((dish, index) =>
            index === dishIndex ? value : dish
          ),
        };
      })
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!templateName.trim()) {
      toast.error("Template name is required");
      return;
    }

    if (sections.some((section) => !section.name.trim())) {
      toast.error("Category name không được để trống");
      return;
    }

    if (sections.some((section) => section.dishes.some((dish) => !dish.trim()))) {
      toast.error("Dish name không được để trống");
      return;
    }

    try {
      setSubmitting(true);

      const layoutConfigJson = JSON.stringify({
        version: 1,
        canvas: {
          width: 1000,
          height: 800,
          backgroundMode,
          backgroundColor,
          backgroundImageUrl:
            backgroundMode === "image"
              ? (backgroundImageUrl.trim() || undefined)
              : undefined,
        },
        slots: FIXED_SLOTS,
        // Lưu dataMapping thay vì menuStructure
        dataMapping: {
          categories: {
            source: "API.CATEGORY.GET_ALL_BY_TENANT_ID(tenantId)",
            displayField: "categoryName",
          },
          dishes: {
            source: "API.DISHES.GET_ALL_BY_TENANT_ID(tenantId)",
            groupBy: "categoryId",
            displayFields: ["dishName", "price", "description"],
          },
        },
      });

      const payload = new FormData();
      payload.append("TemplateName", templateName);
      payload.append("ThemeColor", themeColor);
      payload.append("FontFamily", fontFamily);
      payload.append("LayoutConfigJson", layoutConfigJson);
      if (backgroundMode === "image" && backgroundImageFile) {
        payload.append("BackgroundImageUrl", backgroundImageFile);
      }

      const response = await createMenuTemplate(payload);
      if (response.isSuccess) {
        toast.success("Template created successfully");
        resetForm();
        setStep("list");
        await loadTemplates();
      } else {
        toast.error(response.message || "Failed to create template");
      }
    } catch (error) {
      console.error("Error creating template:", error);
      toast.error("Error creating template");
    } finally {
      setSubmitting(false);
    }
  };

  if (step === "list") {
    return (
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Template Management</h1>
            <p className="mt-2 text-slate-600">
              Tạo template menu với layout cố định. Tenant sẽ đổ data thật (category/dishes) vào template này.
            </p>
          </div>
          <button
            onClick={() => setStep("create")}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            + Create Template
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="text-slate-500">Loading templates...</div>
          </div>
        ) : templates.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 py-8 text-center">
            <p className="text-slate-600">No templates found</p>
            <p className="text-sm text-slate-500">Create your first template to get started</p>
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="rounded-lg border border-slate-200 bg-white p-4 transition-shadow hover:shadow-md"
                >
                  <div
                    className="mb-3 h-12 w-full rounded-lg border border-slate-200"
                    style={{ backgroundColor: template.themeColor }}
                  />
                  <h3 className="font-semibold text-slate-900">{template.templateName}</h3>
                  <div className="mt-2 space-y-1 text-sm text-slate-600">
                    <p>Font: {template.fontFamily}</p>
                    <p>Color: {template.themeColor}</p>
                    {template.createdAt && (
                      <p className="text-xs text-slate-500">
                        Created: {new Date(template.createdAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleViewTemplateDetail(template.id)}
                    disabled={loadingDetailId === template.id}
                    className="mt-4 w-full rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
                  >
                    {loadingDetailId === template.id ? "Loading..." : "Xem chi tiết"}
                  </button>
                </div>
              ))}
            </div>

            {selectedTemplateDetail && (
              <div className="mt-6 rounded-lg border border-slate-200 bg-white p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-slate-900">
                    Chi tiết template #{selectedTemplateDetail.id}
                  </h2>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTemplateDetail(null);
                      setSelectedTemplateLayout(null);
                    }}
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    Đóng
                  </button>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-lg border border-slate-200 p-3 text-sm">
                    <p className="text-slate-500">Template Name</p>
                    <p className="font-medium text-slate-900">
                      {selectedTemplateDetail.templateName}
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-200 p-3 text-sm">
                    <p className="text-slate-500">Theme Color</p>
                    <div className="mt-1 flex items-center gap-2">
                      <span
                        className="inline-block h-4 w-4 rounded border border-slate-300"
                        style={{ backgroundColor: selectedTemplateDetail.themeColor }}
                      />
                      <span className="font-medium text-slate-900">
                        {selectedTemplateDetail.themeColor}
                      </span>
                    </div>
                  </div>
                  <div className="rounded-lg border border-slate-200 p-3 text-sm">
                    <p className="text-slate-500">Font</p>
                    <p className="font-medium text-slate-900">
                      {selectedTemplateDetail.fontFamily}
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-200 p-3 text-sm md:col-span-3">
                    <p className="text-slate-500">Background Image URL</p>
                    <p className="break-all font-medium text-slate-900">
                      {selectedTemplateDetail.backgroundImageUrl || "(Không có)"}
                    </p>
                  </div>
                </div>

                {/* Data Mapping Rules Section */}
                <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
                  <h3 className="mb-3 font-semibold text-blue-900">
                    📋 Data Mapping Rules (Tenant sẽ đổ data thật vào)
                  </h3>
                  {selectedTemplateLayout?.dataMapping ? (
                    <div className="space-y-3 text-sm">
                      <div className="rounded-lg border border-blue-200 bg-white p-3">
                        <p className="font-semibold text-slate-900">Categories:</p>
                        <ul className="mt-1 space-y-1 text-slate-700">
                          <li>• Source: <code className="rounded bg-slate-100 px-1 py-0.5">{selectedTemplateLayout.dataMapping.categories.source}</code></li>
                          <li>• Display Field: <code className="rounded bg-slate-100 px-1 py-0.5">{selectedTemplateLayout.dataMapping.categories.displayField}</code></li>
                        </ul>
                      </div>
                      <div className="rounded-lg border border-blue-200 bg-white p-3">
                        <p className="font-semibold text-slate-900">Dishes:</p>
                        <ul className="mt-1 space-y-1 text-slate-700">
                          <li>• Source: <code className="rounded bg-slate-100 px-1 py-0.5">{selectedTemplateLayout.dataMapping.dishes.source}</code></li>
                          <li>• Group By: <code className="rounded bg-slate-100 px-1 py-0.5">{selectedTemplateLayout.dataMapping.dishes.groupBy}</code></li>
                          <li>• Display Fields: {selectedTemplateLayout.dataMapping.dishes.displayFields.map((field) => (
                            <code key={field} className="mr-1 rounded bg-slate-100 px-1 py-0.5">{field}</code>
                          ))}</li>
                        </ul>
                      </div>
                      <p className="text-xs text-blue-700">
                        ℹ️ Tenant sẽ gọi các API trên để lấy category và dish thật của họ, dữ liệu sẽ được render theo layout này.
                      </p>
                    </div>
                  ) : (
                    <div className="text-sm text-amber-700">
                      ⚠️ Template này chưa có dataMapping (có thể là template cũ). 
                      {selectedTemplateLayout?.menuStructure && (
                        <span className="ml-1">Đang dùng menuStructure cứng (deprecated).</span>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-4 rounded-lg border border-slate-200 p-4">
                  <h3 className="mb-3 font-semibold text-slate-900">Template Preview</h3>
                  {selectedTemplateLayout ? (
                    <div className="overflow-auto rounded-lg border border-slate-300 bg-slate-50 p-4">
                      <div
                        className="relative mx-auto rounded-lg border border-slate-300 p-6"
                        style={{
                          width: selectedTemplateLayout.canvas?.width ?? 1000,
                          minHeight: selectedTemplateLayout.canvas?.height ?? 800,
                          fontFamily: selectedTemplateDetail.fontFamily,
                          backgroundColor:
                            selectedTemplateLayout.canvas?.backgroundColor ?? "#FFFFFF",
                          backgroundImage:
                            selectedTemplateLayout.canvas?.backgroundMode === "image" &&
                            (selectedTemplateLayout.canvas?.backgroundImageUrl ||
                              selectedTemplateDetail.backgroundImageUrl)
                              ? `url(${selectedTemplateLayout.canvas?.backgroundImageUrl || selectedTemplateDetail.backgroundImageUrl})`
                              : undefined,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }}
                      >
                        <header
                          className="rounded-lg border p-4"
                          style={{
                            borderColor: selectedTemplateDetail.themeColor,
                            color: selectedTemplateDetail.themeColor,
                            minHeight: 90,
                          }}
                        >
                          <h3 className="text-xl font-bold">
                            {selectedTemplateDetail.templateName || "Tên nhà hàng"}
                          </h3>
                          <p className="text-sm text-slate-600">Menu template preview</p>
                        </header>

                        <section
                          className="mt-4 rounded-lg border p-4"
                          style={{ borderColor: selectedTemplateDetail.themeColor }}
                        >
                          {selectedTemplateLayout.dataMapping ? (
                            <div className="space-y-3 text-center text-slate-600">
                              <p className="text-sm">
                                🎨 Template này sử dụng <strong>Data Mapping</strong>
                              </p>
                              <p className="text-xs">
                                Tenant sẽ đổ category và dish thật của họ vào layout này.
                              </p>
                              <div className="mt-4 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4">
                                <p className="text-xs text-slate-500">Ví dụ khi render:</p>
                                <div className="mt-2 text-left text-xs">
                                  <p className="font-semibold" style={{ color: selectedTemplateDetail.themeColor }}>
                                    Category: [Tên từ tenant DB]
                                  </p>
                                  <ul className="mt-1 list-disc pl-5 text-slate-700">
                                    <li>Dish 1 - Price 1</li>
                                    <li>Dish 2 - Price 2</li>
                                    <li>...</li>
                                  </ul>
                                </div>
                              </div>
                            </div>
                          ) : selectedTemplateLayout.menuStructure?.length ? (
                            <>
                              <div className="mb-3 rounded-lg border border-amber-300 bg-amber-50 p-2 text-xs text-amber-700">
                                ⚠️ Template cũ (deprecated): đang dùng menuStructure cứng thay vì dataMapping
                              </div>
                              {selectedTemplateLayout.menuStructure.map((section) => (
                                <div key={section.id} className="mb-4 last:mb-0">
                                  <h4
                                    className="text-lg font-semibold"
                                    style={{ color: selectedTemplateDetail.themeColor }}
                                  >
                                    Category: {section.name || "(Chưa đặt tên)"}
                                  </h4>
                                  <ul className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2">
                                    {section.dishes.map((dish, index) => (
                                      <li
                                        key={`${section.id}-preview-${index}`}
                                        className="rounded border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
                                      >
                                        {dish || "(Dish trống)"}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              ))}
                            </>
                          ) : (
                            <p className="text-sm text-slate-500">
                              Không có dữ liệu để hiển thị preview.
                            </p>
                          )}
                        </section>

                        <footer
                          className="mt-4 rounded-lg border p-3 text-sm text-slate-600"
                          style={{ borderColor: selectedTemplateDetail.themeColor }}
                        >
                          Footer / Ghi chú
                        </footer>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">
                      Không đọc được layoutConfigJson để dựng preview.
                    </p>
                  )}
                </div>

                <div className="mt-4 rounded-lg border border-slate-200 p-4">
                  <h3 className="mb-2 font-semibold text-slate-900">Raw layoutConfigJson</h3>
                  <pre className="max-h-60 overflow-auto rounded bg-slate-100 p-3 text-xs text-slate-700">
                    {selectedTemplateDetail.layoutConfigJson}
                  </pre>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  const canvasStyle: React.CSSProperties = {
    width: 1000,
    minHeight: 800,
    fontFamily,
    backgroundColor,
    backgroundImage:
      backgroundMode === "image" && (backgroundImagePreviewUrl || backgroundImageUrl.trim())
        ? `url(${backgroundImagePreviewUrl || backgroundImageUrl.trim()})`
        : undefined,
    backgroundSize: "cover",
    backgroundPosition: "center",
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <button
          onClick={() => {
            setStep("list");
            resetForm();
          }}
          className="mb-2 text-blue-600 hover:text-blue-700"
        >
          ← Back to Templates
        </button>
        <h1 className="text-2xl font-bold text-slate-900">Create Menu Template</h1>
        <p className="mt-2 text-slate-600">
          Thiết kế layout và style cho menu. Tenant sẽ áp dụng template này và đổ data thật của họ vào.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Template Settings</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700">Template Name</label>
              <input
                type="text"
                required
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Hotpot Classic"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Font Family</label>
              <select
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Arial">Arial</option>
                <option value="Helvetica">Helvetica</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Georgia">Georgia</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Theme Color</label>
              <div className="mt-1 flex items-center gap-2">
                <input
                  type="color"
                  value={themeColor}
                  onChange={(e) => setThemeColor(e.target.value)}
                  className="h-10 w-16 cursor-pointer rounded border border-slate-300"
                />
                <input
                  type="text"
                  value={themeColor}
                  onChange={(e) => setThemeColor(e.target.value)}
                  className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Background Mode</label>
              <select
                value={backgroundMode}
                onChange={(e) => setBackgroundMode(e.target.value as "color" | "image")}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="color">Color</option>
                <option value="image">Image URL</option>
              </select>
            </div>

            {backgroundMode === "color" ? (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700">Background Color</label>
                <div className="mt-1 flex items-center gap-2">
                  <input
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="h-10 w-16 cursor-pointer rounded border border-slate-300"
                  />
                  <input
                    type="text"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
              </div>
            ) : (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700">Background Image Upload</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setBackgroundImageFile(e.target.files?.[0] ?? null)}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
                <p className="mt-1 text-xs text-slate-500">
                  Ảnh sẽ được upload lên server qua field <code className="rounded bg-slate-100 px-1">BackgroundImageUrl</code>.
                </p>

                <label className="mt-3 block text-sm font-medium text-slate-700">Hoặc nhập URL ảnh (preview local)</label>
                <input
                  type="url"
                  value={backgroundImageUrl}
                  onChange={(e) => setBackgroundImageUrl(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/background.jpg"
                />
              </div>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <div className="mb-3 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">
            <p className="font-semibold">ℹ️ Lưu ý: Phần này CHỈ dùng để preview UI</p>
            <p className="mt-1 text-xs text-blue-700">
              Category/Dish mà bạn nhập ở đây <strong>KHÔNG</strong> được lưu vào database. 
              Khi tenant sử dụng template, họ sẽ đổ data thật từ API <code className="rounded bg-blue-100 px-1">API.CATEGORY.GET_ALL_BY_TENANT_ID(tenantId)</code> 
              và <code className="rounded bg-blue-100 px-1">API.DISHES.GET_ALL_BY_TENANT_ID(tenantId)</code> vào layout này.
            </p>
          </div>
          
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Cấu trúc menu (Preview only)</h2>
            <button
              type="button"
              onClick={addCategory}
              className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700"
            >
              + Category
            </button>
          </div>

          <div className="space-y-4">
            {sections.map((section) => (
              <div key={section.id} className="rounded-lg border border-slate-300 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <input
                    type="text"
                    value={section.name}
                    onChange={(e) => updateCategoryName(section.id, e.target.value)}
                    className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Tên category"
                  />
                  <button
                    type="button"
                    onClick={() => addDish(section.id)}
                    className="rounded-lg bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700"
                  >
                    + Dish
                  </button>
                  <button
                    type="button"
                    onClick={() => removeCategory(section.id)}
                    className="rounded-lg bg-rose-600 px-3 py-2 text-sm text-white hover:bg-rose-700"
                  >
                    - Category
                  </button>
                </div>

                <div className="space-y-2">
                  {section.dishes.map((dish, dishIndex) => (
                    <div key={`${section.id}-${dishIndex}`} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={dish}
                        onChange={(e) =>
                          updateDishName(section.id, dishIndex, e.target.value)
                        }
                        className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Tên dish"
                      />
                      <button
                        type="button"
                        onClick={() => removeDish(section.id, dishIndex)}
                        className="rounded-lg bg-rose-500 px-3 py-2 text-sm text-white hover:bg-rose-600"
                      >
                        - Dish
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Menu Preview</h2>
          <div className="overflow-auto rounded-lg border border-slate-300 bg-slate-50 p-4">
            <div className="relative mx-auto rounded-lg border border-slate-300 p-6" style={canvasStyle}>
              <header
                className="rounded-lg border p-4"
                style={{ borderColor: themeColor, color: themeColor, minHeight: 90 }}
              >
                <h3 className="text-xl font-bold">{templateName || "Tên nhà hàng"}</h3>
                <p className="text-sm text-slate-600">Menu template preview</p>
              </header>

              <section className="mt-4 rounded-lg border p-4" style={{ borderColor: themeColor }}>
                {sections.map((section) => (
                  <div key={section.id} className="mb-4 last:mb-0">
                    <h4 className="text-lg font-semibold" style={{ color: themeColor }}>
                      Category: {section.name || "(Chưa đặt tên)"}
                    </h4>
                    <ul className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2">
                      {section.dishes.map((dish, index) => (
                        <li
                          key={`${section.id}-preview-${index}`}
                          className="rounded border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
                        >
                          {dish || "(Dish trống)"}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </section>

              <footer
                className="mt-4 rounded-lg border p-3 text-sm text-slate-600"
                style={{ borderColor: themeColor }}
              >
                Footer / Ghi chú
              </footer>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? "Creating..." : "Save Template"}
          </button>
          <button
            type="button"
            onClick={() => {
              setStep("list");
              resetForm();
            }}
            className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
