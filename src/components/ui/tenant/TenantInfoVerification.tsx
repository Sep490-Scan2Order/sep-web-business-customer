"use client";
import React, { useState } from "react";
import { BadgeCheck, AlertTriangle, Landmark, FileCheck2, CircleHelp, Info } from "lucide-react";
import Link from "next/link";
import { UserInfo } from "@/src/types/type";
import { ROUTES } from "@/src/constants/routes";
import { formatBoolean, formatOptional, maskId } from "./tenantInfoFormatters";
import TenantVerifyBankModelPopup from "./TenantVerifyBankModelPopup";
import { TENANT_ROUTES } from "@/src/constants/routes";

interface TenantInfoVerificationProps {
  userInfo: UserInfo;
}

const StatusIcon = ({ isVerified }: { isVerified: boolean }) => {
  if (isVerified) {
    return <BadgeCheck className="h-5 w-5 text-emerald-600" />;
  }
  return <AlertTriangle className="h-5 w-5 text-amber-500" />;
};

export default function TenantInfoVerification({
  userInfo,
}: TenantInfoVerificationProps) {
  const webhookUrl = "https://api.scan2order.io.vn/api/Webhooks/sepay";
  const [bankPopupOpen, setBankPopupOpen] = useState(false);
  const [isWebhookCopied, setIsWebhookCopied] = useState(false);

  const handleCopyWebhookUrl = async () => {
    try {
      await navigator.clipboard.writeText(webhookUrl);
      setIsWebhookCopied(true);
      window.setTimeout(() => setIsWebhookCopied(false), 1500);
    } catch {
      setIsWebhookCopied(false);
    }
  };

  return (
    <section className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-50 p-2 text-emerald-700">
              <Landmark className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Xác thực ngân hàng
              </p>
              <p className="text-xs text-slate-500">
                Trạng thái: {formatBoolean(userInfo.isVerifyBank)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={TENANT_ROUTES.SEPAY_GUIDE}
              className="rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
              aria-label="Hướng dẫn liên kết ngân hàng với Sepay"
              title="Hướng dẫn liên kết ngân hàng với Sepay"
            >
              <CircleHelp className="h-5 w-5" />
            </Link>
            <StatusIcon isVerified={userInfo.isVerifyBank} />
          </div>
        </div>

        {userInfo.isVerifyBank ? (
          <div className="mt-6 space-y-3 text-sm text-slate-700">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Tên ngân hàng</span>
              <span className="font-medium text-slate-900">
                {formatOptional(userInfo.bankName)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Số tài khoản/thẻ</span>
              <span className="font-medium text-slate-900">
                {formatOptional(userInfo.cardNumber)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Mã ngân hàng</span>
              <span className="font-medium text-slate-900">
                {maskId(userInfo.bankId)}
              </span>
            </div>
            {userInfo.bankLogo && (
              <div className="pt-2">
                <p className="text-xs uppercase text-slate-400">Logo ngân hàng</p>
                <div className="mt-2 h-12 w-32 overflow-hidden rounded-xl border border-slate-200 bg-white">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={userInfo.bankLogo}
                    alt={userInfo.bankName}
                    className="h-full w-full object-contain"
                  />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-6 space-y-3 text-sm text-slate-700">
            <p className="text-slate-500">
              Thông tin ngân hàng chưa được xác thực. Vui lòng hoàn tất quy trình
              xác thực để sử dụng đầy đủ tính năng thanh toán.
            </p>
            <button
              className="rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-700"
              onClick={() => setBankPopupOpen(true)}
            >
              Xác thực thông tin ngân hàng
            </button>
          </div>
        )}

        <div className="mt-5 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">
                Webhook URL
              </p>
              <p className="mt-1 break-all text-sm font-medium text-sky-800">
                {webhookUrl}
              </p>
              <button
                type="button"
                onClick={handleCopyWebhookUrl}
                className="mt-2 inline-flex items-center rounded-lg border border-sky-300 bg-white px-2.5 py-1 text-xs font-medium text-sky-700 hover:bg-sky-100"
              >
                {isWebhookCopied ? "Đã copy" : "Copy URL"}
              </button>
            </div>
            <Link
              href={ROUTES.WEBHOOK_GUIDE}
              className="inline-flex items-center gap-1 rounded-lg border border-sky-300 bg-white px-2.5 py-1.5 text-xs font-medium text-sky-700 hover:bg-sky-100"
              aria-label="Xem cách sử dụng webhook với Sepay"
              title="Xem cách sử dụng webhook với Sepay"
            >
              <Info className="h-3.5 w-3.5" />
              Cách dùng
            </Link>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-sky-50 p-2 text-sky-700">
              <FileCheck2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Xác thực thuế
              </p>
              <p className="text-xs text-slate-500">
                Trạng thái: {formatBoolean(userInfo.isVerifyTax)}
              </p>
            </div>
          </div>
          <StatusIcon isVerified={userInfo.isVerifyTax} />
        </div>

        <div className="mt-6 space-y-3 text-sm text-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Mã số thuế</span>
            <span className="font-medium text-slate-900">
              {formatOptional(userInfo.taxNumber)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Tình trạng xác thực thuế</span>
            <span className="font-medium text-slate-900">
              {formatBoolean(userInfo.isVerifyTax)}
            </span>
          </div>
          {userInfo.isVerifyTax && (
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Chủ thể xác thực</span>
              <span className="font-medium text-slate-900">
                {userInfo.name}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Hộp thoại xác thực ngân hàng */}
      <TenantVerifyBankModelPopup
        isOpen={bankPopupOpen}
        onClose={() => setBankPopupOpen(false)}
        onSubmit={(data) => console.log(data)}
      />
    </section>
  );
}
