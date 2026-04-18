"use client";
import React, { useEffect, useState, Suspense, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, XCircle, Loader2, ArrowLeft } from "lucide-react";
import apiClient from "@/src/services/apiClient";
import { API } from "@/src/constants/api";
import { getApiErrorMessage } from "@/src/utils/utils";

// Định nghĩa Type cho response trả về
interface PaymentStatusData {
  orderCode: number;
  totalAmount: number;
  status: string;
  isFinal: boolean;
  lastUpdatedAt: string;
}

function PaymentStatusContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [paymentData, setPaymentData] = useState<PaymentStatusData | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  // Thêm useRef để đánh dấu xem đã xử lý giao dịch chưa
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Nếu đã bắt được mã và đang/đã xử lý rồi thì bỏ qua, không chạy lại nữa
    if (hasProcessed.current) return;

    // 1. Lấy orderCode từ URL
    const orderCodeParam = searchParams.get("orderCode");

    if (orderCodeParam) {
      // Khóa chốt chặn ngay lập tức
      hasProcessed.current = true;

      const orderCode = Number(orderCodeParam);

      // 2. Xóa orderCode khỏi URL
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete("orderCode");
      window.history.replaceState({}, "", newUrl.toString());

      // 3. Gọi API lấy trạng thái
      const fetchPaymentStatus = async () => {
        try {
          const response = await apiClient.get(
            API.SUBSCRIPTION.GET_SUBSCRIPTION_PAYMENT_STATUS(orderCode),
          );
          if (response.data.isSuccess) {
            setPaymentData(response.data.data);
          } else {
            setError(
              response.data.message ||
                "Không thể xác thực trạng thái thanh toán.",
            );
          }
        } catch (err: unknown) {
          setError(
            getApiErrorMessage(err) ||
              "Có lỗi xảy ra khi giao tiếp với máy chủ.",
          );
        } finally {
          setIsLoading(false);
        }
      };

      fetchPaymentStatus();
    } else {
      // Chỉ báo lỗi nếu thực sự user vào trang mà KHÔNG có mã trên URL từ đầu
      setIsLoading(false);
      setError("Không tìm thấy mã giao dịch hợp lệ.");
    }
  }, [searchParams]);

  // GIAO DIỆN 1: Đang tải
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-20">
        <Loader2 className="h-12 w-12 animate-spin text-emerald-600" />
        <p className="text-slate-600 font-medium">
          Đang kiểm tra trạng thái thanh toán...
        </p>
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
        <h2 className="text-2xl font-bold text-slate-800 mb-2">
          Tra cứu thất bại
        </h2>
        <p className="text-slate-600 mb-8 max-w-md">{error}</p>
        <button
          onClick={() => router.push("/tenant/plan")}
          className="flex items-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-xl hover:bg-slate-800 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại trang Dịch vụ
        </button>
      </div>
    );
  }

  // GIAO DIỆN 3: Thành công và có Data
  // Tùy thuộc vào chữ "status" BE trả về (ví dụ: "PAID", "SUCCESS", "FAILED", "PENDING") để UI đổi màu tương ứng
  const isPaid =
    paymentData?.status?.toUpperCase() === "PAID" ||
    paymentData?.status?.toUpperCase() === "SUCCESS";

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div
        className={`rounded-full p-4 mb-6 ${isPaid ? "bg-emerald-100" : "bg-orange-100"}`}
      >
        {isPaid ? (
          <CheckCircle className="h-16 w-16 text-emerald-600" />
        ) : (
          <Loader2 className="h-16 w-16 text-orange-600 animate-spin" /> // Trạng thái pending/chưa thanh toán xong
        )}
      </div>

      <h2 className="text-3xl font-bold text-slate-800 mb-2">
        {isPaid ? "Thanh toán thành công!" : "Đang xử lý giao dịch"}
      </h2>

      <p className="text-slate-600 mb-8 max-w-md">
        {isPaid
          ? "Cảm ơn bạn đã tin tưởng. Gói dịch vụ của các nhà hàng đã được cập nhật thành công."
          : "Giao dịch của bạn đang được ghi nhận. Vui lòng chờ trong giây lát."}
      </p>

      {/* Thẻ hiển thị thông tin hóa đơn */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 w-full max-w-md text-left mb-8 shadow-sm">
        <h3 className="font-semibold text-slate-800 border-b border-slate-200 pb-3 mb-3">
          Chi tiết giao dịch
        </h3>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500">Mã đơn hàng:</span>
            <span className="font-medium text-slate-900">
              #{paymentData?.orderCode}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-500">Trạng thái:</span>
            <span
              className={`font-medium ${isPaid ? "text-emerald-600" : "text-orange-600"}`}
            >
              {paymentData?.status}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-500">Thời gian cập nhật:</span>
            <span className="font-medium text-slate-900">
              {paymentData?.lastUpdatedAt
                ? new Date(paymentData.lastUpdatedAt).toLocaleString("vi-VN")
                : "N/A"}
            </span>
          </div>

          <div className="flex justify-between pt-3 border-t border-slate-200 mt-3">
            <span className="font-semibold text-slate-700">
              Tổng thanh toán:
            </span>
            <span className="font-bold text-lg text-emerald-700">
              {paymentData?.totalAmount.toLocaleString("vi-VN")} VND
            </span>
          </div>
        </div>
      </div>

      <button
        onClick={() => router.push("/tenant/plan")}
        className="flex items-center gap-2 bg-emerald-600 text-white px-8 py-3 rounded-xl hover:bg-emerald-700 transition shadow-lg shadow-emerald-200 font-medium"
      >
        <ArrowLeft className="w-5 h-5" /> Trở về Quản lý Gói dịch vụ
      </button>
    </div>
  );
}

// Bọc toàn bộ Content vào Suspense để Next.js không báo lỗi khi dùng useSearchParams
export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <Suspense
          fallback={
            <div className="flex justify-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
            </div>
          }
        >
          <PaymentStatusContent />
        </Suspense>
      </div>
    </div>
  );
}
