import Link from "next/link";
import { ROUTES } from "@/src/constants/routes";

const APP_APKPURE_URL = "https://apkpure.com/p/com.scan2order";
const APP_DOWNLOAD_URL = "https://ysafyqmiutvhohvsthnt.supabase.co/storage/v1/object/public/app/scan2order.apk";
const APP_LOGO_URL = "https://ysafyqmiutvhohvsthnt.supabase.co/storage/v1/object/public/logo/logo_default.png";
const APP_QR_CODE_URL = `https://api.qrserver.com/v1/create-qr-code/?size=360x360&data=${encodeURIComponent(APP_APKPURE_URL)}`;

const CORE_VALUES = [
  {
    title: "Trải nghiệm mượt mà",
    description: "Xóa bỏ rào cản chờ đợi, mang lại sự hài lòng tối đa cho khách hàng ngay từ bước gọi món đầu tiên.",
  },
  {
    title: "Tối ưu vận hành",
    description: "Số hóa mọi quy trình từ bếp đến bàn, giúp nhân sự tập trung vào chất lượng phục vụ thay vì ghi chép thủ công.",
  },
  {
    title: "Dữ liệu thông minh",
    description: "Cung cấp báo cáo chuyên sâu giúp chủ nhà hàng đưa ra quyết định kinh doanh dựa trên số liệu thực tế.",
  },
  {
    title: "Công nghệ tiên phong",
    description: "Ứng dụng kiến trúc đa tenant hiện đại và AI gợi ý món ăn để cá nhân hóa hành trình thực khách.",
  },
];

