import { PlanApiItem } from "@/src/types/type";
import React, { useState } from "react";
import { Check, X } from "lucide-react";

interface PlanProps {
  onClose: () => void;
  onSubmit: (planId: number) => void;
  planData: PlanApiItem[] | null;
  planId?: number | null;
  mode?: "UPGRADE" | "DOWNGRADE" | "CHANGE";
}

export default function PlanPopUpInfo({
  onClose,
  onSubmit,
  planData,
  planId,
  mode = "CHANGE",
}: PlanProps) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const currentPlan = planData?.find((plan) => plan.id === planId) || null;
  const selectedPlan = planData?.find((plan) => plan.id === selectedId) || null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl rounded-xl border border-slate-200 bg-white shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Chọn gói dịch vụ
            </h2>
            <p className="text-sm text-slate-500">
              Vui lòng chọn gói phù hợp cho nhà hàng của bạn
            </p>
          </div>

          <button
            onClick={onClose}
            className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[65vh] overflow-y-auto p-6">
          {planData && planData.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {planData.map((plan) => {
                const isSelected = selectedId === plan.id;
                const isCurrentPlan = planId === plan.id;
                const isLowerThanCurrent =
                  currentPlan !== null && plan.level < currentPlan.level;
                const isHigherThanCurrent =
                  currentPlan !== null && plan.level > currentPlan.level;
                const isDisabled =
                  isCurrentPlan ||
                  (mode === "UPGRADE" && isLowerThanCurrent) ||
                  (mode === "DOWNGRADE" && isHigherThanCurrent);

                return (
                  <button
                    key={plan.id}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => {
                      if (!isDisabled) {
                        setSelectedId(plan.id);
                      }
                    }}
                    className={`text-left rounded-xl border p-4 transition-colors ${
                      isDisabled
                        ? "cursor-not-allowed border-slate-200 bg-slate-100 opacity-60"
                        : isSelected
                          ? "border-slate-900 bg-white ring-1 ring-slate-900/10"
                          : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white"
                    }`}
                  >
                    <div className="cursor-pointer mb-3 flex items-start justify-between gap-3">
                      <div>
                        <p className="text-base font-semibold text-slate-900">
                          {plan.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          Cấp độ: {plan.level}
                        </p>
                        {isCurrentPlan && (
                          <p className="mt-1 text-xs font-medium text-slate-600">
                            Gói hiện tại
                          </p>
                        )}
                        {!isCurrentPlan &&
                          mode === "UPGRADE" &&
                          isLowerThanCurrent && (
                            <p className="mt-1 text-xs font-medium text-slate-600">
                              Không thể hạ cấp
                            </p>
                          )}
                        {!isCurrentPlan &&
                          mode === "DOWNGRADE" &&
                          isHigherThanCurrent && (
                            <p className="mt-1 text-xs font-medium text-slate-600">
                              Không thể nâng cấp
                            </p>
                          )}
                      </div>
                      {isSelected && (
                        <span className="rounded-full bg-slate-900 p-1 text-white">
                          <Check className="h-3.5 w-3.5" />
                        </span>
                      )}
                    </div>

                    <div className="cursor-pointer mb-3 rounded-lg border border-slate-200 bg-white px-3 py-2">
                      <p className="text-xs text-slate-500">Giá tháng</p>
                      <p className="text-sm font-semibold text-slate-900">
                        {plan.monthlyPrice.toLocaleString("vi-VN")} VND
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Giá năm: {plan.yearlyPrice.toLocaleString("vi-VN")} VND
                      </p>
                    </div>

                    <ul className="space-y-1.5 text-sm text-slate-600">
                      <li
                        className={
                          plan.features.canRecommendationOnTop
                            ? "flex items-center gap-2"
                            : "flex items-center gap-2 text-slate-400 line-through"
                        }
                      >
                        - Hỗ trợ ưu tiên gợi ý món ăn theo chiến lược nhà hàng
                      </li>

                      <li
                        className={
                          plan.features.canUseAIUpsell
                            ? "flex items-center gap-2"
                            : "flex items-center gap-2 text-slate-400 line-through"
                        }
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                        Hỗ trợ gợi ý upsell bằng AI
                      </li>

                      <li
                        className={
                          plan.features.canCustomMenuTemplate
                            ? "flex items-center gap-2"
                            : "flex items-center gap-2 text-slate-400 line-through"
                        }
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                        Tùy chỉnh mẫu thực đơn
                      </li>

                      <li
                        className={
                          plan.features.canUsePromotions
                            ? "flex items-center gap-2"
                            : "flex items-center gap-2 text-slate-400 line-through"
                        }
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                        Quản lý Khuyến mãi
                      </li>
                    </ul>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
              Chưa có gói dịch vụ khả dụng.
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-slate-200 px-6 py-4">
          <p className="text-sm text-slate-500">
            {selectedPlan
              ? `Đã chọn: ${selectedPlan.name}`
              : "Vui lòng chọn một gói để tiếp tục"}
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Hủy bỏ
            </button>
            <button
              disabled={!selectedId}
              onClick={() => selectedId && onSubmit(selectedId)}
              className="cursor-pointer rounded-xl border border-slate-200 bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Tiếp tục
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
