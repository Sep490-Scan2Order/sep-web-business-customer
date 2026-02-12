import Link from "next/link";
import { ROUTES } from "@/src/constants/routes";

const ROLE_CARDS = [
  {
    title: "Khách hàng",
    items: [
      "Đăng nhập bằng số điện thoại",
      "Quét QR để xem menu, đặt món tại bàn hoặc mang đi",
      "Theo dõi trạng thái món ăn theo thời gian thực",
      "Đổi điểm, áp dụng voucher",
    ],
  },
  {
    title: "Nhân viên",
    items: [
      "Kiểm tra đơn bằng QR, xác nhận thanh toán tiền mặt",
      "Cập nhật trạng thái đơn, hủy/từ chối đơn",
      "KDS trên di động và quản lý trạng thái món",
      "Tạm dừng/hoạt động nhận đơn",
    ],
  },
  {
    title: "Chủ nhà hàng",
    items: [
      "Quản lý thực đơn, danh mục, tùy chỉnh menu",
      "Tạo khuyến mãi, chiến dịch giờ vàng",
      "Báo cáo doanh thu, cập nhật mã thanh toán QR",
      "Quản lý nhân viên, thông tin cửa hàng",
    ],
  },
  {
    title: "Quản trị viên",
    items: [
      "Quản lý nhà hàng và tất cả nhóm người dùng",
      "Quản lý gói dịch vụ và xử lý rút tiền",
      "Thông báo hệ thống và CMS",
      "Quản lý voucher và cảnh báo trễ phí",
    ],
  },
];

const STACK_ITEMS = [
  { label: "Server", value: "C# ASP.NET, Python" },
  { label: "Database", value: "PostgreSQL" },
  { label: "Web", value: "React/NextJS" },
  { label: "Mobile", value: "React Native" },
  { label: "AI", value: "Gợi ý món ăn (Content-based, Collaborative filtering)" },
];

