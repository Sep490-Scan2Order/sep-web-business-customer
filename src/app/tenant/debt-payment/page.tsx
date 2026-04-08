'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, ArrowLeft, Clock3, CreditCard, Loader2, ShieldAlert } from 'lucide-react';
import { toast } from 'react-toastify';
import apiClient from '@/src/services/apiClient';
import { API } from '@/src/constants/api';
import { useAuth } from '@/src/hooks/useAuth';
import DebtReminderPopup from '@/src/components/ui/tenant/DebtReminderPopup';
import { UserInfo } from '@/src/types/type';

const formatDateTime = (value?: string | null) => {
  if (!value) return 'N/A';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'N/A';
  return parsed.toLocaleString('vi-VN');
};

const formatOverdueDuration = (debtStartedAt?: string | null) => {
  if (!debtStartedAt) return 'Chưa xác định';
  const start = new Date(debtStartedAt);
  if (Number.isNaN(start.getTime())) return 'Chưa xác định';

  const diffMs = Date.now() - start.getTime();
  if (diffMs <= 0) return 'Vừa phát sinh';

  const totalHours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;
  return days > 0 ? `${days} ngày${hours > 0 ? ` ${hours} giờ` : ''}` : `${hours} giờ`;
};

export default function DebtPaymentPage() {
  const router = useRouter();
  const { user, refreshUserInfo } = useAuth();
  const tenantInfo = (user ?? null) as UserInfo | null;

  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(true);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const syncTenant = async () => {
      setIsRefreshing(true);
      await refreshUserInfo();
      setIsRefreshing(false);
    };

    syncTenant();
  }, [refreshUserInfo]);

  useEffect(() => {
    if (!tenantInfo) return;
    setShowPopup((tenantInfo.totalDebtAmount ?? 0) > 0);
  }, [tenantInfo]);

  const debtAmount = tenantInfo?.totalDebtAmount ?? 0;
  const debtStartedAt = tenantInfo?.debtStartedAt ?? null;
  const overdueText = useMemo(() => formatOverdueDuration(debtStartedAt), [debtStartedAt]);

  const handleCreatePayment = async () => {
    if (!tenantInfo) {
      toast.error('Không tìm thấy thông tin tenant');
      return;
    }

    if (debtAmount <= 0) {
      toast.info('Hiện tại bạn không có khoản nợ hoa hồng nào cần thanh toán.');
      return;
    }

    try {
      setIsLoading(true);
      const response = await apiClient.post(API.SUBSCRIPTION.CREATE_COMMISSION_FEE_PAYMENT);
      if (response.data?.isSuccess && response.data?.data) {
        window.location.href = response.data.data as string;
        return;
      }

      toast.error(response.data?.message || 'Không thể tạo giao dịch thanh toán.');
    } catch (error) {
      const backendMessage = (error as { response?: { data?: { message?: string } } }).response?.data?.message;
      toast.error(backendMessage || 'Có lỗi xảy ra khi tạo giao dịch thanh toán.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isRefreshing) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
          <Loader2 className="h-5 w-5 animate-spin text-rose-600" />
          <span className="text-sm font-medium text-slate-600">Đang tải thông tin công nợ...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DebtReminderPopup
        isOpen={showPopup && debtAmount > 0}
        onClose={() => setShowPopup(false)}
        onPayNow={handleCreatePayment}
        debtAmount={debtAmount}
        debtStartedAt={debtStartedAt}
        lastWarningSentAt={tenantInfo?.lastWarningSentAt ?? null}
        isSuspended={Boolean(tenantInfo?.isSuspended)}
        isLoading={isLoading}
      />

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-slate-50 px-6 py-7">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Commission debt payment</p>
              <h1 className="mt-2 text-3xl font-semibold text-slate-900 md:text-4xl">Thanh toán nợ hoa hồng</h1>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Trang này cho phép tenant tạo giao dịch PayOS để thanh toán khoản nợ hoa hồng còn tồn đọng.
              </p>
            </div>

            <button
              type="button"
              onClick={() => router.push('/tenant/dashboard')}
              className="cursor-pointer inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              <ArrowLeft className="h-4 w-4" />
              Quay lại dashboard
            </button>
          </div>
        </div>

        <div className="grid gap-6 p-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-center gap-2 text-slate-500">
                  <CreditCard className="h-4 w-4" />
                  <span className="text-sm font-medium">Số tiền nợ</span>
                </div>
                <p className="mt-3 text-3xl font-semibold text-slate-900">{debtAmount.toLocaleString('vi-VN')} VND</p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-center gap-2 text-slate-500">
                  <Clock3 className="h-4 w-4" />
                  <span className="text-sm font-medium">Thời gian nợ</span>
                </div>
                <p className="mt-3 text-2xl font-semibold text-slate-900">{overdueText}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h2 className="text-lg font-semibold text-slate-900">Thông tin thanh toán</h2>
              <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-slate-500">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="font-medium">Trạng thái</span>
                  </div>
                  <p className={`mt-2 text-lg font-semibold ${tenantInfo?.isSuspended ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {tenantInfo?.isSuspended ? 'Đã đình chỉ' : 'Đang hoạt động'}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-slate-500">
                    <ShieldAlert className="h-4 w-4" />
                    <span className="font-medium">Cảnh báo gần nhất</span>
                  </div>
                  <p className="mt-2 text-lg font-semibold text-slate-900">
                    {formatDateTime(tenantInfo?.lastWarningSentAt)}
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800">
                Sau khi tạo giao dịch, bạn sẽ được chuyển sang PayOS. Khi webhook callback hoàn tất, hệ thống sẽ tự động xóa công nợ và mở khóa nếu tài khoản đang bị đình chỉ.
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <h3 className="text-lg font-semibold text-slate-900">Tạo giao dịch thanh toán</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Nhấn nút bên dưới để tạo link thanh toán nợ hoa hồng qua PayOS.
            </p>

            <div className="mt-5 space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Tenant</span>
                <span className="font-medium text-slate-900">{tenantInfo?.name || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Email</span>
                <span className="font-medium text-slate-900">{tenantInfo?.email || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Số tiền cần thanh toán</span>
                <span className="font-bold text-rose-600">{debtAmount.toLocaleString('vi-VN')} VND</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCreatePayment}
              disabled={isLoading || debtAmount <= 0}
              className="cursor-pointer mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <CreditCard className="h-4 w-4" />
              {isLoading ? 'Đang tạo giao dịch...' : 'Tạo giao dịch thanh toán'}
            </button>

            {debtAmount <= 0 ? (
              <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
                Hiện tại bạn không có khoản nợ hoa hồng nào cần thanh toán.
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setShowPopup(true)}
          className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
        >
          Hiển thị popup nhắc nợ
        </button>
      </div>
    </div>
  );
}