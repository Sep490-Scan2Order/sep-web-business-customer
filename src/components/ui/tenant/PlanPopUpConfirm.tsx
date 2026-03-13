'use client'
import { PlanApiItem, PreviewSubscriptionResponse, SubscriptionTenantInfo } from '@/src/types/type'
import { AxiosError } from 'axios'
import { Loader2, Calendar, ShoppingCart, X, CreditCard } from 'lucide-react'
import React, { useState } from 'react'
import apiClient from "@/src/services/apiClient";
import { API } from "@/src/constants/api";
import { toast } from "react-toastify";

interface PlanProps {
  onClose: () => void;
  selectedPlan: PlanApiItem | null; 
  targetRestaurants: SubscriptionTenantInfo[]; 
}

export default function PlanPopUpConfirm({ onClose, selectedPlan, targetRestaurants }: PlanProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [cycle, setCycle] = useState<number>(1); 
  const [quantity, setQuantity] = useState<number>(1);
  const [previewData, setPreviewData] = useState<PreviewSubscriptionResponse>(); 

  // Hàm tạo Request Payload hỗ trợ đa nhà hàng
  const getPayload = () => ({
    items: targetRestaurants.map(r => ({
      restaurantId: r.restaurantId,
      // Nếu có selectedPlan (Đổi gói/Đăng ký) thì lấy ID mới, 
      // Ngược lại (Gia hạn) thì lấy ID gói hiện tại của nhà hàng đó
      targetPlanId: selectedPlan ? selectedPlan.id : (r.currentPlanId || 0),
      cycle: Number(cycle),
      quantity: Number(quantity)
    }))
  });

  const handlePreview = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.post(API.SUBSCRIPTION.PREVIEW, getPayload());
      if (response.data.isSuccess) {
        setPreviewData(response.data.data); 
      } else {
        toast.error(response.data.message || "Không thể lấy thông tin thanh toán");
      }
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message?: string }>;
      toast.error(axiosError.response?.data?.message || "Có lỗi xảy ra khi xem trước");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayment = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.post(API.SUBSCRIPTION.CREATE_PAYMENT, getPayload());
      if (response.data.isSuccess && response.data.data) {
        toast.success("Đang chuyển hướng thanh toán...");
        window.location.href = response.data.data; // Chuyển hướng sang VNPay/Momo
        return; 
      } else {
        toast.error(response.data.message || "Tạo thanh toán thất bại");
      }
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message?: string }>;
      toast.error(axiosError.response?.data?.message || "Có lỗi xảy ra khi thanh toán");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl my-8 rounded-xl border border-slate-200 bg-white shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Xác nhận gói dịch vụ</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              {selectedPlan ? `Gói mục tiêu: ${selectedPlan.name}` : 'Gia hạn gói hiện tại'} 
              <span className="ml-1 font-medium">({targetRestaurants.length} nhà hàng)</span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            disabled={isLoading}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[65vh] overflow-y-auto p-6 space-y-5">
          {!previewData ? (
            <>
              {selectedPlan && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Gói đã chọn</p>
                  <p className="mt-1 text-base font-semibold text-slate-900">{selectedPlan.name}</p>
                  <div className="mt-2 flex flex-wrap gap-3 text-sm text-slate-600">
                    <span>Tháng: {selectedPlan.monthlyPrice.toLocaleString('vi-VN')} VND</span>
                    <span>Năm: {selectedPlan.yearlyPrice.toLocaleString('vi-VN')} VND</span>
                  </div>
                </div>
              )}

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                  <Calendar className="h-4 w-4 text-slate-500" /> Chu kỳ đăng ký
                </label>
                <select 
                  value={cycle} 
                  onChange={(e) => setCycle(Number(e.target.value))}
                  disabled={isLoading}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-300 focus:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value={1}>Theo Tháng</option>
                  <option value={2}>Theo Năm</option>
                </select>
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                  <ShoppingCart className="h-4 w-4 text-slate-500" /> Số lượng (Tháng/Năm)
                </label>
                <input 
                  type="number" 
                  min="1" 
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value) || 0)}
                  disabled={isLoading}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-300 focus:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                />
                <p className="mt-1 text-xs text-slate-500">Ví dụ: 3 tương đương 3 tháng hoặc 3 năm tùy chu kỳ.</p>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <h3 className="text-sm font-semibold text-slate-800">Chi tiết thanh toán</h3>

                <div className="mt-3 space-y-3">
                  {previewData.details.map((detail: PreviewSubscriptionResponse['details'][0], index: number) => (
                    <div key={index} className="rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-600">
                      <div className="mb-2 flex items-start justify-between gap-2 border-b border-slate-100 pb-2">
                        <span className="font-medium text-slate-900">{detail.restaurantName}</span>
                        <span className="font-medium text-slate-900">{detail.targetPlanName}</span>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex justify-between">
                          <span>Chu kỳ:</span>
                          <span>{detail.cycle === 1 ? 'Theo Tháng' : 'Theo Năm'} x {detail.quantity}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Giá gốc:</span>
                          <span>{detail.basePrice.toLocaleString('vi-VN')} VND</span>
                        </div>
                        {detail.balanceConverted > 0 && (
                          <div className="flex justify-between text-orange-600">
                            <span>Số dư quy đổi:</span>
                            <span>{detail.balanceConverted.toLocaleString('vi-VN')} VND</span>
                          </div>
                        )}
                        <div className="flex justify-between pt-1 font-semibold text-slate-900">
                          <span>Thành tiền:</span>
                          <span>{detail.amountToPay.toLocaleString('vi-VN')} VND</span>
                        </div>
                        {detail.message && (
                          <p className="rounded-md bg-slate-50 px-2 py-1 text-xs text-slate-500">{detail.message}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <CreditCard className="h-4 w-4 text-slate-500" />
                  Tổng cần thanh toán
                </div>
                <p className="text-base font-semibold text-slate-900">
                  {previewData.totalAmountToPay.toLocaleString('vi-VN')} VND
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-slate-200 px-6 py-4">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Hủy bỏ
          </button>

          {previewData ? (
            <button
              onClick={() => setPreviewData(undefined)}
              disabled={isLoading}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Chỉnh sửa
            </button>
          ) : null}

          <button
            onClick={!previewData ? handlePreview : handlePayment}
            disabled={isLoading || quantity < 1}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            {!previewData ? "Xem trước tính toán" : "Xác nhận thanh toán"}
          </button>
        </div>

      </div>
    </div>
  )
}