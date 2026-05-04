"use client";

import { useEffect, useState } from "react";
import { Loader2, PlayCircle } from "lucide-react";
import { toast } from "react-toastify";
import { configurationService } from "@/src/services/configurationService";
import { ConfigurationResponse } from "@/src/types/type";
import { API } from "@/src/constants/api";
import apiClient from "@/src/services/apiClient";

export default function GlobalSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeConfig, setActiveConfig] =
    useState<ConfigurationResponse | null>(null);
  const [commissionRateInput, setCommissionRateInput] = useState<string>("");
  const [isRunningCronTest, setIsRunningCronTest] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await configurationService.getAll();
        if (res.isSuccess && res.data) {
          setActiveConfig(res.data);
          setCommissionRateInput(String(res.data.commissionRate));
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

  const handleRunCronJobTest = async () => {
    try {
      setIsRunningCronTest(true);
      const response = await apiClient.post(API.ADMIN.TEST_CRONJOBS);
      if (response.data?.isSuccess) {
        toast.success(
          response.data?.message || "Đã chạy test cronjob thành công.",
        );
        return;
      }

      toast.error(response.data?.message || "Không thể chạy test cronjob.");
    } catch (error) {
      const backendMessage = (
        error as { response?: { data?: { message?: string } } }
      ).response?.data?.message;
      toast.error(backendMessage || "Có lỗi xảy ra khi chạy test cronjob.");
    } finally {
      setIsRunningCronTest(false);
    }
  };

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
        setActiveConfig(res.data);
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
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Cài đặt hệ thống</h1>
        <p className="mt-2 text-slate-600">
          Cấu hình các thiết lập dùng chung toàn hệ thống
        </p>
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
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Tỉ lệ hoa hồng (%)
              </label>
              <input
                inputMode="decimal"
                value={commissionRateInput}
                onChange={(e) => setCommissionRateInput(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ví dụ: 3"
              />
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

      <div className="max-w-2xl rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">
          Kiểm thử cronjob
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Chạy test thủ công cho luồng cronjob tính phí hoa hồng và giám sát
          công nợ tenant.
        </p>

        <button
          type="button"
          onClick={handleRunCronJobTest}
          disabled={isRunningCronTest}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isRunningCronTest ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Đang chạy test cronjob...
            </>
          ) : (
            <>
              <PlayCircle className="h-4 w-4" />
              Chạy test cronjob
            </>
          )}
        </button>
      </div>
    </div>
  );
}
