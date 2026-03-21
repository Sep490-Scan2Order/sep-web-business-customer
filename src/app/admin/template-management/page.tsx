"use client";

import { useEffect, useMemo, useState } from "react";
import apiClient from "@/src/services/apiClient";
import { API } from "@/src/constants/api";
import { ApiResponse } from "@/src/types/type";
import { toast } from "react-toastify";
import {
  MenuTemplateCategory,
  CanvasConfig,
} from "@/src/types/menuTemplate";
import { MenuTemplatePreview } from "@/src/components/ui/common/menu/MenuTemplatePreview";

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
  menu?: {
    source: string;
    categoryField: string;
    dishesField: string;
    dishDisplayFields: string[];
    promotionFields: string[];
  };
  categories?: {
    source: string;
    displayField: string;
  };
  dishes?: {
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
  /**
   * Cấu hình header trên app customer (back, search, cart)
   */
  header?: {
    showBackButton: boolean;
    showSearch: boolean;
    searchPlaceholder: string;
    showCart: boolean;
  };
  /**
   * Cấu hình dãy chip category bên dưới header
   */
  chips?: {
    showAllChip: boolean;
    allChipLabel: string;
    categoryChipStyle: "pill" | "outline";
  };
  /**
   * Cấu hình card món ăn + nút thêm vào giỏ
   */
  card?: {
    imageSize: "sm" | "md" | "lg";
    borderRadius: number;
    showPromotionBadge: boolean;
    showOriginalPriceStrikethrough: boolean;
    priceColorMode: "theme" | "red";
    showStockLine: boolean;
    addToCartButton: {
      show: boolean;
      label: string;
      shape: "pill" | "rounded";
    };
  };
  slots?: FixedLayoutSlot[];
  dataMapping?: DataMapping;
  menuStructure?: MenuSection[];
}

interface AiHolidayResponse {
  templateName: string;
  themeColor: string;
  fontFamily: string;
  backgroundColor: string;
  backgroundImageUrl: string;
  layoutConfigJson: string;
}

type BackgroundMode = "color" | "image";

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

const SAMPLE_MENU: MenuTemplateCategory[] = [
  {
    categoryId: 1,
    categoryName: "Món Chính",
    dishes: [
      {
        dishId: 11,
        dishName: "Gỏi Cuốn Tôm Thịt",
        description:
          "Gỏi cuốn tươi với tôm, thịt ba chỉ và rau sống, chấm nước mắm đậm đà.",
        imageUrl: "",
        price: 50000,
        discountedPrice: 24999,
        isSoldOut: false,
        hasPromotion: true,
        promotionLabel: "-25.00%",
        dishAvailabilityStock: 8,
      },
      {
        dishId: 12,
        dishName: "Chả Giò Hải Sản",
        description: "Chả giò chiên giòn nhân hải sản tươi ngon.",
        imageUrl: "",
        price: 69999,
        discountedPrice: 34999,
        isSoldOut: false,
        hasPromotion: true,
        promotionLabel: "-25.00%",
        dishAvailabilityStock: 8,
      },
    ],
  },
  {
    categoryId: 2,
    categoryName: "Đồ Uống",
    dishes: [
      {
        dishId: 21,
        dishName: "Trà Đào Cam Sả",
        description: "Trà đào cam sả mát lạnh, giải nhiệt.",
        imageUrl: "",
        price: 39000,
        discountedPrice: 29000,
        isSoldOut: false,
        hasPromotion: true,
        promotionLabel: "-20.00%",
        dishAvailabilityStock: 10,
      },
      {
        dishId: 22,
        dishName: "Cà Phê Sữa Đá",
        description: "Cà phê phin truyền thống, sữa đặc.",
        imageUrl: "",
        price: 29000,
        isSoldOut: false,
        hasPromotion: false,
        dishAvailabilityStock: 20,
      },
    ],
  },
];

const initialSections: MenuSection[] = [
  {
    id: "section-1",
    name: "Nước uống",
    dishes: ["Cà phê", "Nước cam", "Coca"],
  },
];

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

const generateHolidayTemplateAi = async (
  holidayName: string
): Promise<ApiResponse<AiHolidayResponse>> => {
  const response = await apiClient.post<ApiResponse<AiHolidayResponse>>(
    API.MENU_TEMPLATE.GENERATE_HOLIDAY_AI,
    { holidayName }
  );
  return response.data;
};

