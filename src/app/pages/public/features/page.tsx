import Link from "next/link";
import { ROUTES } from "@/src/constants/routes";

const FEATURE_GROUPS = [
  {
    title: "Trải nghiệm Khách hàng (Web QR)",
    description:
      "Số hóa hành trình thực khách từ lúc bước vào nhà hàng đến khi thanh toán, hoàn toàn trên trình duyệt.",
    items: [
      "Quét mã gọi món tức thì, không cần tải ứng dụng",
      "Thanh toán đa phương thức (Chuyển khoản, Ví điện tử) trước khi dùng",
      "Theo dõi tiến độ chế biến món ăn theo thời gian thực",
      "Hệ thống tích điểm tự động và áp dụng mã giảm giá thông minh",
      "Gợi ý món ăn cá nhân hóa dựa trên sở thích (AI Powered)",
    ],
  },
  {
    title: "Vận hành Nhân viên (Mobile KDS)",
    description:
      "Tối ưu hóa quy trình phối hợp giữa phục vụ và bếp, giảm thiểu 99% sai sót nhầm đơn.",
    items: [
      "Hệ thống hiển thị bếp (KDS) ngay trên thiết bị di động",
      "Nhận thông báo đơn hàng mới tức thì qua SignalR/Socket",
      "Quản lý trạng thái món (Chờ cung ứng, Đang nấu, Đã xong)",
      "Kiểm soát tồn kho Real-time, tự động ẩn món khi hết hàng",
      "Bàn giao ca và đối soát dòng tiền mặt nhanh chóng",
    ],
  },
  {
    title: "Quản trị Nhà hàng (Dashboard)",
    description:
      "Kiểm soát toàn diện mọi hoạt động kinh doanh thông qua số liệu trực quan.",
    items: [
      "Thiết lập Menu số linh hoạt, thay đổi giá trong 30 giây",
      "Công cụ Marketing: Tạo chiến dịch Flash sale, Giờ vàng",
      "Báo cáo chuyên sâu doanh thu, món bán chạy (Heatmap)",
      "Quản lý phân quyền nhân sự chặt chẽ theo vai trò",
      "Tích hợp ví điện tử và quản lý dòng tiền rút về",
    ],
  },
  {
    title: "Quản trị Hệ thống (Admin SaaS)",
    description:
      "Giải pháp quản lý đa điểm dành cho đơn vị vận hành nền tảng hoặc chuỗi lớn.",
    items: [
      "Phê duyệt và Onboarding nhà hàng mới chỉ với vài click",
      "Quản lý các gói đăng ký dịch vụ (Subscription Control)",
      "Hệ thống CMS quản trị nội dung và thông báo toàn trang",
      "Giám sát giao dịch tài chính và đối soát phí nền tảng",
      "Hệ thống cảnh báo tự động khi phát hiện trễ phí hoặc sự cố",
    ],
  },
];

const HIGHLIGHTS = [
  {
    title: "Pre-paid Model",
    content: "Mô hình thanh toán trước giúp tối ưu dòng vốn và giảm rủi ro hủy đơn.",
  },
  {
    title: "Multi-tenant Architecture",
    content: "Dữ liệu tách biệt tuyệt đối giữa các nhà hàng, đảm bảo tính bảo mật và riêng tư.",
  },
  {
    title: "High Scalability",
    content: "Dễ dàng mở rộng từ 1 cửa hàng lên chuỗi 100 cửa hàng mà không thay đổi cấu trúc.",
  },
  {
    title: "Real-time Sync",
    content: "Đồng bộ hóa dữ liệu tức thời giữa khách hàng - bếp - quản lý.",
  },
];

const MODULES = [
  "Gọi món không chạm (Contactless Ordering)",
  "Thanh toán trực tuyến tích hợp QR Pay",
  "Hệ thống điều phối bếp thông minh",
  "Quản lý thực đơn, trạng thái món",
  "Phân tích dữ liệu kinh doanh (Analytics)",
  "Hệ thống Loyalty & Membership",
];

