import React from "react";
import Image from "next/image";
import ws1 from "@/src/images/homepage/workingsection_1.png";
import ws2 from "@/src/images/homepage/workingsection_2.png";
import ws3 from "@/src/images/homepage/workingsection_3.png";
import ws4 from "@/src/images/homepage/workingsection_4.png";
import ws5 from "@/src/images/homepage/workingsection_5.png";

export default function WorkingSection() {
  return (
    <section className="bg-white py-14">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center">
          <p className="text-emerald-700 text-sm md:text-base italic">
            Giải pháp tối ưu cho nhà hàng của bạn
          </p>
          <h2 className="mt-2 text-2xl md:text-3xl font-bold text-emerald-800">
            Scan to Order hoạt động như thế nào?
          </h2>
        </div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="relative md:col-span-2 h-60 md:h-64 overflow-hidden rounded-2xl shadow">
            <Image
              src={ws1}
              alt="Quét QR"
              fill
              className="object-cover"
              sizes="(min-width: 768px) 66vw, 100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
            <p className="absolute bottom-4 left-4 text-white text-lg font-semibold">
              Quét QR
            </p>
          </div>

          <div className="relative md:col-span-1 h-60 md:h-64 overflow-hidden rounded-2xl shadow">
            <Image
              src={ws2}
              alt="Xem Menu Gọi món"
              fill
              className="object-cover"
              sizes="(min-width: 768px) 33vw, 100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
            <p className="absolute bottom-4 left-4 text-white text-lg font-semibold leading-snug">
              Xem Menu gọi món
            </p>
          </div>

          <div className="relative h-44 md:h-48 overflow-hidden rounded-2xl shadow">
            <Image
              src={ws3}
              alt="Bếp nhận đơn"
              fill
              className="object-cover"
              sizes="(min-width: 768px) 33vw, 100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
            <p className="absolute bottom-4 left-4 text-white text-lg font-semibold">
              Bếp nhận đơn
            </p>
          </div>

          <div className="relative h-44 md:h-48 overflow-hidden rounded-2xl shadow">
            <Image
              src={ws4}
              alt="Thanh toán"
              fill
              className="object-cover"
              sizes="(min-width: 768px) 33vw, 100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
            <p className="absolute bottom-4 left-4 text-white text-lg font-semibold">
              Thanh toán
            </p>
          </div>

          <div className="relative h-44 md:h-48 overflow-hidden rounded-2xl shadow">
            <Image
              src={ws5}
              alt="Đánh giá"
              fill
              className="object-cover"
              sizes="(min-width: 768px) 33vw, 100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
            <p className="absolute bottom-4 left-4 text-white text-lg font-semibold">
              Đánh giá
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
