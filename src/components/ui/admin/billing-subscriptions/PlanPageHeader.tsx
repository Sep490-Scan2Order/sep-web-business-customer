import { Plus, RefreshCcw } from "lucide-react";

type PlanPageHeaderProps = {
  onRefresh: () => void;
  onCreate: () => void;
};

export default function PlanPageHeader({ onRefresh, onCreate }: PlanPageHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-6 py-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Thanh toán & Gói dịch vụ</h1>
        <p className="mt-1 text-sm text-slate-600">Quản lý gói dịch vụ: thêm mới, chỉnh sửa và theo dõi trạng thái.</p>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onRefresh}
          className=" cursor-pointer inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          <RefreshCcw className="h-4 w-4" />
          Làm mới
        </button>
        <button
          type="button"
          onClick={onCreate}
          className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          <Plus className="h-4 w-4" />
          Thêm gói
        </button>
      </div>
    </div>
  );
}
