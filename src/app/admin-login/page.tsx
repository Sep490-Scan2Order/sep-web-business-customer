"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Eye, EyeOff, Mail, Lock, CheckCircle2, ShieldCheck } from "lucide-react";
import { toast } from "react-toastify";
import bgImage from "@/src/images/homepage/unnamed.jpg";
import logoDefault from "@/src/images/logo/logo_no_background.png";
import { ROUTES } from "@/src/constants/routes";
import { API } from "@/src/constants/api";
import apiClient from "@/src/services/apiClient";
import { useAuthStore } from "@/src/store/authStore";
import { AdministratorLoginRequest, AdministratorLoginResponse, ApiResponse } from "@/src/types/type";

export default function AdminLoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<AdministratorLoginRequest>({
    email: "",
    password: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    try {
      setLoading(true);
      const response = await apiClient.post<ApiResponse<AdministratorLoginResponse>>(
        API.AUTH.ADMINISTRATOR_LOGIN,
        formData
      );

      if (response.data?.isSuccess && response.data.data) {
        const { accessToken, refreshToken, userInfo } = response.data.data;

        // Luu full userInfo de dong bo voi store
        const user = {
          ...userInfo,
          email: userInfo.email || formData.email,
          avatar: userInfo.avatar || undefined,
        };

        // Lưu token và user vào store (sẽ tự động lưu accessToken vào localStorage)
        setAuth(user, accessToken);

        // Lưu refreshToken riêng vào localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('refreshToken', refreshToken);
        }

        console.log("Admin login successful:", user);
        toast.success("Đăng nhập thành công");

        // Redirect đến trang admin
        router.push("/admin/overview");
      } else {
        toast.error(response.data?.message || "Đăng nhập thất bại");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen">
      <Image
        src={bgImage}
        alt="Nền đăng nhập quản trị"
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
                <p className="text-xs text-white/70">Cổng quản trị viên</p>
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
                <p className="inline-block rounded-full bg-red-500/20 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider backdrop-blur-sm border border-red-500/30">
                  Truy cập quản trị
                </p>
                <h1 className="mt-6 text-4xl font-bold leading-tight lg:text-5xl">
                  Đăng nhập<br />
                  <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                    Quản Trị Viên
                  </span>
                </h1>
                <p className="mt-4 max-w-lg text-base text-white/80 leading-relaxed">
                  Truy cập hệ thống quản trị toàn bộ nền tảng Scan To Order.
                  Quản lý người dùng, nhà hàng, và cấu hình hệ thống.
                </p>
              </div>

              {/* Stats */}
              <div className="hidden lg:grid grid-cols-3 gap-6 pt-6">
                {[
                  { label: "Nhà hàng", value: "300+" },
                  { label: "Người dùng", value: "5K+" },
                  { label: "Thời gian hoạt động", value: "99.9%" }
                ].map((stat, index) => (
                  <div key={index} className="space-y-1">
                    <p className="text-3xl font-bold text-red-500">{stat.value}</p>
                    <p className="text-sm text-white/70">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Features */}
              <div className="hidden lg:block space-y-3 pt-4">
                {[
                  { icon: ShieldCheck, text: "Bảo mật cấp cao với xác thực 2FA" },
                  { icon: CheckCircle2, text: "Quản lý toàn bộ hệ thống" },
                  { icon: CheckCircle2, text: "Giám sát và phân tích thời gian thực" }
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-3 text-white/80">
                    <feature.icon className="h-5 w-5 text-red-500 flex-shrink-0" />
                    <span className="text-sm">{feature.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full max-w-md lg:justify-self-end">
              <div className="rounded-2xl border border-red-500/20 bg-black/40 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 border border-red-500/20">
                    <ShieldCheck className="h-8 w-8 text-red-500" />
                  </div>
                  <h2 className="text-2xl font-bold text-white sm:text-3xl">Đăng nhập quản trị</h2>
                  <p className="mt-2 text-sm text-white/70">
                    Nhập thông tin đăng nhập quản trị viên
                  </p>
                </div>

                <form className="mt-8 space-y-5" onSubmit={handleLogin}>
                  {/* Email */}
                  <div className="group">
                    <label className="mb-2 flex items-center gap-2 text-sm font-medium text-white/90">
                      <Mail className="h-4 w-4 text-red-500" />
                      Email quản trị
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="admin@example.com"
                      className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 backdrop-blur-sm transition-all focus:border-red-500 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                    />
                  </div>

                  {/* Password */}
                  <div className="group">
                    <label className="mb-2 flex items-center gap-2 text-sm font-medium text-white/90">
                      <Lock className="h-4 w-4 text-red-500" />
                      Mật khẩu
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Nhập mật khẩu quản trị"
                        className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 pr-12 text-sm text-white placeholder-white/40 backdrop-blur-sm transition-all focus:border-red-500 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-red-500/20"
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

                  {/* Remember me */}
                  <div className="flex items-center justify-between">
                    <label className="flex cursor-pointer items-center gap-2">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="h-4 w-4 cursor-pointer rounded border-white/30 bg-white/10 text-red-500 transition-all focus:ring-2 focus:ring-red-500/20 focus:ring-offset-0"
                      />
                      <span className="text-xs text-white/70">Ghi nhớ đăng nhập</span>
                    </label>
                  </div>

                  {/* Submit button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="group/submit relative w-full overflow-hidden rounded-lg bg-gradient-to-r from-red-500 to-orange-500 py-3.5 text-sm font-bold text-white shadow-lg shadow-red-500/30 transition-all hover:shadow-xl hover:shadow-red-500/50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-lg"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {loading ? (
                        <>
                          <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Đang xử lý...
                        </>
                      ) : (
                        <>
                          Đăng nhập
                          <ArrowLeft className="h-4 w-4 rotate-180 transition-transform group-hover/submit:translate-x-1" />
                        </>
                      )}
                    </span>
                    <div className="absolute inset-0 -z-0 bg-gradient-to-r from-orange-500 to-red-500 opacity-0 transition-opacity group-hover/submit:opacity-100" />
                  </button>
                </form>

                {/* Footer */}
                <div className="mt-6 space-y-3">
                  <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3">
                    <p className="text-xs text-white/70 text-center">
                      <ShieldCheck className="inline h-3.5 w-3.5 mr-1" />
                      Trang này chỉ dành cho quản trị viên hệ thống
                    </p>
                  </div>
                  <p className="text-center text-xs text-white/50">
                    Bạn là chủ nhà hàng?{" "}
                    <Link href={ROUTES.PAGES.PUBLIC.LOGIN} className="text-red-500 hover:underline">
                      Đăng nhập tại đây
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