const mergeLayoutConfig = (
  currentLayout: TemplateLayoutConfig,
  layoutPatch: Partial<TemplateLayoutConfig> | null
): TemplateLayoutConfig => {
  if (!layoutPatch) return currentLayout;
  const currentCanvas = currentLayout.canvas ?? {};
  const patchCanvas = layoutPatch.canvas ?? {};
  const currentHeader = currentLayout.header ?? {};
  const patchHeader = layoutPatch.header ?? {};
  const currentChips = currentLayout.chips ?? {};
  const patchChips = layoutPatch.chips ?? {};
  const currentCard = currentLayout.card ?? {};
  const patchCard = layoutPatch.card ?? {};
  const currentAddToCart = currentLayout.card?.addToCartButton ?? {};
  const patchAddToCart = layoutPatch.card?.addToCartButton ?? {};
  const currentDataMapping = currentLayout.dataMapping ?? {};
  const patchDataMapping = layoutPatch.dataMapping ?? {};
  const currentMenuMapping = currentLayout.dataMapping?.menu ?? {};
  const patchMenuMapping = layoutPatch.dataMapping?.menu ?? {};
  const currentCategoriesMapping = currentLayout.dataMapping?.categories ?? {};
  const patchCategoriesMapping = layoutPatch.dataMapping?.categories ?? {};
  const currentDishesMapping = currentLayout.dataMapping?.dishes ?? {};
  const patchDishesMapping = layoutPatch.dataMapping?.dishes ?? {};

  return {
    ...currentLayout,
    ...layoutPatch,
    canvas:
      currentLayout.canvas || layoutPatch.canvas
        ? {
            width:
              layoutPatch.canvas?.width ?? currentLayout.canvas?.width ?? 1000,
            height:
              layoutPatch.canvas?.height ?? currentLayout.canvas?.height ?? 800,
            ...currentCanvas,
            ...patchCanvas,
          }
        : undefined,
    header:
      currentLayout.header || layoutPatch.header
        ? {
            showBackButton: true,
            showSearch: true,
            searchPlaceholder: "Tìm món ăn, đồ uống...",
            showCart: true,
            ...currentHeader,
            ...patchHeader,
          }
        : undefined,
    chips:
      currentLayout.chips || layoutPatch.chips
        ? {
            showAllChip: true,
            allChipLabel: "Tất cả",
            categoryChipStyle: "pill",
            ...currentChips,
            ...patchChips,
          }
        : undefined,
    card:
      currentLayout.card || layoutPatch.card
        ? {
            imageSize: "md",
            borderRadius: 12,
            showPromotionBadge: true,
            showOriginalPriceStrikethrough: true,
            priceColorMode: "theme",
            showStockLine: true,
            ...currentCard,
            ...patchCard,
            addToCartButton: {
              show: true,
              label: "+ Thêm vào giỏ",
              shape: "pill",
              ...currentAddToCart,
              ...patchAddToCart,
            },
          }
        : undefined,
    dataMapping: {
      ...currentDataMapping,
      ...patchDataMapping,
      menu:
        currentLayout.dataMapping?.menu || layoutPatch.dataMapping?.menu
          ? {
              source:
                layoutPatch.dataMapping?.menu?.source ??
                currentLayout.dataMapping?.menu?.source ??
                "API.RESTAURANT.GET_MENU(restaurantId)",
              categoryField:
                layoutPatch.dataMapping?.menu?.categoryField ??
                currentLayout.dataMapping?.menu?.categoryField ??
                "categoryName",
              dishesField:
                layoutPatch.dataMapping?.menu?.dishesField ??
                currentLayout.dataMapping?.menu?.dishesField ??
                "dishes",
              dishDisplayFields:
                layoutPatch.dataMapping?.menu?.dishDisplayFields ??
                currentLayout.dataMapping?.menu?.dishDisplayFields ??
                [],
              promotionFields:
                layoutPatch.dataMapping?.menu?.promotionFields ??
                currentLayout.dataMapping?.menu?.promotionFields ??
                [],
              ...currentMenuMapping,
              ...patchMenuMapping,
            }
          : undefined,
      categories:
        currentLayout.dataMapping?.categories ||
        layoutPatch.dataMapping?.categories
          ? {
              source:
                layoutPatch.dataMapping?.categories?.source ??
                currentLayout.dataMapping?.categories?.source ??
                "",
              displayField:
                layoutPatch.dataMapping?.categories?.displayField ??
                currentLayout.dataMapping?.categories?.displayField ??
                "categoryName",
              ...currentCategoriesMapping,
              ...patchCategoriesMapping,
            }
          : undefined,
      dishes:
        currentLayout.dataMapping?.dishes || layoutPatch.dataMapping?.dishes
          ? {
              source:
                layoutPatch.dataMapping?.dishes?.source ??
                currentLayout.dataMapping?.dishes?.source ??
                "",
              groupBy:
                layoutPatch.dataMapping?.dishes?.groupBy ??
                currentLayout.dataMapping?.dishes?.groupBy ??
                "categoryName",
              displayFields:
                layoutPatch.dataMapping?.dishes?.displayFields ??
                currentLayout.dataMapping?.dishes?.displayFields ??
                ["dishName", "price"],
              ...currentDishesMapping,
              ...patchDishesMapping,
            }
          : undefined,
    },
  };
};

