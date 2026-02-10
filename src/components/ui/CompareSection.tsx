import React from "react";
import Image from "next/image";
import menuGiay from "@/src/images/homepage/menuGiay.png";
import menuOrder from "@/src/images/homepage/menuOrder.png";

export default function CompareSection() {
  return (
    <section className="bg-white py-14">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-[rgb(var(--color-primary))]">
            So sánh trước & sau khi dùng Scan to Order
          </h2>
          <div className="mx-auto mt-2 h-[2px] w-40 bg-[rgb(var(--color-primary)/0.4)]" />
        </div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-center text-lg font-semibold text-gray-900 mb-4">
              Truyền Thống
            </h3>
            <div className="rounded-2xl border border-gray-200 shadow overflow-hidden bg-white">
              <div className="relative h-[240px]">
                <Image
                  src={menuGiay}
                  alt="Truyền thống"
                  fill
                  className="object-cover"
                  sizes="(min-width: 768px) 50vw, 100vw"
                />
              </div>
              <div className="bg-rose-100/60 px-5 py-4">
                <ul className="list-disc pl-5 text-sm md:text-base text-gray-800 space-y-1">
                  <li>Menu giấy dễ cũ, khó cập nhật</li>
                  <li>Phải gọi nhân viên để order</li>
                  <li>Ghi tay, dễ nhầm món</li>
                  <li>Khách chờ lâu, giảm trải nghiệm</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-center text-lg font-semibold text-gray-900 mb-4">
              Scan To Order
            </h3>
            <div className="rounded-2xl border border-gray-200 shadow overflow-hidden bg-white">
              <div className="relative h-[240px]">
                <Image
                  src={menuOrder}
                  alt="Scan to Order"
                  fill
                  className="object-cover"
                  sizes="(min-width: 768px) 50vw, 100vw"
                />
              </div>
              <div className="bg-[rgb(var(--color-accent-light))] px-5 py-4">
                <ul className="list-disc pl-5 text-sm md:text-base text-gray-800 space-y-1">
                  <li>Menu QR cập nhật theo thời gian thực</li>
                  <li>Khách gọi món ngay trên điện thoại</li>
                  <li>Đơn hàng chuyển thẳng vào bếp</li>
                  <li>Phục vụ nhanh, chính xác, chuyên nghiệp</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <p className="mt-8 text-center text-[rgb(var(--color-accent-dark))] italic text-base md:text-lg font-semibold">
          Tạo nên những kỷ niệm cùng chúng tôi
        </p>
      </div>
    </section>
  );
}
