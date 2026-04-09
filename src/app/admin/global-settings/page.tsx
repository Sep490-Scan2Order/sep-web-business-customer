"use client";

import { API } from "@/src/constants/api";
import apiClient from "@/src/services/apiClient";
import { Loader2, PlayCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";

export default function GlobalSettingsPage() {
  const [isRunningCronTest, setIsRunningCronTest] = useState(false);

  const handleRunCronJobTest = async () => {
    try {
      setIsRunningCronTest(true);
      const response = await apiClient.post(API.ADMIN.TEST_CRONJOBS);
      if (response.data?.isSuccess) {
        toast.success(response.data?.message || "Đã chạy test cronjob thành công.");
        return;
      }

      toast.error(response.data?.message || "Không thể chạy test cronjob.");
    } catch (error) {
      const backendMessage = (error as { response?: { data?: { message?: string } } }).response?.data?.message;
      toast.error(backendMessage || "Có lỗi xảy ra khi chạy test cronjob.");
    } finally {
      setIsRunningCronTest(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Cài đặt hệ thống</h1>
        <p className="mt-2 text-slate-600">Cấu hình các thiết lập dùng chung toàn hệ thống</p>
      </div>

      <div className="max-w-2xl rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Kiểm thử cronjob</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Chạy test thủ công cho luồng cronjob tính phí hoa hồng và giám sát công nợ tenant.
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
