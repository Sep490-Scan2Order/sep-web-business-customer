import { PlanUpsertRequest } from "@/src/types/type";
import { Loader2, X } from "lucide-react";

type PlanFormModalProps = {
  isOpen: boolean;
  isSaving: boolean;
  editingPlanId: number | null;
  formData: PlanUpsertRequest;
  onClose: () => void;
  onSubmit: (event: React.FormEvent) => void;
  onFieldChange: <K extends keyof PlanUpsertRequest>(key: K, value: PlanUpsertRequest[K]) => void;
  onFeatureChange: (key: keyof PlanUpsertRequest["features"], value: boolean) => void;
};

export default function PlanFormModal({
  isOpen,
  isSaving,
  editingPlanId,
  formData,
  onClose,
  onSubmit,
  onFieldChange,
  onFeatureChange,
}: PlanFormModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {editingPlanId === null ? "Thêm gói mới" : `Cập nhật gói #${editingPlanId}`}
            </h2>
            <p className="mt-1 text-xs text-slate-500">Điền đầy đủ thông tin gói dịch vụ.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className=" cursor-pointer rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-5 px-6 py-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="space-y-1.5">
              <span className="text-sm font-medium text-slate-700">Tên gói</span>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => onFieldChange("name", e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none ring-slate-200 transition focus:ring"
                placeholder="Ví dụ: Premium Plus"
              />
            </label>

            <label className="space-y-1.5">
              <span className="text-sm font-medium text-slate-700">Cấp độ</span>
              <input
                type="number"
                min={0}
                value={formData.level}
                onChange={(e) => onFieldChange("level", Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none ring-slate-200 transition focus:ring"
              />
            </label>

            <label className="space-y-1.5">
              <span className="text-sm font-medium text-slate-700">Giá tháng</span>
              <input
                type="number"
                min={0}
                value={formData.monthlyPrice}
                onChange={(e) => onFieldChange("monthlyPrice", Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none ring-slate-200 transition focus:ring"
              />
            </label>

            <label className="space-y-1.5">
              <span className="text-sm font-medium text-slate-700">Giá năm</span>
              <input
                type="number"
                min={0}
                value={formData.yearlyPrice}
                onChange={(e) => onFieldChange("yearlyPrice", Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none ring-slate-200 transition focus:ring"
              />
            </label>

            <label className="space-y-1.5 md:col-span-2">
              <span className="text-sm font-medium text-slate-700">Thời hạn (ngày)</span>
              <input
                type="number"
                min={1}
                value={formData.durationInDays}
                onChange={(e) => onFieldChange("durationInDays", Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none ring-slate-200 transition focus:ring"
              />
            </label>
          </div>

          <div className="rounded-xl border border-slate-200 p-4">
            <div className="mb-3 text-sm font-semibold text-slate-800">Cờ tính năng</div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="flex items-center gap-2 rounded-lg border border-slate-200 p-3 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={formData.features.canUseAIUpsell}
                  onChange={(e) => onFeatureChange("canUseAIUpsell", e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300"
                />
                <span>Cho phép AI bán thêm</span>
              </label>

              <label className="flex items-center gap-2 rounded-lg border border-slate-200 p-3 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={formData.features.canRecommendationOnTop}
                  onChange={(e) => onFeatureChange("canRecommendationOnTop", e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300"
                />
                <span>Cho phép gợi ý ưu tiên</span>
              </label>

              <label className="flex items-center gap-2 rounded-lg border border-slate-200 p-3 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={formData.features.canUsePromotions}
                  onChange={(e) => onFeatureChange("canUsePromotions", e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300"
                />
                <span>Cho phép dùng khuyến mãi</span>
              </label>

              <label className="flex items-center gap-2 rounded-lg border border-slate-200 p-3 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={formData.features.canCustomMenuTemplate}
                  onChange={(e) => onFeatureChange("canCustomMenuTemplate", e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300"
                />
                <span>Cho phép tùy chỉnh mẫu menu</span>
              </label>
            </div>
          </div>

          {/* Special Plan Properties */}
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-amber-800">
              <span>Thuộc tính đặc biệt</span>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-amber-200 bg-white p-3 text-sm text-slate-700 hover:border-amber-400 transition">
                <input
                  type="checkbox"
                  checked={formData.isTrial ?? false}
                  onChange={(e) => {
                    onFieldChange("isTrial", e.target.checked);
                    if (e.target.checked) onFieldChange("isCommissionExempt", true);
                  }}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-amber-600"
                />
                <div>
                  <div className="font-medium text-amber-800">Gói trải nghiệm (Trial)</div>
                  <div className="mt-0.5 text-xs text-slate-500">Tenant tự kích hoạt 1 lần, miễn phí, không qua thanh toán</div>
                </div>
              </label>

              <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-amber-200 bg-white p-3 text-sm text-slate-700 hover:border-amber-400 transition">
                <input
                  type="checkbox"
                  checked={formData.isCommissionExempt ?? false}
                  onChange={(e) => onFieldChange("isCommissionExempt", e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-amber-600"
                />
                <div>
                  <div className="font-medium text-amber-800">Miễn phí hoa hồng</div>
                  <div className="mt-0.5 text-xs text-slate-500">Không thu phí hoa hồng trong thời gian dùng gói này</div>
                </div>
              </label>
            </div>
            {formData.isTrial && (
              <p className="mt-3 text-xs text-amber-700 bg-amber-100 rounded-lg px-3 py-2 border border-amber-200">
                Lưu ý: Hệ thống chỉ dùng <strong>Thời hạn (ngày)</strong> để kích hoạt. Giá tháng/năm sẽ bị bỏ qua.
              </p>
            )}
          </div>

          <div className=" flex items-center justify-end gap-2 border-t border-slate-200 pt-4">
            <button
              type="button"
              onClick={onClose}
              className=" cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className=" cursor-pointer inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {editingPlanId === null ? "Tạo gói" : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
