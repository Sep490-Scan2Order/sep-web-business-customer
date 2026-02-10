import React from "react";
import { Clock, Users, TrendingUp, FileText } from "lucide-react";

const benefits = [
  {
    icon: Clock,
    title: "30 – 50%",
    desc: "Giảm thời gian gọi món",
  },
  {
    icon: Users,
    title: "Giảm 1 – 2 nhân sự",
    desc: "Giảm áp lực phục vụ giờ cao điểm",
  },
  {
    icon: TrendingUp,
    title: "+15 – 25%",
    desc: "Tăng giá trị mỗi đơn hàng",
  },
  {
    icon: FileText,
    title: "Menu giấy",
    desc: "Tiết kiệm chi phí in ấn & cập nhật",
  },
];

export default function WhyChooseSection() {
  return (
    <section className="bg-white py-14">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-[rgb(var(--color-primary))]">
            Vì sao nhà hàng chuyển sang Scan to Order?
          </h2>
          <div className="mx-auto mt-3 h-[2px] w-28 bg-[rgb(var(--color-primary)/0.4)]" />
          <p className="mt-5 text-sm md:text-base text-[rgb(var(--color-primary))] font-semibold">
            Không chỉ tiện lợi cho khách hàng, Scan to Order còn giúp nhà hàng
            tối ưu chi phí và tăng hiệu quả vận hành.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
          {benefits.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="rounded-2xl bg-[rgb(var(--color-accent-light))] border border-[rgb(var(--color-primary)/0.15)] px-4 py-5 text-center shadow-sm"
              >
                <div className="mx-auto mb-3 h-10 w-10 rounded-full bg-white flex items-center justify-center text-gray-900">
                  <Icon className="h-5 w-5" />
                </div>
                <p className="text-lg font-bold text-gray-900">{item.title}</p>
                <p className="mt-1 text-sm text-gray-700">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
