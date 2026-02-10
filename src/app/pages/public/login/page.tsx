"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import bgImage from "@/src/images/homepage/unnamed.jpg";
import logoDefault from "@/src/images/logo/logo_no_background.png";
import { ROUTES } from "@/src/constants/routes";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative min-h-screen">
      <Image
        src={bgImage}
        alt="Login background"
        fill
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-black/55" />

      <div className="relative z-10 min-h-screen">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <div className="flex items-center justify-between">
            <Link href={ROUTES.HOME} className="flex items-center gap-3">
              <Image
                src={logoDefault}
                alt="Scan To Order"
                width={56}
                height={56}
                className="h-12 w-12 object-contain"
              />
              <div className="text-white">
                <p className="text-lg font-semibold">Scan To Order</p>
                <p className="text-xs text-white/80">Smart Restaurant</p>
              </div>
            </Link>

            <Link
              href={ROUTES.HOME}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 text-white hover:bg-white/10"
              aria-label="Quay lại trang chủ"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-12 md:grid-cols-2 md:items-center">
            <div className="text-white">
              <p className="text-sm uppercase tracking-[0.3em] text-white/70">
                Scan To Order
              </p>
              <h1 className="mt-6 text-4xl font-semibold">300+ nhà hàng</h1>
              <p className="mt-3 max-w-md text-sm text-white/80">
                Hãy tối ưu trải nghiệm của bạn, có thêm nhiều khách hàng và đồng
                hành cùng chúng tôi
              </p>
            </div>

            <div className="w-full max-w-md justify-self-end rounded-3xl border border-white/15 bg-black/45 p-8 text-white shadow-xl backdrop-blur">
              <h2 className="text-2xl font-semibold text-center">Đăng nhập</h2>
              <p className="mt-2 text-sm text-white/70 text-center">
                Bạn chưa là thành viên?{" "}
                <Link
                  href={ROUTES.PAGES.PUBLIC.REGISTER}
                  className="text-[rgb(var(--color-accent))] hover:text-[rgb(var(--color-accent-dark))]"
                >
                  Đăng ký
                </Link>
              </p>

              <form className="mt-8 space-y-6">
                <div>
                  <label className="text-sm text-white/80">Tài khoản</label>
                  <input
                    type="text"
                    placeholder="Nhập tài khoản"
                    className="mt-2 w-full border-b border-white/40 bg-transparent pb-2 text-sm text-white placeholder-white/40 focus:border-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-sm text-white/80">Mật khẩu</label>
                  <div className="mt-2 flex items-center gap-2 border-b border-white/40 pb-2">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Nhập mật khẩu"
                      className="w-full bg-transparent text-sm text-white placeholder-white/40 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="text-white/70 hover:text-white"
                      aria-label="Hiển thị mật khẩu"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-white/70">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-white/40 bg-transparent text-[rgb(var(--color-accent))] focus:ring-1 focus:ring-[rgb(var(--color-accent))]"
                    />
                    Lưu đăng nhập
                  </label>
                  <Link href="#" className="hover:text-white">
                    Quên mật khẩu?
                  </Link>
                </div>

                <button
                  type="submit"
                  className="w-full rounded-full bg-[rgb(var(--color-accent))] py-3 text-sm font-semibold text-white hover:bg-[rgb(var(--color-accent-dark))]"
                >
                  Đăng nhập
                </button>
              </form>

              <div className="mt-8 text-center text-xs text-white/60">
                <span className="px-3">tiếp tục với</span>
              </div>

              <div className="mt-4 flex items-center justify-center gap-4">
                <button
                  type="button"
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-blue-600 shadow"
                  aria-label="Đăng nhập Facebook"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    className="lucide lucide-facebook-icon lucide-facebook"
                  >
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                </button>
                <button
                  type="button"
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-red-500 shadow"
                  aria-label="Đăng nhập Google"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    className="bi bi-google"
                    viewBox="0 0 16 16"
                  >
                    <path d="M15.545 6.558a9.4 9.4 0 0 1 .139 1.626c0 2.434-.87 4.492-2.384 5.885h.002C11.978 15.292 10.158 16 8 16A8 8 0 1 1 8 0a7.7 7.7 0 0 1 5.352 2.082l-2.284 2.284A4.35 4.35 0 0 0 8 3.166c-2.087 0-3.86 1.408-4.492 3.304a4.8 4.8 0 0 0 0 3.063h.003c.635 1.893 2.405 3.301 4.492 3.301 1.078 0 2.004-.276 2.722-.764h-.003a3.7 3.7 0 0 0 1.599-2.431H8v-3.08z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