export default function TemplateManagementPage() {
  const [step, setStep] = useState<"list" | "create">("list");

  // ─── List / Edit states ───────────────────────────────────────────────
  const [templates, setTemplates] = useState<MenuTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] =
    useState<MenuTemplate | null>(null);
  const [selectedLayout, setSelectedLayout] =
    useState<TemplateLayoutConfig | null>(null);
  const [loadingDetailId, setLoadingDetailId] = useState<number | null>(null);
  const [updating, setUpdating] = useState(false);

  const [editThemeColor, setEditThemeColor] = useState("#3B82F6");
  const [editFontFamily, setEditFontFamily] = useState("Arial");
  const [editIsActive, setEditIsActive] = useState<boolean>(true);
  const [editBackgroundMode, setEditBackgroundMode] =
    useState<BackgroundMode>("color");
  const [editBackgroundColor, setEditBackgroundColor] = useState("#FFFFFF");
  const [editBackgroundImageUrl, setEditBackgroundImageUrl] = useState("");

  // ─── Create form states ───────────────────────────────────────────────
  const [submitting, setSubmitting] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [themeColor, setThemeColor] = useState("#3B82F6");
  const [fontFamily, setFontFamily] = useState("Arial");
  const [backgroundMode, setBackgroundMode] = useState<"color" | "image">(
    "color"
  );
  const [backgroundColor, setBackgroundColor] = useState("#FFFFFF");
  const [backgroundImageUrl, setBackgroundImageUrl] = useState("");
  const [backgroundImageFile, setBackgroundImageFile] = useState<File | null>(
    null
  );
  const [backgroundImagePreviewUrl, setBackgroundImagePreviewUrl] =
    useState("");
  const [sections, setSections] = useState<MenuSection[]>(initialSections);
  const [holidayName, setHolidayName] = useState("");
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiLayoutPatch, setAiLayoutPatch] =
    useState<Partial<TemplateLayoutConfig> | null>(null);

  useEffect(() => {
    void loadTemplates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // ─── Load templates ───────────────────────────────────────────────────
  const loadTemplates = async () => {
    try {
      setLoading(true);
      const res = await getAllMenuTemplates();
      if (res.isSuccess && res.data) {
        setTemplates(res.data);
        if (!selectedTemplate && res.data.length > 0) {
          void handleSelectTemplate(res.data[0].id);
        }
      } else {
        toast.error(res.message || "Failed to load templates");
      }
    } catch (e) {
      console.error(e);
      toast.error("Error loading templates");
    } finally {
      setLoading(false);
    }
  };

  const parseLayout = (json: string): TemplateLayoutConfig | null => {
    try {
      return JSON.parse(json) as TemplateLayoutConfig;
    } catch {
      return null;
    }
  };

  const withApiBackground = (
    layout: TemplateLayoutConfig | null,
    bgImageUrl?: string
  ): TemplateLayoutConfig | null => {
    if (!layout) return null;
    const canvas = layout.canvas;
    return {
      ...layout,
      canvas: {
        width: canvas?.width ?? 1000,
        height: canvas?.height ?? 800,
        backgroundMode: canvas?.backgroundMode,
        backgroundColor: canvas?.backgroundColor ?? "#FFFFFF",
        backgroundImageUrl:
          canvas?.backgroundImageUrl || bgImageUrl || undefined,
      },
    };
  };

  const handleSelectTemplate = async (id: number) => {
    try {
      setLoadingDetailId(id);
      const res = await getMenuTemplateById(id);
      if (!res.isSuccess || !res.data) {
        toast.error(res.message || "Failed to load template detail");
        return;
      }
      const detail = res.data;
      setSelectedTemplate(detail);

      const rawLayout = parseLayout(detail.layoutConfigJson);
      const layout = withApiBackground(rawLayout, detail.backgroundImageUrl);
      setSelectedLayout(layout);

      const canvas = layout?.canvas;
      setEditThemeColor(detail.themeColor || "#3B82F6");
      setEditFontFamily(detail.fontFamily || "Arial");
      setEditIsActive(detail.isActive ?? true);
      setEditBackgroundMode(
        canvas?.backgroundMode === "image" ? "image" : "color"
      );
      setEditBackgroundColor(canvas?.backgroundColor || "#FFFFFF");
      setEditBackgroundImageUrl(
        canvas?.backgroundImageUrl || detail.backgroundImageUrl || ""
      );
    } catch (e) {
      console.error(e);
      toast.error("Error loading template detail");
    } finally {
      setLoadingDetailId(null);
    }
  };

  // ─── Update (save) template ───────────────────────────────────────────
  const handleSave = async () => {
    if (!selectedTemplate || !selectedLayout) return;
    try {
      setUpdating(true);

      // Build đầy đủ layout để BE lưu xuống LayoutConfigJson
      const updatedLayout: TemplateLayoutConfig = {
        ...selectedLayout,
        version: selectedLayout.version ?? 1,
        canvas: {
          width: selectedLayout.canvas?.width ?? 1000,
          height: selectedLayout.canvas?.height ?? 800,
          backgroundMode: editBackgroundMode,
          backgroundColor: editBackgroundColor || "#FFFFFF",
          backgroundImageUrl:
            editBackgroundMode === "image" && editBackgroundImageUrl.trim()
              ? editBackgroundImageUrl.trim()
              : undefined,
        },
        header: {
          showBackButton: true,
          showSearch: true,
          searchPlaceholder: "Tìm món ăn, đồ uống...",
          showCart: true,
        },
        chips: {
          showAllChip: true,
          allChipLabel: "Tất cả",
          categoryChipStyle: "pill",
        },
        card: {
          imageSize: "md",
          borderRadius: 12,
          showPromotionBadge: true,
          showOriginalPriceStrikethrough: true,
          priceColorMode: "theme",
          showStockLine: true,
          addToCartButton: {
            show: true,
            label: "+ Thêm vào giỏ",
            shape: "pill",
          },
        },
      };

      const payload: MenuTemplate = {
        ...selectedTemplate,
        themeColor: editThemeColor,
        fontFamily: editFontFamily,
        backgroundImageUrl:
          editBackgroundMode === "image" && editBackgroundImageUrl.trim()
            ? editBackgroundImageUrl.trim()
            : undefined,
        layoutConfigJson: JSON.stringify(updatedLayout),
      };

      const res = await apiClient.put<ApiResponse<MenuTemplate>>(
        API.MENU_TEMPLATE.UPDATE(selectedTemplate.id),
        payload
      );
      const result = res.data;
      if (!result.isSuccess || !result.data) {
        toast.error(result.message || "Không thể cập nhật template");
        return;
      }

      const updated = result.data;
      setSelectedTemplate(updated);
      setSelectedLayout(parseLayout(updated.layoutConfigJson));
      setTemplates((prev) =>
        prev.map((t) => (t.id === updated.id ? updated : t))
      );
      toast.success("Đã lưu template");
    } catch (e) {
      console.error(e);
      toast.error("Có lỗi xảy ra khi cập nhật template");
    } finally {
      setUpdating(false);
    }
  };

  const selectedCanvas = useMemo(
    () => selectedLayout?.canvas,
    [selectedLayout]
  );

  // ─── Create form helpers ──────────────────────────────────────────────
  const resetForm = () => {
    setTemplateName("");
    setThemeColor("#3B82F6");
    setFontFamily("Arial");
    setBackgroundMode("color");
    setBackgroundColor("#FFFFFF");
    setBackgroundImageUrl("");
    setBackgroundImageFile(null);
    setSections(initialSections);
    setHolidayName("");
    setAiLayoutPatch(null);
  };

  const handleGenerateTemplateByAi = async () => {
    if (!holidayName.trim()) {
      toast.error("Vui lòng chọn hoặc nhập tên ngày lễ");
      return;
    }
    try {
      setIsGeneratingAi(true);
      const aiRes = await generateHolidayTemplateAi(holidayName.trim());
      if (!aiRes.isSuccess || !aiRes.data) {
        toast.error(aiRes.message || "AI không thể tạo giao diện lúc này");
        return;
      }

      const aiData = aiRes.data;
      let parsedPatch: Partial<TemplateLayoutConfig> | null = null;
      if (aiData.layoutConfigJson?.trim()) {
        try {
          parsedPatch = JSON.parse(
            aiData.layoutConfigJson
          ) as Partial<TemplateLayoutConfig>;
        } catch {
          toast.error("layoutConfigJson từ AI không hợp lệ");
        }
      }

      setAiLayoutPatch(parsedPatch);
      setTemplateName(aiData.templateName || holidayName.trim());
      setThemeColor(aiData.themeColor || "#3B82F6");
      setFontFamily(aiData.fontFamily || "Arial");

      if (aiData.backgroundImageUrl?.trim()) {
        setBackgroundMode("image");
        setBackgroundImageUrl(aiData.backgroundImageUrl.trim());
        setBackgroundColor(aiData.backgroundColor || "#FFFFFF");
      } else {
        setBackgroundMode("color");
        setBackgroundColor(aiData.backgroundColor || "#FFFFFF");
        setBackgroundImageUrl("");
      }

      toast.success("AI đã tạo giao diện mẫu");
    } catch (error) {
      console.error("Error generating AI template:", error);
      toast.error("Có lỗi xảy ra khi tạo template AI");
    } finally {
      setIsGeneratingAi(false);
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
      return prev.filter((s) => s.id !== sectionId);
    });
  };

  const updateCategoryName = (sectionId: string, name: string) => {
    setSections((prev) =>
      prev.map((s) => (s.id === sectionId ? { ...s, name } : s))
    );
  };

  const addDish = (sectionId: string) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? { ...s, dishes: [...s.dishes, `Dish ${s.dishes.length + 1}`] }
          : s
      )
    );
  };

  const removeDish = (sectionId: string, dishIndex: number) => {
    setSections((prev) =>
      prev.map((s) => {
        if (s.id !== sectionId) return s;
        if (s.dishes.length <= 1) {
          toast.error("Mỗi category cần ít nhất 1 dish");
          return s;
        }
        return { ...s, dishes: s.dishes.filter((_, i) => i !== dishIndex) };
      })
    );
  };

  const updateDishName = (
    sectionId: string,
    dishIndex: number,
    value: string
  ) => {
    setSections((prev) =>
      prev.map((s) => {
        if (s.id !== sectionId) return s;
        return {
          ...s,
          dishes: s.dishes.map((d, i) => (i === dishIndex ? value : d)),
        };
      })
    );
  };

  // ─── Create template submit ───────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!templateName.trim()) {
      toast.error("Template name is required");
      return;
    }
    if (sections.some((s) => !s.name.trim())) {
      toast.error("Category name không được để trống");
      return;
    }
    if (sections.some((s) => s.dishes.some((d) => !d.trim()))) {
      toast.error("Dish name không được để trống");
      return;
    }

    try {
      setSubmitting(true);

      const baseLayoutConfig: TemplateLayoutConfig = {
        version: 1,
        canvas: {
          width: 1000,
          height: 800,
          backgroundMode,
          backgroundColor,
          backgroundImageUrl:
            backgroundMode === "image"
              ? backgroundImageUrl.trim() || undefined
              : undefined,
        },
        slots: FIXED_SLOTS,
        dataMapping: {
          menu: {
            source: "API.RESTAURANT.GET_MENU(restaurantId)",
            categoryField: "categoryName",
            dishesField: "dishes",
            dishDisplayFields: [
              "dishName",
              "price",
              "discountedPrice",
              "description",
              "promotionLabel",
              "hasPromotion",
            ],
            promotionFields: [
              "promotionName",
              "promotionLabel",
              "expiredAt",
              "promoType",
              "hasPromotion",
              "discountedPrice",
            ],
          },
        },
      };
      const mergedLayoutConfig = mergeLayoutConfig(baseLayoutConfig, aiLayoutPatch);
      const layoutConfigJson = JSON.stringify(mergedLayoutConfig);

      const formData = new FormData();
      formData.append("TemplateName", templateName);
      formData.append("ThemeColor", themeColor);
      formData.append("FontFamily", fontFamily);
      formData.append("LayoutConfigJson", layoutConfigJson);
      if (backgroundMode === "image" && backgroundImageFile) {
        formData.append("BackgroundImageUrl", backgroundImageFile);
      }

      const response = await createMenuTemplate(formData);
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

  // ─────────────────────────────────────────────────────────────────────
  // CREATE VIEW
  // ─────────────────────────────────────────────────────────────────────
  if (step === "create") {
    const previewMenu: MenuTemplateCategory[] = sections.map(
      (section, sectionIndex) => ({
        categoryId: sectionIndex + 1,
        categoryName: section.name || "(Chưa đặt tên)",
        dishes: section.dishes.map((dish, dishIndex) => ({
          dishId: sectionIndex * 100 + dishIndex + 1,
          dishName: dish || "(Dish trống)",
          description: "Món mẫu để xem bố cục template.",
          price: 35000,
          discountedPrice: 29000,
          hasPromotion: dishIndex % 2 === 0,
          promotionLabel: "-15%",
          isSoldOut: false,
        })),
      })
    );

    const previewCanvas: CanvasConfig = {
      width: 1000,
      height: 800,
      backgroundMode,
      backgroundColor,
      backgroundImageUrl:
        backgroundMode === "image"
          ? backgroundImagePreviewUrl || backgroundImageUrl.trim() || undefined
          : undefined,
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
          <h1 className="text-2xl font-bold text-slate-900">
            Create Menu Template
          </h1>
          <p className="mt-2 text-slate-600">
            Thiết kế layout và style cho menu. Tenant sẽ áp dụng template này
            và đổ data thật của họ vào.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="mb-3 text-lg font-semibold text-slate-900">
              Tạo template bằng AI
            </h2>
            <p className="mb-3 text-sm text-slate-600">
              Chọn mẫu nhanh hoặc nhập ngày lễ hoặc nội dung mong muốn, AI sẽ tạo ra layout cho template.
            </p>
            <div className="mb-3 flex flex-wrap gap-2">
              {["Giáng Sinh", "8/3", "Khai trương", "Tết", "Halloween"].map(
                (preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setHolidayName(preset)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                      holidayName === preset
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {preset}
                  </button>
                )
              )}
            </div>
            <div className="flex flex-col gap-2 md:flex-row">
              <input
                type="text"
                value={holidayName}
                onChange={(e) => setHolidayName(e.target.value)}
                placeholder="Ví dụ: Giáng Sinh"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={handleGenerateTemplateByAi}
                disabled={isGeneratingAi}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isGeneratingAi ? "AI đang thiết kế..." : "Tạo template AI"}
              </button>
            </div>
          </div>

          {/* Template Settings */}
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">
              Template Settings
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Template Name
                </label>
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
                <label className="block text-sm font-medium text-slate-700">
                  Font Family
                </label>
                <select
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Inter">Inter</option>
                  <option value="Arial">Arial</option>
                  <option value="Helvetica">Helvetica</option>
                  <option value="Georgia">Georgia</option>
                  <option value="System">System</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Theme Color
                </label>
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
                <label className="block text-sm font-medium text-slate-700">
                  Background Mode
                </label>
                <select
                  value={backgroundMode}
                  onChange={(e) =>
                    setBackgroundMode(e.target.value as "color" | "image")
                  }
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="color">Color</option>
                  <option value="image">Image</option>
                </select>
              </div>

              {backgroundMode === "color" ? (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Background Color
                  </label>
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
                <div className="space-y-3 md:col-span-2">
                  <div>
                    <label className="block text-sm font-medium text-slate-700">
                      Upload ảnh nền
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setBackgroundImageFile(e.target.files?.[0] ?? null)
                      }
                      className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    />
                    <p className="mt-1 text-xs text-slate-500">
                      Ảnh sẽ được upload qua field{" "}
                      <code className="rounded bg-slate-100 px-1">
                        BackgroundImageUrl
                      </code>
                      .
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">
                      Hoặc nhập URL ảnh (preview local)
                    </label>
                    <input
                      type="url"
                      value={backgroundImageUrl}
                      onChange={(e) => setBackgroundImageUrl(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://example.com/background.jpg"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Menu Structure (preview only) */}
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="mb-3 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">
              <p className="font-semibold">
                ℹ️ Phần này CHỈ dùng để preview UI
              </p>
              
            </div>

            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">
                Cấu trúc menu (Preview only)
              </h2>
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
                <div
                  key={section.id}
                  className="rounded-lg border border-slate-200 p-4"
                >
                  <div className="mb-3 flex items-center gap-2">
                    <input
                      type="text"
                      value={section.name}
                      onChange={(e) =>
                        updateCategoryName(section.id, e.target.value)
                      }
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
                      − Category
                    </button>
                  </div>

                  <div className="space-y-2">
                    {section.dishes.map((dish, dishIndex) => (
                      <div
                        key={`${section.id}-${dishIndex}`}
                        className="flex items-center gap-2"
                      >
                        <input
                          type="text"
                          value={dish}
                          onChange={(e) =>
                            updateDishName(
                              section.id,
                              dishIndex,
                              e.target.value
                            )
                          }
                          className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Tên dish"
                        />
                        <button
                          type="button"
                          onClick={() => removeDish(section.id, dishIndex)}
                          className="rounded-lg bg-rose-500 px-3 py-2 text-sm text-white hover:bg-rose-600"
                        >
                          − Dish
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Create form preview */}
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">
              Menu Preview
            </h2>
            <div className="flex items-stretch justify-center rounded-2xl border border-slate-300 bg-slate-50 p-6">
              <div className="relative flex h-[780px] w-[420px] items-center justify-center rounded-[40px] border border-slate-200 bg-slate-900/5 px-4 py-6">
                <div className="relative h-full w-full overflow-hidden rounded-[32px] border border-slate-300 bg-slate-100 shadow-lg">
                  <div className="absolute inset-x-1 top-2 mx-auto h-1.5 w-24 rounded-full bg-slate-300" />
                  <div className="mt-5 h-[700px] w-full overflow-hidden">
                    <MenuTemplatePreview
                      categories={previewMenu}
                      canvas={previewCanvas}
                      themeColor={themeColor}
                      fontFamily={fontFamily}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Submit */}
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

  // ─────────────────────────────────────────────────────────────────────
  // LIST VIEW — 3-column layout
  // ─────────────────────────────────────────────────────────────────────
  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Template Management
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Chọn template, xem preview mobile và chỉnh màu sắc / font /
            background.
          </p>
        </div>
        <button
          onClick={() => setStep("create")}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          + Create Template
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8 text-slate-500">
          Loading templates...
        </div>
      ) : templates.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 py-8 text-center">
          <p className="text-slate-600">Chưa có template nào.</p>
          <p className="mt-1 text-sm text-slate-500">
            Tạo template đầu tiên để bắt đầu.
          </p>
        </div>
      ) : (
        <div className="mt-2 grid gap-6 lg:grid-cols-[260px_minmax(0,2.2fr)_minmax(0,1.1fr)]">
          {/* ─── Sidebar: template list ─────────────────────────────── */}
          <aside className="rounded-xl border border-slate-200 bg-white p-3">
            <h2 className="mb-3 text-sm font-semibold text-slate-900">
              Menu Template
            </h2>
            <div className="space-y-2">
              {templates.map((tpl) => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => void handleSelectTemplate(tpl.id)}
                  disabled={loadingDetailId === tpl.id}
                  className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition ${
                    selectedTemplate?.id === tpl.id
                      ? "border-emerald-500 bg-emerald-50 text-emerald-800"
                      : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
                  }`}
                >
                  <div
                    className="mb-1 h-6 w-full rounded border border-slate-200"
                    style={{ backgroundColor: tpl.themeColor }}
                  />
                  <p className="truncate font-medium">{tpl.templateName}</p>
                  <p className="text-xs text-slate-500">{tpl.fontFamily}</p>
                </button>
              ))}
            </div>
          </aside>

          {/* ─── Center: mobile preview ──────────────────────────────── */}
          <main className="flex items-stretch justify-center rounded-2xl border border-slate-200 bg-white p-6">
            {selectedTemplate && selectedLayout ? (
              <div className="flex w-full items-center justify-center">
                <div className="relative flex h-[780px] w-[420px] items-center justify-center rounded-[40px] border border-slate-200 bg-slate-900/5 px-4 py-6">
                  <div className="relative h-full w-full overflow-hidden rounded-[32px] border border-slate-300 bg-slate-100 shadow-lg">
                    <div className="absolute inset-x-1 top-2 mx-auto h-1.5 w-24 rounded-full bg-slate-300" />
                    <div className="mt-5 h-[700px] w-full overflow-hidden">
                      <MenuTemplatePreview
                        categories={SAMPLE_MENU}
                        canvas={selectedCanvas as CanvasConfig | undefined}
                        themeColor={editThemeColor}
                        fontFamily={editFontFamily}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-1 items-center justify-center text-sm text-slate-400">
                Chọn một template ở sidebar để xem preview.
              </div>
            )}
          </main>

          {/* ─── Right: settings panel ───────────────────────────────── */}
          <section className="rounded-xl border border-slate-200 bg-white p-4">
            <h2 className="mb-3 text-sm font-semibold text-slate-900">
              Chỉnh sửa giao diện
            </h2>

            {selectedTemplate ? (
              <div className="space-y-4">
                {/* Template name (read-only) */}
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-500">
                    Tên giao diện
                  </label>
                  <input
                    type="text"
                    value={selectedTemplate.templateName}
                    disabled
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                  />
                </div>

                {/* Theme color */}
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-500">
                    Màu chủ đạo
                  </label>
                  <div className="mb-2 grid grid-cols-5 gap-2">
                    {[
                      "#22c55e",
                      "#0ea5e9",
                      "#f97316",
                      "#ef4444",
                      "#6366f1",
                    ].map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setEditThemeColor(color)}
                        className={`h-9 rounded-lg border ${
                          editThemeColor === color
                            ? "border-slate-900 ring-1 ring-slate-900/40"
                            : "border-slate-200"
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={editThemeColor}
                      onChange={(e) => setEditThemeColor(e.target.value)}
                      className="h-9 w-10 cursor-pointer rounded border border-slate-200 bg-white"
                    />
                    <input
                      type="text"
                      value={editThemeColor}
                      onChange={(e) => setEditThemeColor(e.target.value)}
                      className="flex-1 rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
                    />
                  </div>
                </div>

                {/* Font family */}
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-500">
                    Kiểu chữ
                  </label>
                  <select
                    value={editFontFamily}
                    onChange={(e) => setEditFontFamily(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  >
                    <option value="Inter">Inter</option>
                    <option value="Arial">Arial</option>
                    <option value="Helvetica">Helvetica</option>
                    <option value="Georgia">Georgia</option>
                    <option value="System">System</option>
                  </select>
                </div>

                {/* Active toggle */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">
                    Hiển thị
                  </span>
                  <button
                    type="button"
                    onClick={() => setEditIsActive((v) => !v)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full border transition ${
                      editIsActive
                        ? "border-emerald-500 bg-emerald-500"
                        : "border-slate-300 bg-slate-200"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                        editIsActive ? "translate-x-5" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                {/* Background settings */}
                {selectedLayout && (
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <h3 className="mb-2 text-xs font-semibold text-slate-700">
                      Background
                    </h3>
                    <div className="space-y-3 text-xs">
                      <div>
                        <p className="mb-1 font-medium text-slate-600">
                          Background mode
                        </p>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setEditBackgroundMode("color")}
                            className={`flex-1 rounded-md border px-2 py-1.5 text-xs ${
                              editBackgroundMode === "color"
                                ? "border-blue-500 bg-blue-50 text-blue-700"
                                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            Màu
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditBackgroundMode("image")}
                            className={`flex-1 rounded-md border px-2 py-1.5 text-xs ${
                              editBackgroundMode === "image"
                                ? "border-blue-500 bg-blue-50 text-blue-700"
                                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            Ảnh
                          </button>
                        </div>
                      </div>

                      <div>
                        <p className="mb-1 font-medium text-slate-600">
                          Màu background
                        </p>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={editBackgroundColor}
                            onChange={(e) =>
                              setEditBackgroundColor(
                                e.target.value || "#FFFFFF"
                              )
                            }
                            className="h-8 w-8 cursor-pointer rounded border border-slate-200 bg-white"
                          />
                          <input
                            type="text"
                            value={editBackgroundColor}
                            onChange={(e) =>
                              setEditBackgroundColor(
                                e.target.value.trim() || "#FFFFFF"
                              )
                            }
                            className="flex-1 rounded-md border border-slate-200 px-2 py-1.5 text-xs text-slate-900"
                          />
                        </div>
                      </div>

                      <div>
                        <p className="mb-1 font-medium text-slate-600">
                          Ảnh nền (URL)
                        </p>
                        <input
                          type="text"
                          value={editBackgroundImageUrl}
                          onChange={(e) =>
                            setEditBackgroundImageUrl(e.target.value)
                          }
                          disabled={editBackgroundMode !== "image"}
                          placeholder="https://example.com/bg.jpg"
                          className="w-full rounded-md border border-slate-200 px-2 py-1.5 text-xs text-slate-900 disabled:bg-slate-50"
                        />
                        {editBackgroundMode === "image" &&
                          editBackgroundImageUrl.trim() && (
                            <div className="mt-2 rounded border border-slate-200 bg-slate-50 p-1.5">
                              <div className="relative h-16 w-full overflow-hidden rounded">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={editBackgroundImageUrl}
                                  alt="Background preview"
                                  className="h-full w-full object-cover"
                                />
                              </div>
                            </div>
                          )}
                      </div>
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={updating}
                  className="mt-2 w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                >
                  {updating ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </div>
            ) : (
              <p className="text-sm text-slate-400">
                Chọn một template ở sidebar để chỉnh sửa.
              </p>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
