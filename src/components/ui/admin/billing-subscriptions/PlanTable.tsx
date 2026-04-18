import { PlanApiItem } from "@/src/types/type";
import { Pencil } from "lucide-react";
import { formatCurrency, getStatusTag } from "./planUtils";

type PlanTableProps = {
  plans: PlanApiItem[];
  isLoading: boolean;
  onEdit: (planId: number) => void;
};

export default function PlanTable({
  plans,
  isLoading,
  onEdit,
}: PlanTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <th className="px-4 py-3">Gói</th>
            <th className="px-4 py-3">Giá tháng</th>
            <th className="px-4 py-3">Giá năm</th>
            <th className="px-4 py-3">Cấp độ</th>
            <th className="px-4 py-3">Trạng thái</th>
            <th className="px-4 py-3">Tính năng</th>
            <th className="px-4 py-3 text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, rowIndex) => (
              <tr key={`plan-skeleton-row-${rowIndex}`}>
                <td className="px-4 py-3">
                  <div className="h-4 w-28 animate-pulse rounded bg-slate-200" />
                  <div className="mt-2 h-3 w-20 animate-pulse rounded bg-slate-100" />
                </td>
                <td className="px-4 py-3">
                  <div className="h-3 w-20 animate-pulse rounded bg-slate-200" />
                </td>
                <td className="px-4 py-3">
                  <div className="h-3 w-20 animate-pulse rounded bg-slate-200" />
                </td>
                <td className="px-4 py-3">
                  <div className="h-3 w-16 animate-pulse rounded bg-slate-200" />
                </td>
                <td className="px-4 py-3">
                  <div className="h-6 w-20 animate-pulse rounded-full bg-slate-200" />
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1.5">
                    <div className="h-5 w-20 animate-pulse rounded-full bg-slate-100" />
                    <div className="h-5 w-24 animate-pulse rounded-full bg-slate-100" />
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="ml-auto h-8 w-24 animate-pulse rounded-lg bg-slate-200" />
                </td>
              </tr>
            ))
          ) : plans.length === 0 ? (
            <tr>
              <td
                colSpan={7}
                className="px-4 py-10 text-center text-sm text-slate-500"
              >
                Không có gói phù hợp.
              </td>
            </tr>
          ) : (
            plans.map((plan) => (
              <tr key={plan.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <div className="font-semibold text-slate-900">
                    {plan.name}
                  </div>
                  <div className="text-xs text-slate-500">Mã: {plan.id}</div>
                </td>
                <td className="px-4 py-3 text-sm text-slate-700">
                  {formatCurrency(plan.monthlyPrice)} đ
                </td>
                <td className="px-4 py-3 text-sm text-slate-700">
                  {formatCurrency(plan.yearlyPrice)} đ
                </td>
                <td className="px-4 py-3 text-sm text-slate-700">
                  {plan.level}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusTag(plan.status)}`}
                  >
                    {plan.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-slate-700">
                  <div className="flex flex-wrap gap-1.5">
                    {plan.features?.canUsePromotions && (
                      <span className="rounded-full bg-blue-50 px-2 py-1 text-blue-700">
                        Khuyến mãi
                      </span>
                    )}
                    {plan.features?.canCustomMenuTemplate && (
                      <span className="rounded-full bg-purple-50 px-2 py-1 text-purple-700">
                        Tùy chỉnh menu
                      </span>
                    )}
                    {plan.features?.canUseAIUpsell && (
                      <span className="rounded-full bg-emerald-50 px-2 py-1 text-emerald-700">
                        AI bán thêm
                      </span>
                    )}
                    {plan.features?.canRecommendationOnTop && (
                      <span className="rounded-full bg-amber-50 px-2 py-1 text-amber-700">
                        Gợi ý ưu tiên
                      </span>
                    )}
                    {!plan.features?.canUsePromotions &&
                      !plan.features?.canCustomMenuTemplate &&
                      !plan.features?.canUseAIUpsell &&
                      !plan.features?.canRecommendationOnTop && (
                        <span className="text-slate-400">
                          Không có cờ tính năng
                        </span>
                      )}
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => onEdit(plan.id)}
                    className="cursor-pointer inline-flex items-center gap-2 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Cập nhật
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
