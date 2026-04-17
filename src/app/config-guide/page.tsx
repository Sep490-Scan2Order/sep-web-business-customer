"use client";
import Link from "next/link";
import { ChevronLeft, ExternalLink } from "lucide-react";
import { ROUTES, TENANT_ROUTES } from "@/src/constants/routes";
import Header from "@/src/components/ui/common/layout/Header";
import ImageModal from "@/src/components/ui/common/ImageModal";

const configurationSteps = [
  {
    title: "Truy cập Cấu hình công ty",
    description:
      "Từ menu chính, chọn 'Cấu hình công ty' rồi chọn mục 'Cấu hình chung'",
  },
  {
    title: "Thời gian lưu dữ liệu",
    description: "Đặt thành 6 tháng (mặc định)",
  },
  {
    title: "Tài khoản phụ ngân hàng",
    description:
      "Bật tùy chọn này để cho phép sử dụng tài khoản phụ ngân hàng",
  },
  {
    title: "Nhận diện mã thanh toán",
    description:
      "Bật tùy chọn này để cho phép hệ thống tự động nhận diện mã thanh toán",
  },
  {
    title: "Cấu trúc mã thanh toán",
    description: "Cấu hình theo mẫu sau:",
    details: [
      {
        label: "Tiền tố",
        value: "SToO",
      },
      {
        label: "Hậu tố",
        value: "Từ 3 ký tự đến 10 ký tự là Số và chữ",
      },
    ],
  },
  {
    title: "Lưu cấu hình",
    description:
      "Sau khi hoàn tất cấu hình, nhấn nút 'Lưu lại' để lưu tất cả cấu hình chung",
  },
];

export default function ConfigGuidePage() {
  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-5xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <header className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 sm:text-2xl">
            Hướng dẫn cấu hình mã thanh toán
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Trang này hướng dẫn cách cấu hình mã thanh toán trong hệ thống.
          </p>
        </div>
        <Link
          href={TENANT_ROUTES.SETTINGS}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <ChevronLeft className="h-4 w-4" />
          Quay lại
        </Link>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-lg font-semibold text-slate-900">
          Các bước cấu hình mã thanh toán
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Làm theo các bước dưới đây để hoàn tất cấu hình mã thanh toán:
        </p>

        <div className="mt-5 space-y-4">
          {configurationSteps.map((step, index) => (
            <div
              key={index}
              className="rounded-xl border border-slate-200 bg-slate-50 p-3 sm:p-4"
            >
              <p className="text-sm font-medium text-slate-900">
                Bước {index + 1}: {step.title}
              </p>
              <p className="mt-2 text-sm text-slate-700">{step.description}</p>
              {step.details && step.details.length > 0 && (
                <div className="mt-3 space-y-2 rounded-lg bg-white p-3">
                  {step.details.map((detail, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <span className="text-sm font-medium text-slate-600 min-w-fit">
                        {detail.label}:
                      </span>
                      <span className="text-sm text-slate-700">
                        {detail.value}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-lg font-semibold text-slate-900">
          Hình ảnh minh họa
        </h2>
        <p className="mt-2 text-sm text-slate-700">
          Dưới đây là hình ảnh chi tiết về giao diện cấu hình:
        </p>
        <div className="mt-4 overflow-hidden rounded-lg border border-slate-200 bg-white">
          <ImageModal
            src="https://ysafyqmiutvhohvsthnt.supabase.co/storage/v1/object/public/sepay_guide/transaction-guide1.png"
            alt="Hình ảnh minh họa cấu hình mã thanh toán"
            className="h-auto w-full object-contain"
          />
        </div>
      </section>

      <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm sm:p-6">
        <h2 className="text-lg font-semibold text-slate-900">
          Bước tiếp theo
        </h2>
        <p className="mt-2 text-sm text-slate-700">
          Sau khi cấu hình mã thanh toán thành công, bạn có thể:
        </p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <Link
            href={TENANT_ROUTES.SEPAY_GUIDE}
            className="inline-flex items-center gap-2 rounded-lg border border-emerald-300 bg-white px-3 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-100"
          >
            Xem hướng dẫn SePay
            <ExternalLink className="h-4 w-4" />
          </Link>
          <Link
            href={TENANT_ROUTES.WEBHOOK_GUIDE}
            className="inline-flex items-center gap-2 rounded-lg border border-emerald-300 bg-white px-3 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-100"
          >
            Xem hướng dẫn Webhook
            <ExternalLink className="h-4 w-4" />
          </Link>
        </div>
      </section>
      </main>
    </>
  );
}
