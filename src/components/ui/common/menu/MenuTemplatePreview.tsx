"use client";

import { CanvasConfig, MenuTemplateCategory } from "@/src/types/menuTemplate";

interface MenuTemplatePreviewProps {
  categories: MenuTemplateCategory[];
  canvas?: CanvasConfig;
  themeColor?: string;
  fontFamily?: string;
}

const IconArrowLeft = () => (
  <svg
    viewBox="0 0 24 24"
    className="h-4 w-4"
    aria-hidden="true"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
  >
    <path d="M15 6l-6 6 6 6" />
  </svg>
);

const IconCart = () => (
  <svg
    viewBox="0 0 24 24"
    className="h-5 w-5"
    aria-hidden="true"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
  >
    <circle cx="9" cy="20" r="1.5" />
    <circle cx="18" cy="20" r="1.5" />
    <path d="M3 4h2l2 13h11l2-9H8" />
  </svg>
);

const IconSearch = () => (
  <svg
    viewBox="0 0 24 24"
    className="h-3.5 w-3.5 text-slate-400"
    aria-hidden="true"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
  >
    <circle cx="11" cy="11" r="6" />
    <path d="M16 16l3 3" />
  </svg>
);

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
      {/* Mobile header: back, search, cart */}
      <div className="sticky top-0 z-10 bg-white/90 px-3 pb-2 pt-3 backdrop-blur">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm"
          >
            <IconArrowLeft />
          </button>

          <div className="flex-1">
            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-600">
              <IconSearch />
              <input
                type="search"
                placeholder="Tìm món ăn, đồ uống..."
                className="w-full bg-transparent text-xs text-slate-700 outline-none placeholder:text-slate-400"
                readOnly
              />
            </div>
          </div>

          <button
            type="button"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-transparent text-white shadow-sm"
            style={{ backgroundColor: themeColor }}
          >
            <IconCart />
          </button>
        </div>
        {/* Category chips preview */}
        {categories.length > 0 && (
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            <button
              type="button"
              className="whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium text-white"
              style={{ backgroundColor: themeColor }}
            >
              Tất cả
            </button>
            {categories.map((cat) => (
              <button
                key={cat.categoryId}
                type="button"
                className="whitespace-nowrap rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600"
              >
                {cat.categoryName}
              </button>
            ))}
          </div>
        )}
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
                  className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white/90 p-2 shadow-sm backdrop-blur-sm"
                >
                  {dish.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={dish.imageUrl}
                      alt={dish.dishName}
                      className="h-18 w-18 flex-shrink-0 rounded-lg object-cover"
                    />
                  ) : (
                    <div
                      className="h-18 w-18 flex-shrink-0 rounded-lg"
                      style={{ backgroundColor: themeColor + "20" }}
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-1.5">
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
                      <div className="mt-1 flex items-center justify-between gap-2">
                        {typeof dish.dishAvailabilityStock === "number" ? (
                          <p className="text-[10px] text-slate-500">
                            SL: {dish.dishAvailabilityStock}
                          </p>
                        ) : (
                          <span />
                        )}
                        <button
                          type="button"
                          className="inline-flex items-center justify-center rounded-full px-4 py-1.5 text-[10px] font-semibold text-white shadow-sm"
                          style={{ backgroundColor: themeColor }}
                        >
                          + Thêm vào giỏ
                        </button>
                      </div>
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