export default function FeaturesPage() {
  return (
    <div className="bg-white text-gray-900">
      {/* Hero Section */}
      <section className="bg-[rgb(var(--color-secondary))] border-b border-[rgb(var(--color-primary)/0.15)]">
        <div className="max-w-6xl mx-auto px-6 py-14">
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center">
            <div>
              <p className="text-[rgb(var(--color-primary))] font-bold tracking-widest text-sm uppercase">
                Giải pháp đột phá
              </p>
              <h1 className="mt-2 text-3xl md:text-5xl font-extrabold leading-tight">
                Tính năng mạnh mẽ cho
                <span className="text-[rgb(var(--color-primary))]"> nhà hàng số 4.0</span>
              </h1>
              <p className="mt-4 text-sm md:text-base text-gray-600 max-w-xl leading-relaxed">
                S2O mang đến hệ sinh thái tính năng toàn diện, giúp bạn tập trung vào chất lượng món ăn, 
                trong khi chúng tôi tự động hóa quy trình vận hành.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href={ROUTES.PAGES.PUBLIC.REGISTER}
                  className="inline-flex items-center justify-center rounded-xl bg-[rgb(var(--color-accent-dark))] px-6 py-3 text-white font-semibold hover:bg-[rgb(var(--color-primary))] transition-all shadow-md"
                >
                  Dùng thử miễn phí
                </Link>
                <Link
                  href={ROUTES.PAGES.PUBLIC.PLAN}
                  className="inline-flex items-center justify-center rounded-xl border border-[rgb(var(--color-primary)/0.4)] px-6 py-3 text-[rgb(var(--color-primary))] font-semibold hover:bg-white/70 transition-colors"
                >
                  Tìm hiểu các gói
                </Link>
              </div>
            </div>
            <div className="rounded-3xl border border-[rgb(var(--color-primary)/0.15)] bg-white shadow-xl p-6">
              <h3 className="text-lg font-bold text-[rgb(var(--color-primary))] mb-4 flex items-center gap-2">
                <span className="w-2 h-6 bg-[rgb(var(--color-primary))] rounded-full"></span>
                Giá trị cốt lõi
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {HIGHLIGHTS.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-[rgb(var(--color-primary)/0.12)] bg-[rgb(var(--color-accent-light))] p-4 hover:scale-[1.02] transition-transform"
                  >
                    <p className="text-sm font-bold text-[rgb(var(--color-accent-dark))]">
                      {item.title}
                    </p>
                    <p className="mt-2 text-xs text-gray-700 leading-snug">{item.content}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modules Overview */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-12">
          <div>
            <h2 className="text-3xl font-bold">Mọi công cụ bạn cần để thành công</h2>
            <p className="mt-4 text-sm md:text-base text-gray-600 leading-relaxed">
              Chúng tôi không chỉ cung cấp phần mềm, chúng tôi cung cấp giải pháp tăng trưởng. 
              Mỗi module được thiết kế để giải quyết trực tiếp các vấn đề nhức nhối trong vận hành F&B truyền thống.
            </p>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
              {MODULES.map((module) => (
                <div
                  key={module}
                  className="flex items-center gap-3 rounded-2xl border border-[rgb(var(--color-primary)/0.1)] bg-white p-4 shadow-sm hover:border-[rgb(var(--color-primary))] transition-colors"
                >
                  <span className="text-[rgb(var(--color-primary))]">✔</span>
                  <p className="text-sm font-medium text-gray-700">{module}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-3xl bg-[rgb(var(--color-secondary))] p-8 border border-[rgb(var(--color-primary)/0.1)] flex flex-col justify-center">
            <h3 className="text-xl font-bold text-[rgb(var(--color-primary))]">
              Lợi ích khi số hóa cùng S2O
            </h3>
            <ul className="mt-6 space-y-4 text-sm text-gray-700">
              <li className="flex gap-3">
                <span className="font-bold text-[rgb(var(--color-primary))]">01.</span>
                <span>Tăng 30% tốc độ phục vụ bằng cách loại bỏ quy trình chờ đợi ghi đơn.</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-[rgb(var(--color-primary))]">02.</span>
                <span>Tiết kiệm ít nhất 2 nhân sự trực quầy/ca trực thông qua việc khách tự phục vụ.</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-[rgb(var(--color-primary))]">03.</span>
                <span>Chống thất thoát tuyệt đối nhờ hệ thống thanh toán trước và báo cáo real-time.</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-[rgb(var(--color-primary))]">04.</span>
                <span>Xây dựng lòng trung thành khách hàng qua hệ thống Voucher và Point tự động.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Group Details */}
      <section className="bg-[rgb(var(--color-secondary))] border-y border-[rgb(var(--color-primary)/0.1)]">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold">Chi tiết tính năng theo phân quyền</h2>
            <p className="text-gray-500 mt-2">Được tối ưu cho từng bộ phận trong nhà hàng</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {FEATURE_GROUPS.map((group) => (
              <div
                key={group.title}
                className="rounded-2xl bg-white border border-[rgb(var(--color-primary)/0.1)] p-8 shadow-sm hover:shadow-md transition-shadow"
              >
                <h3 className="text-xl font-bold text-[rgb(var(--color-primary))]">
                  {group.title}
                </h3>
                <p className="mt-3 text-sm text-gray-500 italic leading-relaxed">{group.description}</p>
                <ul className="mt-6 space-y-3">
                  {group.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-[rgb(var(--color-primary))] mt-1">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security & Scalability */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center">
          <div>
            <h2 className="text-3xl font-bold">Nền tảng Cloud tin cậy</h2>
            <p className="mt-4 text-sm md:text-base text-gray-600 leading-relaxed">
              Chúng tôi sử dụng công nghệ tiên tiến nhất để đảm bảo hệ thống của bạn 
              luôn hoạt động 24/7 với độ bảo mật tối đa.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {[
                "JWT & RBAC Security",
                "Dockerized Infrastructure",
                "Realtime WebSockets",
                "Data Isolation",
                "Automated Backup",
              ].map((tech) => (
                <span key={tech} className="rounded-full bg-gray-50 border border-gray-200 px-5 py-2 text-sm font-medium text-gray-700">
                  {tech}
                </span>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border-2 border-dashed border-[rgb(var(--color-primary)/0.3)] p-8 bg-gray-50">
            <h3 className="text-lg font-bold text-[rgb(var(--color-primary))] mb-4">
              Cam kết vận hành
            </h3>
            <div className="space-y-4 text-sm text-gray-600">
              <p>✔ <strong>Uptime 99.9%:</strong> Hệ thống luôn sẵn sàng phục vụ khách hàng.</p>
              <p>✔ <strong>Cập nhật liên tục:</strong> Nhận các tính năng mới mà không tốn phí bảo trì.</p>
              <p>✔ <strong>Hỗ trợ kỹ thuật:</strong> Đội ngũ hỗ trợ triển khai tận nơi và online.</p>
            </div>
            <Link
              href={ROUTES.PAGES.PUBLIC.REGISTER}
              className="mt-8 inline-flex w-full items-center justify-center rounded-xl bg-[rgb(var(--color-primary))] px-6 py-4 text-white font-bold hover:opacity-90 transition-opacity"
            >
              Yêu cầu Demo ngay
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="bg-[rgb(var(--color-primary))]">
        <div className="max-w-6xl mx-auto px-6 py-14 text-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-bold">Bắt đầu hành trình số hóa ngay hôm nay</h2>
              <p className="mt-3 text-white/80">
                Chỉ mất 5 phút để thiết lập gian hàng đầu tiên và bắt đầu nhận đơn qua mã QR.
              </p>
            </div>
            <Link
              href={ROUTES.PAGES.PUBLIC.REGISTER}
              className="inline-flex items-center justify-center rounded-xl bg-white px-10 py-4 text-[rgb(var(--color-primary))] font-bold hover:bg-gray-100 transition-colors shadow-lg"
            >
              Liên hệ chúng tôi
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}