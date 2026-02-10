"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import bgImage from "@/src/images/homepage/unnamed.jpg";
import logoDefault from "@/src/images/logo/logo_no_background.png";
import { ROUTES } from "@/src/constants/routes";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="relative min-h-screen">
      <Image
        src={bgImage}
        alt="Register background"
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
              <h1 className="mt-6 text-4xl font-semibold">Bắt đầu ngay</h1>
              <p className="mt-3 max-w-md text-sm text-white/80">
                Tạo tài khoản để quản lý nhà hàng thông minh, tối ưu vận hành và
                tăng trải nghiệm khách hàng.
              </p>
            </div>

            <div className="w-full max-w-md justify-self-end rounded-3xl border border-white/15 bg-black/45 p-8 text-white shadow-xl backdrop-blur">
              <h2 className="text-2xl font-semibold text-center">Đăng ký</h2>
              <p className="mt-2 text-sm text-white/70 text-center">
                Đã có tài khoản?{" "}
                <Link
                  href={ROUTES.PAGES.PUBLIC.LOGIN}
                  className="text-[rgb(var(--color-accent))] hover:text-[rgb(var(--color-accent-dark))]"
                >
                  Đăng nhập
                </Link>
              </p>

              <form className="mt-8 space-y-6">
                <div>
                  <label className="text-sm text-white/80">Họ và tên</label>
                  <input
                    type="text"
                    placeholder="Nhập họ và tên"
                    className="mt-2 w-full border-b border-white/40 bg-transparent pb-2 text-sm text-white placeholder-white/40 focus:border-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-sm text-white/80">Email</label>
                  <input
                    type="email"
                    placeholder="Nhập email"
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

                <div>
                  <label className="text-sm text-white/80">Xác nhận mật khẩu</label>
                  <div className="mt-2 flex items-center gap-2 border-b border-white/40 pb-2">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Nhập lại mật khẩu"
                      className="w-full bg-transparent text-sm text-white placeholder-white/40 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      className="text-white/70 hover:text-white"
                      aria-label="Hiển thị mật khẩu xác nhận"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                <label className="flex items-start gap-2 text-xs text-white/70">
                  <input
                    type="checkbox"
                    className="mt-0.5 h-4 w-4 rounded border-white/40 bg-transparent text-[rgb(var(--color-accent))] focus:ring-1 focus:ring-[rgb(var(--color-accent))]"
                  />
                  Tôi đồng ý với các điều khoản và chính sách của Scan To Order.
                </label>

                <button
                  type="submit"
                  className="w-full rounded-full bg-[rgb(var(--color-accent))] py-3 text-sm font-semibold text-white hover:bg-[rgb(var(--color-accent-dark))]"
                >
                  Tạo tài khoản
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
