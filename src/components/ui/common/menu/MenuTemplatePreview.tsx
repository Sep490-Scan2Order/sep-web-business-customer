"use client";

import { CanvasConfig, MenuTemplateCategory } from "@/src/types/menuTemplate";

interface MenuTemplatePreviewProps {
  categories: MenuTemplateCategory[];
  canvas?: CanvasConfig;
  themeColor?: string;
  fontFamily?: string;
}

export function MenuTemplatePreview({
  categories,
  canvas,
  themeColor = "#3B82F6",
  fontFamily = "Arial",
}: MenuTemplatePreviewProps) {
  const bgStyle: React.CSSProperties = {
    fontFamily,
    backgroundColor:
      canvas?.backgroundMode === "image"
        ? undefined
        : (canvas?.backgroundColor ?? "#FFFFFF"),
    backgroundImage:
      canvas?.backgroundMode === "image" && canvas.backgroundImageUrl
        ? `url(${canvas.backgroundImageUrl})`
        : undefined,
    backgroundSize: "cover",
    backgroundPosition: "center",
  };

  return (
    <div className="h-full w-full overflow-y-auto" style={bgStyle}>
      {/* Header */}
      <div
        className="px-4 py-3 text-white"
        style={{ backgroundColor: themeColor }}
      >
        <h1 className="text-lg font-bold">Menu Nhà Hàng</h1>
        <p className="text-xs opacity-80">Xem thực đơn hôm nay</p>
      </div>

      {/* Categories */}
      <div className="space-y-4 p-3">
        {categories.map((cat) => (
          <div key={cat.categoryId}>
            <h2
              className="mb-2 border-b pb-1 text-sm font-bold"
              style={{
                color: themeColor,
                borderColor: themeColor + "40",
              }}
            >
              {cat.categoryName}
            </h2>
            <div className="space-y-2">
              {cat.dishes.map((dish) => (
                <div
                  key={dish.dishId}
                  className="flex items-start gap-2 rounded-lg border border-slate-200 bg-white/80 p-2 backdrop-blur-sm"
                >
                  {dish.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={dish.imageUrl}
                      alt={dish.dishName}
                      className="h-12 w-12 flex-shrink-0 rounded-md object-cover"
                    />
                  ) : (
                    <div
                      className="h-12 w-12 flex-shrink-0 rounded-md"
                      style={{ backgroundColor: themeColor + "20" }}
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1">
                      <p className="truncate text-xs font-semibold text-slate-800">
                        {dish.dishName}
                      </p>
                      {dish.hasPromotion && dish.promotionLabel && (
                        <span
                          className="rounded px-1 py-0.5 text-[10px] font-bold text-white"
                          style={{ backgroundColor: themeColor }}
                        >
                          {dish.promotionLabel}
                        </span>
                      )}
                    </div>
                    {dish.description && (
                      <p className="line-clamp-1 text-[10px] text-slate-500">
                        {dish.description}
                      </p>
                    )}
                    <div className="mt-1 flex items-center gap-1">
                      {dish.hasPromotion && dish.discountedPrice ? (
                        <>
                          <span
                            className="text-xs font-bold"
                            style={{ color: themeColor }}
                          >
                            {dish.discountedPrice.toLocaleString("vi-VN")}₫
                          </span>
                          <span className="text-[10px] text-slate-400 line-through">
                            {dish.price.toLocaleString("vi-VN")}₫
                          </span>
                        </>
                      ) : (
                        <span
                          className="text-xs font-bold"
                          style={{ color: themeColor }}
                        >
                          {dish.price.toLocaleString("vi-VN")}₫
                        </span>
                      )}
                      {dish.isSoldOut && (
                        <span className="rounded bg-slate-200 px-1 py-0.5 text-[10px] text-slate-500">
                          Hết
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
