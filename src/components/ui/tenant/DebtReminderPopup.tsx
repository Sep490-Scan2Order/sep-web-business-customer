'use client';

import React from 'react';
import { AlertTriangle, Clock3, CreditCard, X, ShieldAlert } from 'lucide-react';

export interface DebtReminderPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onPayNow: () => void;
  debtAmount: number;
  debtStartedAt?: string | null;
  lastWarningSentAt?: string | null;
  isSuspended?: boolean;
  isLoading?: boolean;
}

const formatOverdueDuration = (debtStartedAt?: string | null) => {
  if (!debtStartedAt) return 'Chưa xác định';

  const start = new Date(debtStartedAt);
  if (Number.isNaN(start.getTime())) return 'Chưa xác định';

  const diffMs = Date.now() - start.getTime();
  if (diffMs <= 0) return 'Vừa phát sinh';

  const totalHours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;

  if (days <= 0) {
    return `${hours} giờ`;
  }

  return hours > 0 ? `${days} ngày ${hours} giờ` : `${days} ngày`;
};

export default function DebtReminderPopup({
  isOpen,
  onClose,
  onPayNow,
  debtAmount,
  debtStartedAt,
  lastWarningSentAt,
  isSuspended = false,
  isLoading = false,
}: DebtReminderPopupProps) {
  if (!isOpen) return null;

  const overdueText = formatOverdueDuration(debtStartedAt);
  const hasWarning = Boolean(lastWarningSentAt);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-6 backdrop-blur-[2px]">
      <div className="w-full max-w-3xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/15">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 bg-slate-50 px-6 py-5">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl border border-rose-100 bg-rose-50 p-3 text-rose-600">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Nhắc nhở thanh toán nợ</p>
              <h2 className="mt-1 text-2xl font-semibold text-slate-900">Khoản nợ hoa hồng cần được xử lý</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                Tài khoản của bạn đang có khoản nợ hoa hồng cần thanh toán. Vui lòng tạo giao dịch để hệ thống cập nhật lại trạng thái và tránh gián đoạn dịch vụ.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-xl border border-slate-200 p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            aria-label="Đóng popup"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-6 p-6 lg:grid-cols-[1.35fr_0.9fr]">
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-slate-500">
                  <CreditCard className="h-4 w-4" />
                  <span className="text-sm font-medium">Số tiền cần thanh toán</span>
                </div>
                <p className="mt-2 text-3xl font-semibold text-slate-900">
                  {debtAmount.toLocaleString('vi-VN')} VND
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-slate-500">
                  <Clock3 className="h-4 w-4" />
                  <span className="text-sm font-medium">Thời gian nợ</span>
                </div>
                <p className="mt-2 text-lg font-semibold text-slate-900">{overdueText}</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-2 text-slate-500">
                  <ShieldAlert className="h-4 w-4" />
                  <span className="text-sm font-medium">Trạng thái tài khoản</span>
                </div>
                <p className={`mt-2 text-lg font-semibold ${isSuspended ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {isSuspended ? 'Đã đình chỉ' : 'Đang hoạt động'}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-2 text-slate-500">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm font-medium">Trạng thái cảnh báo</span>
                </div>
                <p className="mt-2 text-lg font-semibold text-slate-900">
                  {hasWarning ? 'Đã gửi nhắc nợ' : 'Chưa có nhắc nợ'}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-800">
              {hasWarning
                ? 'Hệ thống đã gửi cảnh báo trước đó. Vui lòng hoàn tất thanh toán để tránh bị khóa tiếp.'
                : 'Đây là khoản nợ mới hoặc chưa có cảnh báo trước đó. Nên xử lý sớm để tránh gián đoạn dịch vụ.'}
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Hành động đề xuất</p>
                <h3 className="mt-2 text-lg font-semibold text-slate-900">Tạo giao dịch thanh toán ngay</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Sau khi tạo giao dịch, bạn sẽ được chuyển tới PayOS. Khi thanh toán hoàn tất, hệ thống sẽ tự động mở khóa và cập nhật công nợ.
                </p>
              </div>

              <button
                type="button"
                onClick={onPayNow}
                disabled={isLoading}
                className="cursor-pointer inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <CreditCard className="h-4 w-4" />
                {isLoading ? 'Đang tạo giao dịch...' : 'Tạo giao dịch thanh toán'}
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer mt-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              Để sau
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}