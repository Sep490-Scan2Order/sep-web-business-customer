"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Mail,
  Lock,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { toast } from "react-toastify";
import bgImage from "@/src/images/homepage/unnamed.jpg";
import logoDefault from "@/src/images/logo/logo_no_background.png";
import { ROUTES } from "@/src/constants/routes";
import { API } from "@/src/constants/api";
import apiClient from "@/src/services/apiClient";
import { getApiErrorMessage, PASSWORD_POLICY_MESSAGE, PASSWORD_POLICY_REGEX } from "@/src/utils/utils";

type Step = "email" | "otp" | "password";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>("email");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    otpCode: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [resetToken, setResetToken] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Bước 1: Gửi email để nhận OTP
  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email) {
      toast.error("Vui lòng nhập email");
      return;
    }

    try {
      setLoading(true);
      const response = await apiClient.post<any>(
        API.TENANT.SEND_EMAIL_FORGET_PASSWORD(formData.email),
        {}
      );

      if (response.data?.isSuccess) {
        toast.success("OTP đã được gửi đến email của bạn");
        setCurrentStep("otp");
      } else {
        toast.error(response.data?.message || "Gửi email thất bại");
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Gửi email thất bại"
      );
    } finally {
      setLoading(false);
    }
  };

  // Bước 2: Xác thực OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.otpCode) {
      toast.error("Vui lòng nhập mã OTP");
      return;
    }

    try {
      setLoading(true);
      const response = await apiClient.post<any>(
        API.TENANT.VERIFY_OTP_FORGET_PASSWORD,
        {
          email: formData.email,
          otpCode: formData.otpCode,
        }
      );

      if (response.data?.isSuccess) {
        // Lấy mã đặt lại mật khẩu từ dữ liệu trả về
        const token = response.data?.data;
        if (token) {
          setResetToken(token);
          toast.success("Xác thực OTP thành công");
          setCurrentStep("password");
        } else {
          toast.error("Không thể lấy mã đặt lại mật khẩu");
        }
      } else {
        toast.error(response.data?.message || "Xác thực OTP thất bại");
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Xác thực OTP thất bại"
      );
    } finally {
      setLoading(false);
    }
  };

  // Bước 3: Đặt lại mật khẩu
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.newPassword || !formData.confirmPassword) {
      toast.error("Vui lòng điền đầy đủ mật khẩu");
      return;
    }

    if (!PASSWORD_POLICY_REGEX.test(formData.newPassword)) {
      toast.error(PASSWORD_POLICY_MESSAGE);
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }

    try {
      setLoading(true);
      const response = await apiClient.post<any>(
        API.TENANT.COMPLETE_FORGET_PASSWORD,
        {
          email: formData.email,
          newPassword: formData.newPassword,
          confirmPassword: formData.confirmPassword,
          resetToken: resetToken,
        }
      );

      if (response.data?.isSuccess) {
        toast.success("Đặt lại mật khẩu thành công");
        // Chuyển hướng về trang đăng nhập
        setTimeout(() => {
          router.push(ROUTES.PAGES.PUBLIC.LOGIN);
        }, 1500);
      } else {
        toast.error(response.data?.message || "Đặt lại mật khẩu thất bại");
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error) || "Đặt lại mật khẩu thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen">
      <Image
        src={bgImage}
        alt="Nền quên mật khẩu"
        fill
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/60 to-black/70" />

      <div className="relative z-10 min-h-screen">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {/* Phần đầu trang */}
          <div className="flex items-center justify-between">
            <Link
              href={ROUTES.HOME}
              className="flex items-center gap-3 transition-transform hover:scale-105"
            >
              <Image
                src={logoDefault}
                alt="Scan To Order"
                width={48}
                height={48}
                className="h-12 w-12 object-contain"
              />
              <div className="text-white">
                <p className="text-lg font-bold">Scan To Order</p>
                <p className="text-xs text-white/70">Giải pháp nhà hàng thông minh</p>
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

          {/* Nội dung chính */}
          <div className="mt-8 lg:mt-16 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12 lg:items-center">
            {/* Cột trái - Thông tin */}
            <div className="text-white space-y-6">
              <div>
                <p className="inline-block rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider backdrop-blur-sm">
                  Lấy lại quyền truy cập
                </p>
                <h1 className="mt-6 text-4xl font-bold leading-tight lg:text-5xl">
                  Đặt lại<br />
                  <span className="bg-gradient-to-r from-[rgb(var(--color-accent))] to-[rgb(var(--color-accent-dark))] bg-clip-text text-transparent">
                    Mật khẩu
                  </span>
                </h1>
                <p className="mt-4 max-w-lg text-base text-white/80 leading-relaxed">
                  Bảo vệ tài khoản của bạn bằng cách đặt lại mật khẩu một cách an toàn và nhanh chóng.
                </p>
              </div>

              {/* Thống kê */}
              <div className="hidden lg:grid grid-cols-3 gap-6 pt-6">
                {[
                  { label: "Nhà hàng", value: "300+" },
                  { label: "Đơn hàng/ngày", value: "10K+" },
                  { label: "Hài lòng", value: "98%" },
                ].map((stat, index) => (
                  <div key={index} className="space-y-1">
                    <p className="text-3xl font-bold text-[rgb(var(--color-accent))]">
                      {stat.value}
                    </p>
                    <p className="text-sm text-white/70">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Điểm nổi bật */}
              <div className="hidden lg:block space-y-3 pt-4">
                {[
                  { icon: ShieldCheck, text: "Bảo mật dữ liệu tuyệt đối" },
                  { icon: CheckCircle2, text: "Xác minh qua OTP an toàn" },
                  { icon: CheckCircle2, text: "Hỗ trợ đa nền tảng" },
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-3 text-white/80">
                    <feature.icon className="h-5 w-5 text-[rgb(var(--color-accent))] flex-shrink-0" />
                    <span className="text-sm">{feature.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Cột phải - Biểu mẫu */}
            <div className="w-full max-w-md lg:justify-self-end">
              <div className="rounded-2xl border border-white/10 bg-black/40 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-white sm:text-3xl">
                    {currentStep === "email" && "Nhập Email"}
                    {currentStep === "otp" && "Xác thực OTP"}
                    {currentStep === "password" && "Đặt lại Mật khẩu"}
                  </h2>
                  <p className="mt-2 text-sm text-white/70">
                    {currentStep === "email" &&
                      "Nhập email được liên kết với tài khoản của bạn"}
                    {currentStep === "otp" &&
                      "Nhập mã OTP được gửi đến email của bạn"}
                    {currentStep === "password" &&
                      "Tạo mật khẩu mới cho tài khoản của bạn"}
                  </p>
                </div>

                {/* Các bước tiến trình */}
                <div className="mt-6 flex items-center justify-between">
                  {["email", "otp", "password"].map((step, index) => (
                    <React.Fragment key={step}>
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full font-bold transition-all ${
                          step === currentStep
                            ? "bg-[rgb(var(--color-accent))] text-white"
                            : ["email", "otp", "password"].indexOf(step) <
                              ["email", "otp", "password"].indexOf(currentStep)
                            ? "bg-[rgb(var(--color-accent))]/50 text-white"
                            : "bg-white/10 text-white/50"
                        }`}
                      >
                        {index + 1}
                      </div>
                      {index < 2 && (
                        <div
                          className={`flex-1 h-1 mx-2 rounded-full transition-all ${
                            ["email", "otp", "password"].indexOf(step) <
                            ["email", "otp", "password"].indexOf(currentStep)
                              ? "bg-[rgb(var(--color-accent))]"
                              : "bg-white/10"
                          }`}
                        />
                      )}
                    </React.Fragment>
                  ))}
                </div>

                {/* Bước 1: Email */}
                {currentStep === "email" && (
                  <form className="mt-8 space-y-5" onSubmit={handleSendEmail}>
                    <div className="group">
                      <label className="mb-2 flex items-center gap-2 text-sm font-medium text-white/90">
                        <Mail className="h-4 w-4 text-[rgb(var(--color-accent))]" />
                        Địa chỉ Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="ten@nhahang.vn"
                        className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 backdrop-blur-sm transition-all focus:border-[rgb(var(--color-accent))] focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-accent))]/20"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="group/submit relative w-full overflow-hidden rounded-lg bg-gradient-to-r from-[rgb(var(--color-accent))] to-[rgb(var(--color-accent-dark))] py-3.5 text-sm font-bold text-white shadow-lg shadow-[rgb(var(--color-accent))]/30 transition-all hover:shadow-xl hover:shadow-[rgb(var(--color-accent))]/50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-lg"
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        {loading ? (
                          <>
                            <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                                fill="none"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              />
                            </svg>
                            Đang gửi...
                          </>
                        ) : (
                          <>
                            Tiếp tục
                            <ArrowRight className="h-4 w-4 transition-transform group-hover/submit:translate-x-1" />
                          </>
                        )}
                      </span>
                      <div className="absolute inset-0 -z-0 bg-gradient-to-r from-[rgb(var(--color-accent-dark))] to-[rgb(var(--color-accent))] opacity-0 transition-opacity group-hover/submit:opacity-100" />
                    </button>

                    <div className="text-center pt-4">
                      <p className="text-sm text-white/70">
                        Bạn nhớ mật khẩu?{" "}
                        <Link
                          href={ROUTES.PAGES.PUBLIC.LOGIN}
                          className="font-semibold text-[rgb(var(--color-accent))] transition-colors hover:text-[rgb(var(--color-accent-dark))] hover:underline"
                        >
                          Đăng nhập
                        </Link>
                      </p>
                    </div>
                  </form>
                )}

                {/* Bước 2: OTP */}
                {currentStep === "otp" && (
                  <form className="mt-8 space-y-5" onSubmit={handleVerifyOtp}>
                    <div className="group">
                      <label className="mb-2 flex items-center gap-2 text-sm font-medium text-white/90">
                        <Lock className="h-4 w-4 text-[rgb(var(--color-accent))]" />
                        Mã OTP
                      </label>
                      <input
                        type="text"
                        name="otpCode"
                        value={formData.otpCode}
                        onChange={handleInputChange}
                        placeholder="Nhập mã OTP 6 chữ số"
                        maxLength={6}
                        className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 backdrop-blur-sm transition-all focus:border-[rgb(var(--color-accent))] focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-accent))]/20"
                      />
                    </div>

                    <div className="pt-2">
                      <p className="text-xs text-white/60">
                        OTP đã được gửi đến{" "}
                        <span className="font-semibold text-white/80">
                          {formData.email}
                        </span>
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="group/submit relative w-full overflow-hidden rounded-lg bg-gradient-to-r from-[rgb(var(--color-accent))] to-[rgb(var(--color-accent-dark))] py-3.5 text-sm font-bold text-white shadow-lg shadow-[rgb(var(--color-accent))]/30 transition-all hover:shadow-xl hover:shadow-[rgb(var(--color-accent))]/50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-lg"
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        {loading ? (
                          <>
                            <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                                fill="none"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              />
                            </svg>
                            Đang xác thực...
                          </>
                        ) : (
                          <>
                            Xác thực
                            <ArrowRight className="h-4 w-4 transition-transform group-hover/submit:translate-x-1" />
                          </>
                        )}
                      </span>
                      <div className="absolute inset-0 -z-0 bg-gradient-to-r from-[rgb(var(--color-accent-dark))] to-[rgb(var(--color-accent))] opacity-0 transition-opacity group-hover/submit:opacity-100" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setCurrentStep("email")}
                      className="w-full text-sm font-medium text-[rgb(var(--color-accent))] transition-colors hover:text-[rgb(var(--color-accent-dark))] hover:underline"
                    >
                      Thay đổi email
                    </button>
                  </form>
                )}

                {/* Bước 3: Mật khẩu */}
                {currentStep === "password" && (
                  <form
                    className="mt-8 space-y-5"
                    onSubmit={handleResetPassword}
                  >
                    <div className="group">
                      <label className="mb-2 flex items-center gap-2 text-sm font-medium text-white/90">
                        <Lock className="h-4 w-4 text-[rgb(var(--color-accent))]" />
                        Mật khẩu mới
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          name="newPassword"
                          value={formData.newPassword}
                          onChange={handleInputChange}
                          placeholder="Nhập mật khẩu mới"
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

                    <div className="group">
                      <label className="mb-2 flex items-center gap-2 text-sm font-medium text-white/90">
                        <Lock className="h-4 w-4 text-[rgb(var(--color-accent))]" />
                        Xác nhận mật khẩu
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          placeholder="Xác nhận mật khẩu"
                          className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 pr-12 text-sm text-white placeholder-white/40 backdrop-blur-sm transition-all focus:border-[rgb(var(--color-accent))] focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-accent))]/20"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword((prev) => !prev)
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                          aria-label="Hiển thị mật khẩu"
                        >
                          {showConfirmPassword ? (
                            <Eye className="h-5 w-5" />
                          ) : (
                            <EyeOff className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="group/submit relative w-full overflow-hidden rounded-lg bg-gradient-to-r from-[rgb(var(--color-accent))] to-[rgb(var(--color-accent-dark))] py-3.5 text-sm font-bold text-white shadow-lg shadow-[rgb(var(--color-accent))]/30 transition-all hover:shadow-xl hover:shadow-[rgb(var(--color-accent))]/50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-lg"
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        {loading ? (
                          <>
                            <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                                fill="none"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              />
                            </svg>
                            Đang đặt lại...
                          </>
                        ) : (
                          <>
                            Đặt lại mật khẩu
                            <ArrowRight className="h-4 w-4 transition-transform group-hover/submit:translate-x-1" />
                          </>
                        )}
                      </span>
                      <div className="absolute inset-0 -z-0 bg-gradient-to-r from-[rgb(var(--color-accent-dark))] to-[rgb(var(--color-accent))] opacity-0 transition-opacity group-hover/submit:opacity-100" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setCurrentStep("otp")}
                      className="w-full text-sm font-medium text-[rgb(var(--color-accent))] transition-colors hover:text-[rgb(var(--color-accent-dark))] hover:underline"
                    >
                      Quay lại nhập OTP
                    </button>
                  </form>
                )}

                {/* Chân trang */}
                <p className="mt-6 text-center text-xs text-white/50">
                  Cần trợ giúp?{" "}
                  <Link href="#" className="text-[rgb(var(--color-accent))] hover:underline">
                    Liên hệ hỗ trợ
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
