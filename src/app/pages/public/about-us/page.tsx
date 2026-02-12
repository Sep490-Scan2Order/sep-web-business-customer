import Link from "next/link";
import { ROUTES } from "@/src/constants/routes";

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
    description: "Ứng dụng kiến trúc Multi-tenant hiện đại và AI gợi ý món ăn để cá nhân hóa hành trình thực khách.",
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
                    "Trở thành nền tảng công nghệ hàng đầu hỗ trợ các mô hình Self-service, Fast-food và Takeaway tại Việt Nam, kết nối hàng triệu thực khách với những trải nghiệm ẩm thực số hóa."
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
                  { title: "Dành cho quản lý", desc: "Báo cáo Real-time, quản lý kho và nhân sự tập trung." }
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
                  <span className="font-medium">Backend & AI</span>
                  <span className="text-sm text-gray-500 text-right">.NET Core, Python, Recommendation AI</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                  <span className="font-medium">Frontend</span>
                  <span className="text-sm text-gray-500">Next.js, React Native</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                  <span className="font-medium">Cơ sở dữ liệu</span>
                  <span className="text-sm text-gray-500">PostgreSQL (Multi-tenant)</span>
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