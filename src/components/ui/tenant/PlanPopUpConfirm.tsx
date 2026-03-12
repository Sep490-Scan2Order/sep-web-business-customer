'use client'
import { PlanApiItem, PreviewSubscriptionResponse } from '@/src/types/type'
import { Edit2, Layers, Loader2, Calendar, ShoppingCart, X } from 'lucide-react'
import React, { useState } from 'react'
import apiClient from "@/src/services/apiClient";
import { API } from "@/src/constants/api";
import { toast } from "react-toastify";

interface PlanProps {
  onClose: () => void;
  planData: PlanApiItem;
  restaurantId: number;
}

export default function PlanPopUpConfirm({ onClose, planData, restaurantId }: PlanProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [cycle, setCycle] = useState<number>(1); 
  const [quantity, setQuantity] = useState<number>(1);
  const [previewData, setPreviewData] = useState<PreviewSubscriptionResponse>(); 

  // Hàm tạo Request Payload chung
  const getPayload = () => ({
    items: [
      {
        restaurantId: restaurantId,
        targetPlanId: planData.id,
        cycle: Number(cycle),
        quantity: Number(quantity)
      }
    ]
  });

  // 1. Gọi API PREVIEW
  const handlePreview = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.post(API.SUBSCRIPTION.PREVIEW, getPayload());
      if (response.data.isSuccess) {
        setPreviewData(response.data.data); 
      } else {
        toast.error(response.data.message || "Không thể lấy thông tin thanh toán");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra khi xem trước");
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Gọi API CREATE_PAYMENT
  const handlePayment = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.post(API.SUBSCRIPTION.CREATE_PAYMENT, getPayload());
      console.log("Create Payment Response:", response.data); 
      
      if (response.data.isSuccess && response.data.data) {
        const paymentUrl = response.data.data; 
        toast.success("Đang chuyển hướng đến cổng thanh toán...");
        
        // Cách 1: Chuyển hướng trực tiếp (Khuyên dùng)
        // Lưu ý: Dùng cách này, bạn phải đảm bảo backend có cấu hình URL trả về (ReturnUrl)
        // để sau khi thanh toán xong, user quay lại đúng web của bạn.
        //window.location.href = paymentUrl;
        
        // Cách 2: Mở tab mới (Dễ bị trình duyệt chặn do cơ chế chặn popup)
         window.open(paymentUrl, '_blank'); 
         onClose(); 
         

      } else {
        toast.error(response.data.message || "Tạo thanh toán thất bại");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra khi thanh toán");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
        
        {/* Header */}
        <div className="bg-emerald-600 px-8 py-6 flex justify-between items-center text-white">
          <div>
            <h2 className="text-2xl font-bold">Xác nhận gói dịch vụ</h2>
            <p className="text-sm text-emerald-100 mt-1">Gói mục tiêu: {planData.name}</p>
          </div>
          <button onClick={onClose} className="rounded-lg bg-white/20 p-2 hover:bg-white/30 transition-all">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-5">
          {/* Chưa Preview -> Hiện form nhập */}
          {!previewData ? (
            <>
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                  <Calendar className="h-4 w-4 text-emerald-600" /> Chu kỳ đăng ký
                </label>
                <select 
                  value={cycle} 
                  onChange={(e) => setCycle(Number(e.target.value))}
                  className="w-full rounded-xl border border-gray-300 p-2.5 outline-none focus:border-emerald-500"
                >
                  <option value={1}>Theo Tháng</option>
                  <option value={2}>Theo Năm</option>
                </select>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                  <ShoppingCart className="h-4 w-4 text-emerald-600" /> Số lượng (Tháng/Năm)
                </label>
                <input 
                  type="number" 
                  min="1" 
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full rounded-xl border border-gray-300 p-2.5 outline-none focus:border-emerald-500"
                />
              </div>
            </>
          ) : (
            /* Đã Preview -> Hiện hóa đơn tính toán */
            <div className="rounded-xl bg-slate-50 p-5 border border-slate-200 space-y-3">
              <h3 className="font-semibold text-slate-800 border-b pb-2">Chi tiết thanh toán</h3>
              {previewData.details.map((detail: PreviewSubscriptionResponse['details'][0], index: number) => (
                <div key={index} className="space-y-2 text-sm text-slate-600">
                  <div className="flex justify-between">
                    <span>Nhà hàng:</span> <span className="font-medium text-slate-900">{detail.restaurantName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Giá gốc:</span> <span>{detail.basePrice.toLocaleString("vi-VN")} VND</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Số dư quy đổi (nếu có):</span> <span className="text-orange-600">-{detail.balanceConverted.toLocaleString("vi-VN")} VND</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg text-emerald-700 pt-2 border-t">
                    <span>Tổng cần thanh toán:</span> <span>{detail.amountToPay.toLocaleString("vi-VN")} VND</span>
                  </div>
                  {detail.message && <p className="text-xs text-blue-600 italic mt-1">{detail.message}</p>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 bg-slate-50 px-8 py-5 border-t">
          {/* Nút Quay lại nếu đã Preview */}
          {previewData && (
            <button
              onClick={() => setPreviewData(undefined)}
              className="rounded-xl border border-slate-300 px-6 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              Chọn lại
            </button>
          )}

          <button
            onClick={!previewData ? handlePreview : handlePayment}
            disabled={isLoading || quantity < 1}
            className="group flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition-all hover:bg-emerald-700 disabled:opacity-50"
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            {!previewData ? "Xem trước tính toán" : "Xác nhận thanh toán"}
          </button>
        </div>

      </div>
    </div>
  )
}