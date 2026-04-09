import { Search } from "lucide-react";

type PlanSearchBarProps = {
  value: string;
  onChange: (value: string) => void;
};

export default function PlanSearchBar({ value, onChange }: PlanSearchBarProps) {
  return (
    <div className="border-b border-slate-200 px-6 py-3">
      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Tìm theo tên gói, cấp độ hoặc trạng thái"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-800 outline-none ring-slate-200 transition focus:ring"
        />
      </div>
    </div>
  );
}
