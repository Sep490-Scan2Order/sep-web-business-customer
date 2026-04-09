"use client";
import React, { useState } from "react";
import { BadgeCheck, AlertTriangle, Landmark, FileCheck2 } from "lucide-react";
import { UserInfo } from "@/src/types/type";
import { formatBoolean, formatOptional, maskId } from "./tenantInfoFormatters";
import TenantVerifyBankModelPopup from "./TenantVerifyBankModelPopup";

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
  const [bankPopupOpen, setBankPopupOpen] = useState(false);
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
          <StatusIcon isVerified={userInfo.isVerifyBank} />
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
