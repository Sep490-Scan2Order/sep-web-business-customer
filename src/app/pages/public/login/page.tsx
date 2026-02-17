"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Eye, EyeOff, Mail, Lock, CheckCircle2, ShieldCheck } from "lucide-react";
import bgImage from "@/src/images/homepage/unnamed.jpg";
import logoDefault from "@/src/images/logo/logo_no_background.png";
import { ROUTES } from "@/src/constants/routes";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  return (
    <div className="relative min-h-screen">
      <Image
        src={bgImage}
        alt="Login background"
        fill
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/60 to-black/70" />

      <div className="relative z-10 min-h-screen">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <Link href={ROUTES.HOME} className="flex items-center gap-3 transition-transform hover:scale-105">
              <Image
                src={logoDefault}
                alt="Scan To Order"
                width={48}
                height={48}
                className="h-12 w-12 object-contain"
              />
              <div className="text-white">
                <p className="text-lg font-bold">Scan To Order</p>
                <p className="text-xs text-white/70">Smart Restaurant Solution</p>
              </div>
            </Link>

            <Link
              href={ROUTES.HOME}
              className="group flex h-11 w-11 items-center justify-center rounded-full border-2 border-white/20 text-white backdrop-blur-sm transition-all hover:border-white/40 hover:bg-white/10"
              aria-label="Quay lại trang chủ"
            >
              <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-0.5" />
            </Link>
          </div>

          {/* Main Content */}
          <div className="mt-8 lg:mt-16 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12 lg:items-center">
            {/* Left Side - Info */}
            <div className="text-white space-y-6">
              <div>
                <p className="inline-block rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider backdrop-blur-sm">
                  Chào mừng trở lại
                </p>
                <h1 className="mt-6 text-4xl font-bold leading-tight lg:text-5xl">
                  Đăng nhập vào<br />
                  <span className="bg-gradient-to-r from-[rgb(var(--color-accent))] to-[rgb(var(--color-accent-dark))] bg-clip-text text-transparent">
                    Scan To Order
                  </span>
                </h1>
                <p className="mt-4 max-w-lg text-base text-white/80 leading-relaxed">
                  Hơn 300+ nhà hàng đang sử dụng và tin tưởng. Tối ưu vận hành, 
                  tăng trải nghiệm khách hàng và phát triển doanh nghiệp của bạn.
                </p>
              </div>

              {/* Stats */}
              <div className="hidden lg:grid grid-cols-3 gap-6 pt-6">
                {[
                  { label: "Nhà hàng", value: "300+" },
                  { label: "Đơn hàng/ngày", value: "10K+" },
                  { label: "Hài lòng", value: "98%" }
                ].map((stat, index) => (
                  <div key={index} className="space-y-1">
                    <p className="text-3xl font-bold text-[rgb(var(--color-accent))]">{stat.value}</p>
                    <p className="text-sm text-white/70">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Features */}
              <div className="hidden lg:block space-y-3 pt-4">
                {[
                  { icon: ShieldCheck, text: "Bảo mật dữ liệu tuyệt đối" },
                  { icon: CheckCircle2, text: "Đăng nhập an toàn và nhanh chóng" },
                  { icon: CheckCircle2, text: "Hỗ trợ đa nền tảng" }
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-3 text-white/80">
                    <feature.icon className="h-5 w-5 text-[rgb(var(--color-accent))] flex-shrink-0" />
                    <span className="text-sm">{feature.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full max-w-md lg:justify-self-end">
              <div className="rounded-2xl border border-white/10 bg-black/40 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-white sm:text-3xl">Đăng nhập</h2>
                  <p className="mt-2 text-sm text-white/70">
                    Chưa có tài khoản?{" "}
                    <Link
                      href={ROUTES.PAGES.PUBLIC.REGISTER}
                      className="font-semibold text-[rgb(var(--color-accent))] transition-colors hover:text-[rgb(var(--color-accent-dark))] hover:underline"
                    >
                      Đăng ký ngay
                    </Link>
                  </p>
                </div>

                <form className="mt-8 space-y-5">
                  {/* Email/Username */}
                  <div className="group">
                    <label className="mb-2 flex items-center gap-2 text-sm font-medium text-white/90">
                      <Mail className="h-4 w-4 text-[rgb(var(--color-accent))]" />
                      Email hoặc Tài khoản
                    </label>
                    <input
                      type="text"
                      placeholder="email@example.com"
                      className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 backdrop-blur-sm transition-all focus:border-[rgb(var(--color-accent))] focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-accent))]/20"
                    />
                  </div>

                  {/* Password */}
                  <div className="group">
                    <label className="mb-2 flex items-center gap-2 text-sm font-medium text-white/90">
                      <Lock className="h-4 w-4 text-[rgb(var(--color-accent))]" />
                      Mật khẩu
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Nhập mật khẩu của bạn"
                        className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 pr-12 text-sm text-white placeholder-white/40 backdrop-blur-sm transition-all focus:border-[rgb(var(--color-accent))] focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-accent))]/20"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                        aria-label="Hiển thị mật khẩu"
                      >
                        {showPassword ? (
                          <Eye className="h-5 w-5" />
                        ) : (
                          <EyeOff className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Remember me & Forgot password */}
                  <div className="flex items-center justify-between">
                    <label className="flex cursor-pointer items-center gap-2">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="h-4 w-4 cursor-pointer rounded border-white/30 bg-white/10 text-[rgb(var(--color-accent))] transition-all focus:ring-2 focus:ring-[rgb(var(--color-accent))]/20 focus:ring-offset-0"
                      />
                      <span className="text-xs text-white/70">Ghi nhớ đăng nhập</span>
                    </label>
                    <Link
                      href="#"
                      className="text-xs text-white/70 transition-colors hover:text-[rgb(var(--color-accent))] hover:underline"
                    >
                      Quên mật khẩu?
                    </Link>
                  </div>

                  {/* Submit button */}
                  <button
                    type="submit"
                    className="group/submit relative w-full overflow-hidden rounded-lg bg-gradient-to-r from-[rgb(var(--color-accent))] to-[rgb(var(--color-accent-dark))] py-3.5 text-sm font-bold text-white shadow-lg shadow-[rgb(var(--color-accent))]/30 transition-all hover:shadow-xl hover:shadow-[rgb(var(--color-accent))]/50"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      Đăng nhập
                      <ArrowLeft className="h-4 w-4 rotate-180 transition-transform group-hover/submit:translate-x-1" />
                    </span>
                    <div className="absolute inset-0 -z-0 bg-gradient-to-r from-[rgb(var(--color-accent-dark))] to-[rgb(var(--color-accent))] opacity-0 transition-opacity group-hover/submit:opacity-100" />
                  </button>

                  {/* Divider */}
                  <div className="relative py-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/10"></div>
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="px-4 text-white/60 ">
                        Hoặc tiếp tục với
                      </span>
                    </div>
                  </div>

                  {/* Social login */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      className="group flex items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-sm font-medium text-white backdrop-blur-sm transition-all hover:border-white/40 hover:bg-white/10"
                      aria-label="Đăng nhập với Facebook"
                    >
                      <svg
                        className="h-5 w-5 text-blue-500"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                      </svg>
                      <span className="hidden sm:inline">Facebook</span>
                    </button>
                    <button
                      type="button"
                      className="group flex items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-sm font-medium text-white backdrop-blur-sm transition-all hover:border-white/40 hover:bg-white/10"
                      aria-label="Đăng nhập với Google"
                    >
                      <svg
                        className="h-5 w-5 text-red-500"
                        fill="currentColor"
                        viewBox="0 0 16 16"
                      >
                        <path d="M15.545 6.558a9.4 9.4 0 0 1 .139 1.626c0 2.434-.87 4.492-2.384 5.885h.002C11.978 15.292 10.158 16 8 16A8 8 0 1 1 8 0a7.7 7.7 0 0 1 5.352 2.082l-2.284 2.284A4.35 4.35 0 0 0 8 3.166c-2.087 0-3.86 1.408-4.492 3.304a4.8 4.8 0 0 0 0 3.063h.003c.635 1.893 2.405 3.301 4.492 3.301 1.078 0 2.004-.276 2.722-.764h-.003a3.7 3.7 0 0 0 1.599-2.431H8v-3.08z" />
                      </svg>
                      <span className="hidden sm:inline">Google</span>
                    </button>
                  </div>
                </form>

                {/* Footer */}
                <p className="mt-6 text-center text-xs text-white/50">
                  Bằng việc đăng nhập, bạn đồng ý với{" "}
                  <Link href="#" className="text-[rgb(var(--color-accent))] hover:underline">
                    Điều khoản dịch vụ
                  </Link>
                  {" "}và{" "}
                  <Link href="#" className="text-[rgb(var(--color-accent))] hover:underline">
                    Chính sách bảo mật
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
