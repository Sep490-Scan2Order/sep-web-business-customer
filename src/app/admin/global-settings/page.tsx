"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { configurationService } from "@/src/services/configurationService";
import { ConfigurationResponse } from "@/src/types/type";

export default function GlobalSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [configs, setConfigs] = useState<ConfigurationResponse[]>([]);
  const [commissionRateInput, setCommissionRateInput] = useState<string>("");

  const activeConfig = useMemo(() => configs[0] ?? null, [configs]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await configurationService.getAll();
        if (res.isSuccess && res.data) {
          setConfigs(res.data);
          if (res.data[0]) {
            setCommissionRateInput(String(res.data[0].commissionRate));
          }
        } else {
          toast.error(res.message || "Không thể tải cấu hình");
        }
      } catch (e) {
        console.error(e);
        toast.error("Có lỗi xảy ra khi tải cấu hình");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const handleSave = async () => {
    if (!activeConfig) {
      toast.error("Không tìm thấy cấu hình để cập nhật");
      return;
    }

    const raw = commissionRateInput.trim();
    const rate = Number(raw);
    if (!raw || !Number.isFinite(rate) || rate <= 0) {
      toast.error("CommissionRate phải là số dương");
      return;
    }

    try {
      setSaving(true);
      const res = await configurationService.update(activeConfig.id, {
        commissionRate: rate,
      });
      if (res.isSuccess && res.data) {
        setConfigs((prev) =>
          prev.map((c) => (c.id === res.data!.id ? res.data! : c))
        );
        toast.success(res.message || "Cập nhật cấu hình thành công.");
        return;
      }
      toast.error(res.message || "Cập nhật cấu hình thất bại");
    } catch (e) {
      console.error(e);
      toast.error("Có lỗi xảy ra khi cập nhật cấu hình");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Global Settings</h1>
        <p className="mt-2 text-slate-600">Configure system-wide settings</p>
      </div>

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-slate-500">
          Đang tải...
        </div>
      ) : !activeConfig ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <p className="text-sm text-slate-600">
            Chưa có cấu hình nào. Hãy tạo một row cấu hình ở backend trước.
          </p>
        </div>
      ) : (
        <div className="max-w-2xl rounded-xl border border-slate-200 bg-white p-6">
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Configuration ID
            </p>
            <p className="text-sm font-medium text-slate-900">
              {activeConfig.id}
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Commission Rate (%)
              </label>
              <input
                inputMode="decimal"
                value={commissionRateInput}
                onChange={(e) => setCommissionRateInput(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ví dụ: 3"
              />
              <p className="mt-1 text-xs text-slate-500">
                Backend chỉ yêu cầu field <code>commissionRate</code>.
              </p>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
