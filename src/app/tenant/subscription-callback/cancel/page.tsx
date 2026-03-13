'use client';
import React, { useEffect, useState, Suspense, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { XCircle, Loader2, ArrowLeft, AlertTriangle } from 'lucide-react';
import { AxiosError } from 'axios';
import apiClient from '@/src/services/apiClient';
import { API } from '@/src/constants/api';

// Định nghĩa Type cho response trả về
interface PaymentStatusData {
  orderCode: number;
  totalAmount: number;
  status: string;
  isFinal: boolean;
  lastUpdatedAt: string;
}

function PaymentCancelContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [isLoading, setIsLoading] = useState(true);
  const [paymentData, setPaymentData] = useState<PaymentStatusData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Thêm useRef để đánh dấu xem đã xử lý giao dịch chưa
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Chốt chặn chống render nhiều lần
    if (hasProcessed.current) return;

    const orderCodeParam = searchParams.get('orderCode');

    if (orderCodeParam) {
      hasProcessed.current = true; 
      const orderCode = Number(orderCodeParam);
      
      // Xóa orderCode khỏi URL
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('orderCode');
      window.history.replaceState({}, '', newUrl.toString());

      const processCancelFlow = async () => {
        try {
          // 1. Gọi API cancel trước
          const cancelResponse = await apiClient.post(
            API.SUBSCRIPTION.CANCEL_PAYMENT(orderCode)
          );
          
          if (!cancelResponse.data.isSuccess) {
            console.warn('Hủy thanh toán bị từ chối/không thành công từ server:', cancelResponse.data.message);
          }

          // 2. Sau khi Cancel, gọi API lấy trạng thái mới nhất
          const statusResponse = await apiClient.get(
            API.SUBSCRIPTION.GET_SUBSCRIPTION_PAYMENT_STATUS(orderCode)
          );

          if (statusResponse.data.isSuccess) {
            setPaymentData(statusResponse.data.data);
          } else {
            setError(statusResponse.data.message || "Không thể tải trạng thái đơn hàng bị hủy.");
          }
        } catch (err: unknown) {
          const axiosError = err as AxiosError<{ message?: string }>;
          setError(
            axiosError.response?.data?.message ||
              'Có lỗi xảy ra khi giao tiếp với máy chủ.'
          );
        } finally {
          setIsLoading(false);
        }
      };

      processCancelFlow();
    } else {
      setIsLoading(false);
      setError("Không tìm thấy mã giao dịch hợp lệ.");
    }
  }, [searchParams]);

  // GIAO DIỆN 1: Đang tải
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-20">
        <Loader2 className="h-12 w-12 animate-spin text-red-500" />
        <p className="text-slate-600 font-medium">Đang tiến hành hủy giao dịch...</p>
      </div>
    );
  }

  // GIAO DIỆN 2: Lỗi (Hoặc không có mã giao dịch)
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="rounded-full bg-red-100 p-4 mb-4">
          <XCircle className="h-12 w-12 text-red-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Thao tác thất bại</h2>
        <p className="text-slate-600 mb-8 max-w-md">{error}</p>
        <button 
          onClick={() => router.push('/tenant/plan')}
          className="flex items-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-xl hover:bg-slate-800 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại trang Dịch vụ
        </button>
      </div>
    );
  }

  // GIAO DIỆN 3: Đã hủy thành công
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="rounded-full p-4 mb-6 bg-red-100">
        <AlertTriangle className="h-16 w-16 text-red-600" />
      </div>

      <h2 className="text-3xl font-bold text-slate-800 mb-2">
        Đã hủy thanh toán
      </h2>
      
      <p className="text-slate-600 mb-8 max-w-md">
        Giao dịch mua gói dịch vụ của bạn đã bị hủy bỏ. Sẽ không có khoản phí nào được tính.
      </p>

      {/* Thẻ hiển thị thông tin hóa đơn bị hủy */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 w-full max-w-md text-left mb-8 shadow-sm opacity-90">
        <h3 className="font-semibold text-slate-800 border-b border-slate-200 pb-3 mb-3">
          Thông tin giao dịch bị hủy
        </h3>
        
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500">Mã đơn hàng:</span>
            <span className="font-medium text-slate-900 line-through decoration-slate-400">#{paymentData?.orderCode}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-slate-500">Trạng thái:</span>
            <span className="font-bold text-red-600">
              {paymentData?.status || "Đã hủy"}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-500">Thời gian cập nhật:</span>
            <span className="font-medium text-slate-900">
              {paymentData?.lastUpdatedAt ? new Date(paymentData.lastUpdatedAt).toLocaleString('vi-VN') : 'N/A'}
            </span>
          </div>

          <div className="flex justify-between pt-3 border-t border-slate-200 mt-3">
            <span className="font-semibold text-slate-700">Giá trị đơn hàng:</span>
            <span className="font-bold text-lg text-slate-500">
              {paymentData?.totalAmount.toLocaleString('vi-VN')} VND
            </span>
          </div>
        </div>
      </div>

      <button 
        onClick={() => router.push('/tenant/plan')}
        className="flex items-center gap-2 bg-slate-800 text-white px-8 py-3 rounded-xl hover:bg-slate-900 transition shadow-lg shadow-slate-200 font-medium"
      >
        <ArrowLeft className="w-5 h-5" /> Trở về Quản lý Gói dịch vụ
      </button>
    </div>
  );
}

// Bọc toàn bộ Content vào Suspense để Next.js không báo lỗi khi dùng useSearchParams
export default function CancelPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <Suspense fallback={
          <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-red-500" />
          </div>
        }>
          <PaymentCancelContent />
        </Suspense>
      </div>
    </div>
  );
}