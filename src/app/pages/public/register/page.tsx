"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Eye, EyeOff, Building2, Mail, Phone, FileText, Lock, CheckCircle2, Send } from "lucide-react";
import { toast } from "react-toastify";
import bgImage from "@/src/images/homepage/unnamed.jpg";
import logoDefault from "@/src/images/logo/logo_no_background.png";
import { ROUTES } from "@/src/constants/routes";
import { tenantService } from "@/src/services/tenantService";

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    taxNumber: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [otpCode, setOtpCode] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSendOtp = async () => {
    if (!formData.email) {
      toast.error("Vui lòng nhập email");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Email không hợp lệ");
      return;
    }

    try {
      setSendingOtp(true);
      await tenantService.sendRegisterOtp(formData.email);
      toast.success("Mã OTP đã được gửi đến email của bạn");
      setOtpSent(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể gửi OTP");
    } finally {
      setSendingOtp(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.phone || !formData.email || !formData.password || !formData.confirmPassword) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }

    if (!otpSent) {
      toast.error("Vui lòng gửi mã OTP trước");
      return;
    }

    if (!otpCode) {
      toast.error("Vui lòng nhập mã OTP");
      return;
    }

    if (!agreedToTerms) {
      toast.error("Vui lòng đồng ý với điều khoản và chính sách");
      return;
    }

    try {
      setLoading(true);
      const response = await tenantService.register({
        name: formData.name,
        phone: formData.phone,
        taxNumber: formData.taxNumber,
        email: formData.email,
        password: formData.password,
        otpCode: otpCode,
      });

      if (response.isSuccess) {
        toast.success(response.message);
        router.push(ROUTES.PAGES.PUBLIC.LOGIN);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Đăng ký thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen">
      <Image
        src={bgImage}
        alt="Register background"
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
          <div className="mt-8 lg:mt-12 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12 lg:items-center">
            {/* Left Side - Info */}
            <div className="text-white space-y-6">
              <div>
                <p className="inline-block rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider backdrop-blur-sm">
                  Bắt đầu miễn phí
                </p>
                <h1 className="mt-6 text-4xl font-bold leading-tight lg:text-5xl">
                  Tạo tài khoản<br />
                  <span className="bg-gradient-to-r from-[rgb(var(--color-accent))] to-[rgb(var(--color-accent-dark))] bg-clip-text text-transparent">
                    Scan To Order
                  </span>
                </h1>
                <p className="mt-4 max-w-lg text-base text-white/80 leading-relaxed">
                  Quản lý nhà hàng thông minh với công nghệ hiện đại. Tối ưu vận hành, 
                  nâng cao trải nghiệm khách hàng và tăng doanh thu.
                </p>
              </div>

              {/* Features */}
              <div className="hidden lg:block space-y-3">
                {[
                  "Quản lý menu và đơn hàng tự động",
                  "Thanh toán nhanh chóng, an toàn",
                  "Báo cáo chi tiết và phân tích dữ liệu",
                  "Hỗ trợ 24/7 và cập nhật miễn phí"
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-3 text-white/80">
                    <CheckCircle2 className="h-5 w-5 text-[rgb(var(--color-accent))] flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full max-w-xl lg:justify-self-end">
              <div className="rounded-2xl border border-white/10 bg-black/40 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-white sm:text-3xl">Đăng ký ngay</h2>
                  <p className="mt-2 text-sm text-white/70">
                    Đã có tài khoản?{" "}
                    <Link
                      href={ROUTES.PAGES.PUBLIC.LOGIN}
                      className="font-semibold text-[rgb(var(--color-accent))] transition-colors hover:text-[rgb(var(--color-accent-dark))] hover:underline"
                    >
                      Đăng nhập
                    </Link>
                  </p>
                </div>

                <form className="mt-8 space-y-5" onSubmit={handleRegister}>
                  {/* Tên doanh nghiệp */}
                  <div className="group">
                    <label className="mb-2 flex items-center gap-2 text-sm font-medium text-white/90">
                      <Building2 className="h-4 w-4 text-[rgb(var(--color-accent))]" />
                      Tên doanh nghiệp
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="VD: Nhà hàng ABC"
                      className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 backdrop-blur-sm transition-all focus:border-[rgb(var(--color-accent))] focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-accent))]/20"
                    />
                  </div>

                  {/* Email & OTP */}
                  <div className="group">
                    <label className="mb-2 flex items-center gap-2 text-sm font-medium text-white/90">
                      <Mail className="h-4 w-4 text-[rgb(var(--color-accent))]" />
                      Email
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="email@example.com"
                        className="flex-1 rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 backdrop-blur-sm transition-all focus:border-[rgb(var(--color-accent))] focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-accent))]/20"
                      />
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={sendingOtp || !formData.email}
                        className="group/btn relative flex items-center gap-2 overflow-hidden rounded-lg bg-gradient-to-r from-[rgb(var(--color-accent))] to-[rgb(var(--color-accent-dark))] px-5 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-[rgb(var(--color-accent))]/50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-lg whitespace-nowrap"
                      >
                        <Send className="h-4 w-4 transition-transform group-hover/btn:translate-x-0.5" />
                        {sendingOtp ? "Đang gửi..." : otpSent ? "Gửi lại" : "Gửi OTP"}
                        {otpSent && !sendingOtp && (
                          <CheckCircle2 className="h-4 w-4 text-white" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Mã OTP */}
                  <div className="group">
                    <label className="mb-2 flex items-center gap-2 text-sm font-medium text-white/90">
                      <Lock className="h-4 w-4 text-[rgb(var(--color-accent))]" />
                      Mã OTP
                    </label>
                    <input
                      type="text"
                      required
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="Nhập mã 6 số"
                      maxLength={6}
                      disabled={!otpSent}
                      className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 backdrop-blur-sm transition-all focus:border-[rgb(var(--color-accent))] focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-accent))]/20 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                    {!otpSent && (
                      <p className="mt-1.5 flex items-center gap-1.5 text-xs text-white/50">
                        <span className="inline-block h-1 w-1 rounded-full bg-white/50"></span>
                        Nhập email và nhấn &quot;Gửi OTP&quot; để nhận mã
                      </p>
                    )}
                    {otpSent && (
                      <p className="mt-1.5 flex items-center gap-1.5 text-xs text-green-400">
                        <CheckCircle2 className="h-3 w-3" />
                        Mã OTP đã được gửi đến email của bạn
                      </p>
                    )}
                  </div>

                  {/* Grid 2 columns cho Phone và Tax */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Số điện thoại */}
                    <div className="group">
                      <label className="mb-2 flex items-center gap-2 text-sm font-medium text-white/90">
                        <Phone className="h-4 w-4 text-[rgb(var(--color-accent))]" />
                        Số điện thoại
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="0123456789"
                        className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 backdrop-blur-sm transition-all focus:border-[rgb(var(--color-accent))] focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-accent))]/20"
                      />
                    </div>

                    {/* Mã số thuế */}
                    <div className="group">
                      <label className="mb-2 flex items-center gap-2 text-sm font-medium text-white/90">
                        <FileText className="h-4 w-4 text-[rgb(var(--color-accent))]" />
                        Mã số thuế
                      </label>
                      <input
                        type="text"
                        name="taxNumber"
                        value={formData.taxNumber}
                        onChange={handleInputChange}
                        placeholder="0123456789"
                        className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 backdrop-blur-sm transition-all focus:border-[rgb(var(--color-accent))] focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-accent))]/20"
                      />
                    </div>
                  </div>

                  {/* Mật khẩu */}
                  <div className="group">
                    <label className="mb-2 flex items-center gap-2 text-sm font-medium text-white/90">
                      <Lock className="h-4 w-4 text-[rgb(var(--color-accent))]" />
                      Mật khẩu
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        required
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Tối thiểu 6 ký tự"
                        className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 pr-12 text-sm text-white placeholder-white/40 backdrop-blur-sm transition-all focus:border-[rgb(var(--color-accent))] focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-accent))]/20"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
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

                  {/* Xác nhận mật khẩu */}
                  <div className="group">
                    <label className="mb-2 flex items-center gap-2 text-sm font-medium text-white/90">
                      <Lock className="h-4 w-4 text-[rgb(var(--color-accent))]" />
                      Xác nhận mật khẩu
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        required
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        placeholder="Nhập lại mật khẩu"
                        className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 pr-12 text-sm text-white placeholder-white/40 backdrop-blur-sm transition-all focus:border-[rgb(var(--color-accent))] focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-accent))]/20"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
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

                  {/* Checkbox điều khoản */}
                  <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-white/10 bg-white/5 p-4 transition-all hover:border-white/20 hover:bg-white/10">
                    <input
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="mt-0.5 h-4 w-4 flex-shrink-0 cursor-pointer rounded border-white/30 bg-white/10 text-[rgb(var(--color-accent))] transition-all focus:ring-2 focus:ring-[rgb(var(--color-accent))]/20 focus:ring-offset-0"
                    />
                    <span className="text-xs leading-relaxed text-white/70">
                      Tôi đồng ý với{" "}
                      <Link href="#" className="font-medium text-[rgb(var(--color-accent))] hover:underline">
                        Điều khoản dịch vụ
                      </Link>
                      {" "}và{" "}
                      <Link href="#" className="font-medium text-[rgb(var(--color-accent))] hover:underline">
                        Chính sách bảo mật
                      </Link>
                      {" "}của Scan To Order
                    </span>
                  </label>

                  {/* Submit button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="group/submit relative w-full overflow-hidden rounded-lg bg-gradient-to-r from-[rgb(var(--color-accent))] to-[rgb(var(--color-accent-dark))] py-3.5 text-sm font-bold text-white shadow-lg shadow-[rgb(var(--color-accent))]/30 transition-all hover:shadow-xl hover:shadow-[rgb(var(--color-accent))]/50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-lg"
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
                          Tạo tài khoản
                          <ArrowLeft className="h-4 w-4 rotate-180 transition-transform group-hover/submit:translate-x-1" />
                        </>
                      )}
                    </span>
                    <div className="absolute inset-0 -z-0 bg-gradient-to-r from-[rgb(var(--color-accent-dark))] to-[rgb(var(--color-accent))] opacity-0 transition-opacity group-hover/submit:opacity-100" />
                  </button>
                </form>

                {/* Footer */}
                <p className="mt-6 text-center text-xs text-white/50">
                  Bằng việc đăng ký, bạn đồng ý nhận email marketing từ Scan To Order
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
