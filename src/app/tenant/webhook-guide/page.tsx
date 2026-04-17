"use client";
import Link from "next/link";
import { ChevronLeft, ExternalLink } from "lucide-react";
import { TENANT_ROUTES } from "@/src/constants/routes";
import Header from "@/src/components/ui/common/layout/Header";
import ImageModal from "@/src/components/ui/common/ImageModal";

const WEBHOOK_URL = "https://api.scan2order.io.vn/api/Webhooks/sepay";

export default function TenantWebhookGuidePage() {
  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-5xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <header className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 sm:text-2xl">
            Hướng dẫn sử dụng webhook với Sepay
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Thiết lập webhook để hệ thống tự động nhận callback thanh toán.
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
          1) Giao diện webhook trên Sepay
        </h2>
        <div className="mt-4 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
          <ImageModal
            src="https://ysafyqmiutvhohvsthnt.supabase.co/storage/v1/object/public/sepay_guide/webhook1.png"
            alt="Giao diện webhook trên Sepay"
            className="h-auto w-full object-contain"
          />
        </div>
      </section>

      <section className="rounded-2xl border border-sky-200 bg-sky-50 p-5 shadow-sm sm:p-6">
        <h2 className="text-lg font-semibold text-slate-900">
          2) Điền cấu hình webhook quan trọng
        </h2>
        <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm text-slate-700">
          <li>
            <span className="font-medium">Bắn webhooks khi:</span> Có tiền vào.
          </li>
          <li>
            <span className="font-medium">Điều kiện:</span> Chọn khi tài khoản
            ngân hàng là tài khoản đã được liên kết ở Sepay. Bỏ qua nếu nội dung
            giao dịch không có code thanh toán: Có.
          </li>
          <li>
            <span className="font-medium">Gọi đến URL:</span>
            <a
              href={WEBHOOK_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-1 inline-flex items-center gap-1 break-all font-medium text-sky-700 hover:text-sky-800"
            >
              {WEBHOOK_URL}
              <ExternalLink className="h-4 w-4" />
            </a>
            .
            <br />
            <span className="font-medium">
              Là webhooks xác thực thanh toán:
            </span>{" "}
            Đúng.
            <br />
            Bấm nút{" "}
            <span className="font-medium">
              Gọi lại webhooks khi HTTP Status Code không nằm trong phạm vi từ
              200 đến 299
            </span>
            .
          </li>
          <li>
            <span className="font-medium">Cấu hình chứng thực webhooks:</span>
            Kiểu chứng thực: Không cần chứng thực. Request Content Type:
            application/json. Trạng thái: Kích hoạt.
          </li>
        </ol>

        <div className="mt-4 overflow-hidden rounded-lg border border-sky-200 bg-white">
          <ImageModal
            src="https://ysafyqmiutvhohvsthnt.supabase.co/storage/v1/object/public/sepay_guide/webhook2.png"
            alt="Cấu hình webhook Sepay"
            className="h-auto w-full object-contain"
          />
        </div>
      </section>

      <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm sm:p-6">
        <h2 className="text-lg font-semibold text-slate-900">
          3) Hoàn thành cấu hình webhook
        </h2>
        <p className="mt-2 text-sm text-slate-700">
          Sau khi lưu cấu hình, bạn sẽ thấy trạng thái webhook đã sẵn sàng hoạt
          động như minh họa bên dưới.
        </p>
        <div className="mt-4 overflow-hidden rounded-lg border border-emerald-200 bg-white">
          <ImageModal
            src="https://ysafyqmiutvhohvsthnt.supabase.co/storage/v1/object/public/sepay_guide/webhook3.png"
            alt="Hoàn thành cấu hình webhook"
            className="h-auto w-full object-contain"
          />
        </div>
      </section>
      </main>
    </>
  );
}