export default function AboutUsPage() {
  return (
    <div className="bg-white text-gray-900">
      <section className="bg-[rgb(var(--color-secondary))] border-b border-[rgb(var(--color-primary)/0.15)]">
        <div className="max-w-6xl mx-auto px-6 py-14">
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center">
            <div>
              <p className="text-[rgb(var(--color-primary))] font-semibold tracking-wide">
                CAPSTONE PROJECT REGISTER
              </p>
              <h1 className="mt-2 text-3xl md:text-4xl font-extrabold leading-tight">
                Nền tảng SaaS quản lý nhà hàng thông minh
                <span className="text-[rgb(var(--color-primary))]"> với gọi món QR</span>
              </h1>
              <p className="mt-4 text-sm md:text-base text-gray-600 max-w-xl">
                Tên dự án: SaaS Smart Restaurant Management Platform with QR Code Ordering
                <br />
                Viết tắt: S2O (Scan2Order)
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href={ROUTES.PAGES.PUBLIC.REGISTER}
                  className="inline-flex items-center justify-center rounded-xl bg-[rgb(var(--color-accent-dark))] px-6 py-3 text-white font-semibold hover:bg-[rgb(var(--color-primary))] transition-colors"
                >
                  Đăng ký tư vấn
                </Link>
                <Link
                  href={ROUTES.PAGES.PUBLIC.PLAN}
                  className="inline-flex items-center justify-center rounded-xl border border-[rgb(var(--color-primary)/0.4)] px-6 py-3 text-[rgb(var(--color-primary))] font-semibold hover:bg-white/70 transition-colors"
                >
                  Xem bảng giá
                </Link>
              </div>
            </div>
            <div className="rounded-3xl border border-[rgb(var(--color-primary)/0.15)] bg-white shadow-sm p-6">
              <div className="flex flex-col gap-4">
                <div>
                  <p className="text-xs font-semibold text-[rgb(var(--color-primary))]">BỐI CẢNH</p>
                  <p className="mt-2 text-sm text-gray-600">
                    Nhà hàng tự phục vụ, fast-food, takeaway đang cần xử lý nhiều đơn nhanh
                    hơn, giảm nhân sự và hạn chế sai sót khi gọi món.
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-[rgb(var(--color-primary))]">MỤC TIÊU</p>
                  <p className="mt-2 text-sm text-gray-600">
                    Tăng tốc phục vụ, tự động hóa quy trình đặt món, đảm bảo thanh toán
                    trước và theo dõi đơn theo thời gian thực.
                  </p>
                </div>
                <div className="rounded-2xl bg-[rgb(var(--color-accent-light))] p-4">
                  <p className="text-sm font-semibold text-[rgb(var(--color-accent-dark))]">
                    S2O giúp cửa hàng xử lý nhiều đơn trong giờ cao điểm và không bỏ lỡ
                    khách do đợi lâu.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-8">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">
              Giải pháp SaaS đa kênh kết nối khách hàng và nhà hàng
            </h2>
            <p className="text-sm md:text-base text-gray-600">
              Phát triển nền tảng đặt món qua QR theo mô hình SaaS đa đối tượng:
              khách hàng, nhân viên, chủ nhà hàng và quản trị viên. Mỗi nhà hàng có
              dữ liệu riêng biệt, được cập nhật tập trung và mở rộng nhanh chóng.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                "Khách hàng truy cập menu trên web, không cần cài app",
                "Nhân viên sử dụng KDS để xác nhận và xử lý đơn",
                "Chủ nhà hàng quản lý menu, khuyến mãi, doanh thu",
                "Hệ thống quản trị tổng quan và tài chính",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-[rgb(var(--color-primary)/0.15)] bg-white p-4 shadow-sm"
                >
                  <p className="text-sm text-gray-700">{item}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-3xl bg-[rgb(var(--color-secondary))] p-6 border border-[rgb(var(--color-primary)/0.1)]">
            <h3 className="text-lg font-semibold text-[rgb(var(--color-primary))]">
              Điểm nhấn của giải pháp
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-gray-700">
              <li>Mô hình thanh toán trước, không xếp hàng</li>
              <li>Trạng thái món ăn cập nhật theo thời gian thực</li>
              <li>Quản lý gian hàng và danh mục nhanh gọn</li>
              <li>Hỗ trợ tăng doanh thu và tối ưu nhân sự</li>
              <li>Kiến trúc multi-tenant có mở rộng linh hoạt</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="bg-[rgb(var(--color-secondary))] border-y border-[rgb(var(--color-primary)/0.1)]">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <h2 className="text-2xl font-bold">Đối tượng sử dụng</h2>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {ROLE_CARDS.map((card) => (
              <div
                key={card.title}
                className="rounded-2xl bg-white border border-[rgb(var(--color-primary)/0.15)] p-5 shadow-sm"
              >
                <h3 className="text-base font-semibold text-[rgb(var(--color-primary))]">
                  {card.title}
                </h3>
                <ul className="mt-3 space-y-2 text-sm text-gray-600">
                  {card.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold">Yêu cầu chức năng nổi bật</h2>
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-[rgb(var(--color-primary)/0.15)] p-6">
            <h3 className="text-lg font-semibold text-[rgb(var(--color-primary))]">
              Khách hàng (Web QR)
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-gray-600">
              <li>Đăng nhập và quản lý phiên bằng số điện thoại</li>
              <li>Duyệt món theo danh mục, tìm kiếm nhanh</li>
              <li>Đặt món, ghi chú món, thanh toán online</li>
              <li>Theo dõi trạng thái món và lịch sử đơn</li>
              <li>Áp dụng voucher, đổi điểm tích lũy</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-[rgb(var(--color-primary)/0.15)] p-6">
            <h3 className="text-lg font-semibold text-[rgb(var(--color-primary))]">
              Nhân viên (Mobile)
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-gray-600">
              <li>Đăng nhập và quản lý mật khẩu</li>
              <li>Kiểm tra QR, xác nhận thanh toán tiền mặt</li>
              <li>Cập nhật trạng thái đơn, hủy/từ chối đơn</li>
              <li>KDS, bật/tắt món ăn, điều tiết lượng đơn</li>
              <li>Thống kê ca thu tiền và lịch sử đơn</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-[rgb(var(--color-primary)/0.15)] p-6">
            <h3 className="text-lg font-semibold text-[rgb(var(--color-primary))]">
              Chủ nhà hàng (Web)
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-gray-600">
              <li>Quản lý thực đơn, danh mục, tùy chỉnh menu</li>
              <li>Chiến dịch khuyến mãi, giờ vàng, xả hàng</li>
              <li>Thống kê doanh thu, xuất báo cáo PDF/Excel</li>
              <li>Quản lý nhân viên, thông tin cửa hàng</li>
              <li>Quản lý gói dịch vụ và ví tiền</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-[rgb(var(--color-primary)/0.15)] p-6">
            <h3 className="text-lg font-semibold text-[rgb(var(--color-primary))]">
              Quản trị viên (Web)
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-gray-600">
              <li>Quản lý nhà hàng và toàn bộ người dùng</li>
              <li>Quản lý gói dịch vụ, xử lý rút tiền</li>
              <li>Quản lý voucher và thông báo hệ thống</li>
              <li>Quản trị ví tiền hệ thống, chi hoa hồng</li>
              <li>Cảnh báo trễ phí doanh thu</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="bg-[rgb(var(--color-secondary))] border-y border-[rgb(var(--color-primary)/0.1)]">
        <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-8">
          <div>
            <h2 className="text-2xl font-bold">Yêu cầu phi chức năng</h2>
            <ul className="mt-4 space-y-3 text-sm text-gray-700">
              <li>Kiến trúc multi-tenant mở rộng và cách ly dữ liệu nghiêm ngặt</li>
              <li>Triển khai cloud với Docker, đảm bảo sẵn sàng cao</li>
              <li>Giao tiếp thời gian thực độ trễ thấp</li>
              <li>Bảo mật: mã hóa, JWT, phân quyền theo vai trò</li>
              <li>Giám sát, ghi log, hỗ trợ CI/CD và bảo trì</li>
            </ul>
          </div>
          <div className="rounded-3xl bg-white border border-[rgb(var(--color-primary)/0.15)] p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-[rgb(var(--color-primary))]">
              Tài liệu và sản phẩm bàn giao
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-gray-600">
              <li>User Requirements, SRS, Architecture Design</li>
              <li>Detail Design, System Implementation</li>
              <li>Testing Document, Installation Guide</li>
              <li>Source code và gói triển khai</li>
              <li>Ứng dụng Web và Mobile hoàn chỉnh</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold">Công nghệ và sản phẩm</h2>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-[rgb(var(--color-primary)/0.15)] p-6">
            <h3 className="text-lg font-semibold text-[rgb(var(--color-primary))]">
              Stack kỹ thuật
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-gray-600">
              {STACK_ITEMS.map((item) => (
                <li key={item.label}>
                  <span className="font-semibold text-gray-700">{item.label}:</span> {item.value}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-[rgb(var(--color-primary)/0.15)] p-6 bg-[rgb(var(--color-accent-light))]">
            <h3 className="text-lg font-semibold text-[rgb(var(--color-accent-dark))]">
              Sản phẩm đầu ra
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-gray-700">
              <li>Web app dành cho chủ nhà hàng và quản trị viên</li>
              <li>Web app QR dành cho khách hàng</li>
              <li>Mobile app dành cho nhân viên</li>
              <li>Module AI gợi ý món ăn và khuyến mãi</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="bg-[rgb(var(--color-primary))]">
        <div className="max-w-6xl mx-auto px-6 py-12 text-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h2 className="text-2xl font-bold">Sẵn sàng bắt đầu cùng S2O?</h2>
              <p className="mt-2 text-sm md:text-base text-white/90">
                Liên hệ để nhận tư vấn triển khai và demo hệ thống.
              </p>
            </div>
            <Link
              href={ROUTES.PAGES.PUBLIC.REGISTER}
              className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 text-[rgb(var(--color-primary))] font-semibold hover:bg-white/90 transition-colors"
            >
              Đăng ký ngay
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
