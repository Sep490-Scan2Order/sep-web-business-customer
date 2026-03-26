"use client";

import React from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import RevenueSummary from "@/src/components/ui/tenant/RevenueSummary";

export default function RestaurantDashboardDetailPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const restaurantId = Number(params.restaurantId);
  const restaurantName = searchParams.get('name') || 'Nhà hàng';

  if (!restaurantId || isNaN(restaurantId)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-slate-600">ID nhà hàng không hợp lệ</p>
        <p>{restaurantId}</p>
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <button
          onClick={() => router.back()}
          className="cursor-pointer inline-flex items-center justify-center rounded-lg border border-slate-200 p-2 hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-slate-700" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Chi tiết doanh thu - {restaurantName}</h1>
          <p className="text-sm text-slate-500">Theo dõi doanh thu chi tiết cho nhà hàng này</p>
        </div>
      </div>

      {/* Revenue Summary Component */}
      <RevenueSummary restaurantId={restaurantId} />
    </div>
  );
}
