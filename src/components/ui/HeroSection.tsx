import Link from "next/link";
import HeroSection_1 from "@/src/images/homepage/herosection_1.png";
import HeroSection_2 from "@/src/images/homepage/herosection_2.png";
import HeroSection_3 from "@/src/images/homepage/herosection_3.png";
import Image from "next/image";

export default function HeroSection() {
  return (
    <section className="bg-[#f6f3ec] border-t border-emerald-800/40">
      <div className="max-w-6xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-10 items-center">
          <div>
            <p className="text-emerald-800 font-semibold tracking-wide">
              QUẢN LÝ NHÀ HÀNG THÔNG MINH
            </p>
            <h1 className="mt-2 text-3xl md:text-4xl font-extrabold leading-tight text-gray-900">
              TỐI ƯU VẬN HÀNH
              <br />
              <span className="text-emerald-800">VỚI QR CODE</span>
            </h1>
            <p className="mt-4 text-sm md:text-base text-gray-600 max-w-md">
              Loại bỏ menu giấy, giảm nhân sự, tăng tốc phục vụ với hệ thống
              Scan to Order cho nhà hàng
            </p>
            <Link
              href="#"
              className="inline-flex mt-6 items-center justify-center rounded-xl bg-emerald-700 px-6 py-3 text-white font-semibold hover:bg-emerald-800 transition-colors"
            >
              Dùng thử miễn phí
            </Link>
          </div>

          <div className="grid grid-cols-[1fr_1fr] gap-4">
            <div className="flex flex-col gap-4">
              <div className="overflow-hidden bg-white shadow rounded-tl-[28px] rounded-tr-none rounded-bl-none rounded-br-none">
                <Image
                  src={HeroSection_1}
                  alt="Scan QR"
                  className="h-40 w-full object-cover"
                />
              </div>
              <div className="overflow-hidden bg-white shadow rounded-bl-[28px] rounded-tr-none rounded-tl-none rounded-br-none">
                <Image
                  src={HeroSection_2}
                  alt="Mobile menu"
                  className="h-44 w-full object-cover"
                />
              </div>
            </div>
            <div className="overflow-hidden bg-white shadow rounded-tr-[28px] rounded-br-[28px] rounded-tl-none rounded-bl-none">
              <Image
                src={HeroSection_3}
                alt="Dashboard"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
