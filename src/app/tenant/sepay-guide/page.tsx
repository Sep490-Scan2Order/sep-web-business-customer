import Link from "next/link";
import { ChevronLeft, ExternalLink } from "lucide-react";
import { TENANT_ROUTES } from "@/src/constants/routes";

const sepayBankGuideSteps = [
  {
    title: "Ảnh trang chủ Sepay",
    imageUrl:
      "https://ysafyqmiutvhohvsthnt.supabase.co/storage/v1/object/public/sepay_guide/sepay.png",
  },
  {
    title: "Ảnh đăng nhập tài khoản Sepay",
    imageUrl:
      "https://ysafyqmiutvhohvsthnt.supabase.co/storage/v1/object/public/sepay_guide/sepay_login.png",
  },
  {
    title: "Ảnh thông tin về kết nối ngân hàng qua Sepay",
    imageUrl:
      "https://ysafyqmiutvhohvsthnt.supabase.co/storage/v1/object/public/sepay_guide/sepay_bank.png",
  },
  {
    title: "Ảnh liên kết ngân hàng hỗ trợ",
    imageUrl:
      "https://ysafyqmiutvhohvsthnt.supabase.co/storage/v1/object/public/sepay_guide/sepay_integration1.png",
  },
  {
    title: "Chọn tài khoản cá nhân hoặc hộ kinh doanh",
    imageUrl:
      "https://ysafyqmiutvhohvsthnt.supabase.co/storage/v1/object/public/sepay_guide/sepay_integration2.png",
  },
  {
    title: "Các tính năng ngân hàng đó hỗ trợ",
    imageUrl:
      "https://ysafyqmiutvhohvsthnt.supabase.co/storage/v1/object/public/sepay_guide/sepay_integration3.png",
  },
  {
    title: "Ngân hàng hỏi bạn đã có tài khoản chưa (trường hợp này là đã có)",
    imageUrl:
      "https://ysafyqmiutvhohvsthnt.supabase.co/storage/v1/object/public/sepay_guide/sepay_integration4.png",
  },
  {
    title:
      "Nhập các thông tin cần thiết (mã thẻ, tên chủ thẻ, CCCD, số điện thoại)",
    imageUrl:
      "https://ysafyqmiutvhohvsthnt.supabase.co/storage/v1/object/public/sepay_guide/sepay_integration5.png",
  },
  {
    title: "Nhập mã OTP từ ngân hàng để xác nhận liên kết với Sepay",
  },
  {
    title: "Cấu hình ngân hàng của bạn với Sepay",
    imageUrl:
      "https://ysafyqmiutvhohvsthnt.supabase.co/storage/v1/object/public/sepay_guide/sepay_integration6.png",
  },
  {
    title: "Thử 1 giao dịch với Sepay",
    imageUrl:
      "https://ysafyqmiutvhohvsthnt.supabase.co/storage/v1/object/public/sepay_guide/sepay_integration7.png",
  },
];

export default function SepayGuidePage() {
  return (
    <main className="mx-auto w-full max-w-5xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <header className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 sm:text-2xl">
            Hướng dẫn liên kết ngân hàng với Sepay
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Trang này chỉ tập trung vào quy trình liên kết tài khoản ngân hàng.
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
          Luồng liên kết ngân hàng
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Làm theo 11 bước dưới đây để hoàn tất liên kết tài khoản ngân hàng
          trên Sepay.
        </p>

        <div className="mt-5 space-y-4">
          {sepayBankGuideSteps.map((step, index) => (
            <div
              key={index}
              className="rounded-xl border border-slate-200 bg-slate-50 p-3 sm:p-4"
            >
              <p className="text-sm font-medium text-slate-900">
                Bước {index + 1}: {step.title}
              </p>
              {step.imageUrl ? (
                <div className="mt-3 overflow-hidden rounded-lg border border-slate-200 bg-white">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={step.imageUrl}
                    alt={`Hướng dẫn Sepay bước ${index + 1}`}
                    className="h-auto w-full object-contain"
                    loading="lazy"
                  />
                </div>
              ) : (
                <p className="mt-2 text-xs text-slate-500">
                  Xác nhận OTP trên ứng dụng hoặc SMS của ngân hàng để hoàn tất
                  bước này.
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-sky-200 bg-sky-50 p-5 shadow-sm sm:p-6">
        <h2 className="text-lg font-semibold text-slate-900">
          Tiếp theo: cấu hình webhook
        </h2>
        <p className="mt-2 text-sm text-slate-700">
          Sau khi liên kết ngân hàng thành công, bạn có thể sang trang hướng dẫn
          webhook để hoàn tất cấu hình callback thanh toán.
        </p>
        <Link
          href={TENANT_ROUTES.WEBHOOK_GUIDE}
          className="mt-3 inline-flex items-center gap-2 rounded-lg border border-sky-300 bg-white px-3 py-2 text-sm font-medium text-sky-700 hover:bg-sky-100"
        >
          Đi tới trang webhook guide
          <ExternalLink className="h-4 w-4" />
        </Link>
      </section>
    </main>
  );
}
