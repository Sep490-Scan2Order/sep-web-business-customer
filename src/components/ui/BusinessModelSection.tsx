import React from "react";
import Image from "next/image";
import bm1 from "@/src/images/homepage/business_model_section_1.jpg";
import bm2 from "@/src/images/homepage/business_model_section_2.jpg";
import bm3 from "@/src/images/homepage/business_model_section_3.jpg";
import bm4 from "@/src/images/homepage/business_model_section_4.jpg";

const items = [
  { src: bm1, label: "Nhà Hàng" },
  { src: bm2, label: "Chuỗi FnB" },
  { src: bm3, label: "Quán Ăn Nhanh" },
  { src: bm4, label: "Bar & Pub" },
];

export default function BusinessMModelSection() {
  return (
    <section className="bg-white py-14">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-emerald-800">
            Phù Hợp Với Mô Hình Kinh Doanh
          </h2>
          <div className="mx-auto mt-2 h-[2px] w-24 bg-emerald-800/40" />
        </div>

        <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-6">
          {items.map((item) => (
            <div key={item.label} className="flex flex-col items-center">
              <div className="relative w-full max-w-[180px] md:max-w-[200px] h-[270px] md:h-[300px] overflow-hidden rounded-[28px] shadow">
                <Image
                  src={item.src}
                  alt={item.label}
                  fill
                  className="object-cover"
                  sizes="(min-width: 768px) 200px, 45vw"
                />
              </div>
              <p className="mt-3 text-sm md:text-base font-semibold text-gray-700">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