export default function AboutUsPage() {
  return (
    <div className="bg-white text-gray-900">
      {/* Hero Section: Sứ mệnh */}
      <section className="bg-[rgb(var(--color-secondary))] border-b border-[rgb(var(--color-primary)/0.15)]">
        <div className="max-w-6xl mx-auto px-6 py-14">
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center">
            <div>
              <p className="text-[rgb(var(--color-primary))] font-semibold tracking-wide uppercase text-sm">
                Về dự án S2O
              </p>
              <h1 className="mt-2 text-3xl md:text-5xl font-extrabold leading-tight">
                Định nghĩa lại cách vận hành
                <span className="text-[rgb(var(--color-primary))]"> nhà hàng hiện đại</span>
              </h1>
              <p className="mt-4 text-sm md:text-base text-gray-600 max-w-xl leading-relaxed">
                S2O (Scan2Order) không chỉ là một phần mềm đặt món. Chúng tôi xây dựng một hệ sinh thái SaaS thông minh, giúp các doanh nghiệp F&B chuyển đổi số toàn diện, tối ưu chi phí và bứt phá doanh thu trong kỷ nguyên công nghệ.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href={ROUTES.PAGES.PUBLIC.REGISTER}
                  className="inline-flex items-center justify-center rounded-xl bg-[rgb(var(--color-accent-dark))] px-6 py-3 text-white font-semibold hover:bg-[rgb(var(--color-primary))] transition-colors"
                >
                  Khám phá giải pháp
                </Link>
                <Link
                  href={ROUTES.PAGES.PUBLIC.PLAN}
                  className="inline-flex items-center justify-center rounded-xl border border-[rgb(var(--color-primary)/0.4)] px-6 py-3 text-[rgb(var(--color-primary))] font-semibold hover:bg-white/70 transition-colors"
                >
                  Bảng giá dịch vụ
                </Link>
              </div>
            </div>
            <div className="rounded-3xl border border-[rgb(var(--color-primary)/0.15)] bg-white shadow-sm p-6">
              <div className="flex flex-col gap-6">
                <div>
                  <p className="text-xs font-bold text-[rgb(var(--color-primary))] uppercase tracking-widest">Tầm nhìn</p>
                  <p className="mt-2 text-sm text-gray-600 italic">
                    "Trở thành nền tảng công nghệ hàng đầu hỗ trợ các mô hình tự phục vụ, thức ăn nhanh và mang đi tại Việt Nam, kết nối hàng triệu thực khách với những trải nghiệm ẩm thực số hóa."
                  </p>
                </div>
                <hr className="border-gray-100" />
                <div>
                  <p className="text-xs font-bold text-[rgb(var(--color-primary))] uppercase tracking-widest">Chúng tôi giải quyết gì?</p>
                  <ul className="mt-2 space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">● Giảm thiểu sai sót khi order thủ công</li>
                    <li className="flex items-center gap-2">● Giải quyết bài toán quá tải giờ cao điểm</li>
                    <li className="flex items-center gap-2">● Tự động hóa thanh toán và quản lý</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ứng dụng di động */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="overflow-hidden rounded-[2rem] border border-[rgb(var(--color-primary)/0.12)] bg-[linear-gradient(135deg,rgba(255,255,255,1),rgba(248,250,252,1))] shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-0">
            <div className="p-8 md:p-12 lg:p-14">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[rgb(var(--color-primary))]">
                Ứng dụng cho nhân viên
              </p>
              <h2 className="mt-3 text-3xl md:text-4xl font-extrabold leading-tight text-gray-900">
                Hỗ trợ đặt món, giao món và xác nhận đơn nhanh chóng
              </h2>
              <p className="mt-4 max-w-2xl text-sm md:text-base leading-relaxed text-gray-600">
                Ứng dụng Scan2Order dành cho nhân viên vận hành tại quầy và tại bàn, giúp hỗ trợ ghi nhận món, chuyển món đến bếp,
                giao món cho khách và xác nhận đơn rõ ràng, hạn chế nhầm lẫn trong giờ cao điểm.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <a
                  href={APP_APKPURE_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center rounded-xl bg-[rgb(var(--color-accent-dark))] px-6 py-3.5 text-white font-semibold shadow-lg shadow-[rgb(var(--color-primary)/0.18)] transition-colors hover:bg-[rgb(var(--color-primary))]"
                >
                  Tải trên APKPure
                </a>
                <a
                  href={APP_DOWNLOAD_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center rounded-xl border border-[rgb(var(--color-primary)/0.2)] bg-white px-6 py-3.5 font-semibold text-[rgb(var(--color-primary))] transition-colors hover:bg-[rgb(var(--color-secondary))]"
                >
                  Tải APK trực tiếp
                </a>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {[
                  { title: "Đặt món hỗ trợ", desc: "Nhập món nhanh, giảm thao tác thủ công" },
                  { title: "Giao món rõ ràng", desc: "Theo dõi trạng thái món trong từng bước" },
                  { title: "Xác nhận đơn chuẩn", desc: "Hạn chế sai sót khi bàn giao cho khách" },
                ].map((item) => (
                  <div key={item.title} className="rounded-2xl bg-white/90 p-4 border border-[rgb(var(--color-primary)/0.08)]">
                    <p className="font-semibold text-gray-900">{item.title}</p>
                    <p className="mt-1 text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative flex items-center justify-center bg-[rgb(var(--color-secondary))] p-8 md:p-12 lg:p-14">
              <div className="w-full max-w-sm rounded-[2rem] bg-white p-6 md:p-8 shadow-[0_18px_50px_rgba(15,23,42,0.12)] border border-[rgb(var(--color-primary)/0.08)]">
                <div className="text-center">
                  <p className="text-xs font-bold uppercase tracking-[0.3em] text-[rgb(var(--color-primary))]">
                    Quét QR để tải app
                  </p>
                  <h3 className="mt-2 text-xl font-bold text-gray-900">Scan2Order</h3>
                </div>

                <div className="relative mx-auto mt-6 w-full max-w-[320px]">
                  <img
                    src={APP_QR_CODE_URL}
                    alt="QR code tải ứng dụng Scan2Order"
                    className="h-auto w-full rounded-3xl border border-gray-100 bg-white p-3"
                  />
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <div className="rounded-2xl bg-white p-2 shadow-[0_12px_30px_rgba(15,23,42,0.18)] ring-4 ring-white">
                      <img
                        src={APP_LOGO_URL}
                        alt="Logo Scan2Order"
                        className="h-16 w-16 rounded-xl object-cover"
                      />
                    </div>
                  </div>
                </div>

                <p className="mt-5 text-center text-sm text-gray-500 leading-relaxed">
                  QR code này dẫn đến trang APKPure của ứng dụng để nhân viên cài đặt nhanh chóng.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Giá trị cốt lõi */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">Giá trị mang lại</h2>
          <p className="mt-2 text-gray-500">Tại sao các nhà hàng tin tưởng lựa chọn S2O?</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {CORE_VALUES.map((value) => (
            <div key={value.title} className="p-6 rounded-2xl border border-[rgb(var(--color-primary)/0.1)] hover:border-[rgb(var(--color-primary)/0.3)] transition-all bg-white shadow-sm">
              <h3 className="text-lg font-bold text-[rgb(var(--color-primary))] mb-3">{value.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{value.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Câu chuyện về Hệ sinh thái */}
      <section className="bg-[rgb(var(--color-secondary))] border-y border-[rgb(var(--color-primary)/0.1)]">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold">Hệ sinh thái đa kênh toàn diện</h2>
              <p className="text-gray-600 leading-relaxed">
                Dự án S2O được phát triển dựa trên sự thấu hiểu sâu sắc nỗi đau của chủ doanh nghiệp F&B. Chúng tôi tạo ra một vòng lặp khép kín:
              </p>
              <div className="space-y-4">
                {[
                  { title: "Dành cho khách hàng", desc: "Không cần cài đặt, quét mã là đặt món." },
                  { title: "Dành cho vận hành", desc: "KDS (Kitchen Display System) tinh gọn trên di động." },
                  { title: "Dành cho quản lý", desc: "Báo cáo thời gian thực, quản lý kho và nhân sự tập trung." }
                ].map((item, index) => (
                  <div key={index} className="flex gap-4">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[rgb(var(--color-primary))] text-white flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </span>
                    <div>
                      <h4 className="font-semibold text-gray-900">{item.title}</h4>
                      <p className="text-sm text-gray-500">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-3xl bg-white p-8 border border-[rgb(var(--color-primary)/0.1)] shadow-inner">
              <h3 className="text-xl font-bold text-[rgb(var(--color-primary))] mb-6 text-center">Nền tảng công nghệ mạnh mẽ</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                  <span className="font-medium">Nền tảng lõi và AI</span>
                  <span className="text-sm text-gray-500 text-right">.NET Core, Python, Recommendation AI</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                  <span className="font-medium">Nền tảng giao diện</span>
                  <span className="text-sm text-gray-500">Next.js, React Native</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                  <span className="font-medium">Cơ sở dữ liệu</span>
                  <span className="text-sm text-gray-500">PostgreSQL (đa tenant)</span>
                </div>
              </div>
              <p className="mt-6 text-[13px] text-gray-400 text-center uppercase tracking-tighter">
                Đảm bảo tính ổn định - Bảo mật dữ liệu - Khả năng mở rộng
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-[rgb(var(--color-primary))]">
        <div className="max-w-6xl mx-auto px-6 py-16 text-white text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div>
              <h2 className="text-3xl font-bold">Đồng hành cùng S2O hôm nay</h2>
              <p className="mt-3 text-lg text-white/80">
                Gia nhập cộng đồng các nhà hàng thông minh cùng Scan2Order.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href={ROUTES.PAGES.PUBLIC.REGISTER}
                className="inline-flex items-center justify-center rounded-xl bg-white px-8 py-4 text-[rgb(var(--color-primary))] font-bold hover:bg-gray-100 transition-all shadow-lg"
              >
                Đăng ký tư vấn miễn phí
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}