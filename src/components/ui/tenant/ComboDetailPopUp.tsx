import { DishesDto } from "@/src/types/type";
import React from "react";
import { Loader2, Package2, X } from "lucide-react";

interface ComboDetailPopUpProps {
  combo: DishesDto;
  comboItems: DishesDto[];
  onClose: () => void;
  isLoading?: boolean;
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};

export default function ComboDetailPopUp({
  combo,
  comboItems,
  onClose,
  isLoading = false,
}: ComboDetailPopUpProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl rounded-xl border border-slate-200 bg-white shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Chi tiết combo</h2>
            <p className="text-sm text-slate-500">{combo.dishName}</p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Loại</div>
              <div className="mt-1 text-sm font-medium text-slate-800">Combo</div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Giá combo</div>
              <div className="mt-1 text-sm font-medium text-slate-800">{formatPrice(combo.price)}</div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800">
              <Package2 className="h-4 w-4" />
              Món trong combo
            </div>

            {isLoading ? (
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Đang tải chi tiết combo...
              </div>
            ) : comboItems.length > 0 ? (
              <div className="space-y-3">
                {comboItems.map((item) => (
                  <div
                    key={`${combo.id}-${item.id}`}
                    className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-slate-800">{item.dishName}</div>
                      {item.description && (
                        <div className="truncate text-xs text-slate-500">{item.description}</div>
                      )}
                        <div className="mt-1 text-[11px] text-slate-500">(Món ăn)</div>
                    </div>
                    <div className="text-sm font-medium text-slate-700">{formatPrice(item.price)}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">Combo này chưa có món thành phần hoặc không tải được dữ liệu.</p>
            )}
          </div>
        </div>

        <div className="flex justify-end border-t border-slate-200 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
