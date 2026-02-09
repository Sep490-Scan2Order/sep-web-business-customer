import Link from "next/link";
import { fetchPlansMock } from "@/src/Test/testData";
import { ROUTES } from "@/src/constants/routes";

const formatPrice = (value: number) =>
  new Intl.NumberFormat("vi-VN").format(value);

export default async function PlanPage() {
  const plans = await fetchPlansMock();
  const activePlans = plans.filter((plan) => plan.Status === 1);

  return (
    <div>
      <section className="bg-[#f6f3ec] border-t border-emerald-800/40">
        <div className="max-w-6xl mx-auto px-6 py-14">
          <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-10 items-center">
            <div>
              <p className="text-emerald-800 font-semibold tracking-wide">
                GÓI DỊCH VỤ SCAN TO ORDER
              </p>
              <h1 className="mt-2 text-3xl md:text-4xl font-extrabold leading-tight text-gray-900">
                Bảng giá linh hoạt
                <br />
                <span className="text-emerald-800">cho mọi quy mô nhà hàng</span>
              </h1>
              <p className="mt-4 text-sm md:text-base text-gray-600 max-w-md">
                Chọn gói phù hợp, bắt đầu nhanh và nâng cấp khi cần. Mọi gói đều
                đi kèm hỗ trợ thiết lập menu và đào tạo nhân viên.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link
                  href={ROUTES.PAGES.PUBLIC.REGISTER}
                  className="inline-flex items-center justify-center rounded-xl bg-emerald-700 px-6 py-3 text-white font-semibold hover:bg-emerald-800 transition-colors"
                >
                  Dùng thử miễn phí
                </Link>
                <Link
                  href={ROUTES.PAGES.PUBLIC.LOGIN}
                  className="inline-flex items-center justify-center rounded-xl border border-emerald-700 px-6 py-3 text-emerald-800 font-semibold hover:bg-emerald-50 transition-colors"
                >
                  Đăng nhập
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {["Giảm 30% thời gian gọi món", "Tăng 20% giá trị đơn", "Tối ưu nhân sự", "Báo cáo realtime"].map(
                (item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-emerald-100 bg-white/80 px-4 py-5 shadow-sm"
                  >
                    <p className="text-sm font-semibold text-emerald-800">{item}</p>
                    <p className="mt-2 text-xs text-gray-600">
                      Theo dữ liệu vận hành trung bình của khách hàng.
                    </p>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-14">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-emerald-800">
              Chọn gói phù hợp với bạn
            </h2>
            <div className="mx-auto mt-3 h-[2px] w-28 bg-emerald-800/40" />
            <p className="mt-5 text-sm md:text-base text-gray-600">
              Giá đã bao gồm hỗ trợ khởi tạo và cập nhật tính năng mới nhất.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            {activePlans.map((plan) => (
              <div
                key={plan.PlanId}
                className={`relative rounded-2xl border px-6 py-7 shadow-sm transition-transform hover:-translate-y-1 ${
                  plan.IsPopular
                    ? "border-emerald-500 bg-emerald-50/60 shadow-lg"
                    : "border-emerald-100 bg-white"
                }`}
              >
                {plan.IsPopular && (
                  <span className="absolute -top-3 left-6 rounded-full bg-emerald-700 px-3 py-1 text-xs font-semibold text-white">
                    Phổ biến nhất
                  </span>
                )}
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-emerald-800">
                    {plan.Name}
                  </h3>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                    {plan.Tag}
                  </span>
                </div>
                <p className="mt-2 text-sm text-gray-600">{plan.Description}</p>

                <div className="mt-6 flex items-end gap-2">
                  <span className="text-3xl font-extrabold text-gray-900">
                    {formatPrice(plan.Price)}đ
                  </span>
                  <span className="text-sm text-gray-600">/tháng</span>
                </div>
                <p className="mt-2 text-xs text-emerald-700">
                  Cam kết tối thiểu {plan.DurationMonths} tháng
                </p>

                <ul className="mt-5 space-y-2 text-sm text-gray-700">
                  {plan.Features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <span className="mt-2 h-2 w-2 rounded-full bg-emerald-600" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={ROUTES.PAGES.PUBLIC.REGISTER}
                  className={`mt-6 inline-flex w-full items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
                    plan.IsPopular
                      ? "bg-emerald-700 text-white hover:bg-emerald-800"
                      : "border border-emerald-700 text-emerald-800 hover:bg-emerald-50"
                  }`}
                >
                  Bắt đầu ngay
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-emerald-800 py-12">
        <div className="max-w-6xl mx-auto px-6 text-center text-white">
          <h3 className="text-2xl md:text-3xl font-bold">
            Cần tư vấn gói phù hợp?
          </h3>
          <p className="mt-3 text-sm md:text-base text-emerald-100">
            Đội ngũ chúng tôi sẽ khảo sát mô hình, gợi ý gói tối ưu chi phí nhất.
          </p>
          <Link
            href={ROUTES.PAGES.PUBLIC.REGISTER}
            className="mt-6 inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 text-emerald-800 font-semibold hover:bg-emerald-50 transition-colors"
          >
            Nhận tư vấn miễn phí
          </Link>
        </div>
      </section>
    </div>
  );
}
