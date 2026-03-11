"use client";

import { useState } from "react";
import apiClient from "@/src/services/apiClient";
import { API } from "@/src/constants/api";

const PDF_WEB_URL =
  "https://ysafyqmiutvhohvsthnt.supabase.co/storage/v1/object/public/term-and-policies/s2o-terms-and-policies.pdf";
const PDF_DOWNLOAD_URL = "/documents/s2o-terms-and-policies.pdf";
const ADMIN_EMAIL = "administrator@scan2order.id.vn";

const SUBJECTS = [
  "Tư vấn về dịch vụ",
  "Hỏi về điều khoản sử dụng",
  "Tranh chấp thanh toán",
  "Hoàn tiền / Khiếu nại",
  "Báo lỗi hệ thống",
  "Vấn đề tài khoản",
  "Khác",
];

export default function TermsAndPoliciesPage() {
  const [form, setForm] = useState({ from: "", subject: SUBJECTS[0], body: "" });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const payload = {
        from: form.from,
        subject: form.subject,
        htmlContent: `To: ${ADMIN_EMAIL}<br/>From: ${form.from}<br/><br/>${form.body}`,
      };

      const response = await apiClient.post(API.EMAIL.GUEST_SEND, payload);
      const result = response.data;

      if (result?.isSuccess && result?.data === true) {
        setSubmitted(true);
        setForm({ from: "", subject: SUBJECTS[0], body: "" });
      } else {
        setErrorMessage(result?.message || "Gửi email thất bại. Vui lòng thử lại.");
      }
    } catch {
      setErrorMessage("Không thể kết nối hệ thống email. Vui lòng thử lại sau.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Hero */}
      <section className="bg-[rgb(var(--color-secondary))] border-b border-[rgb(var(--color-primary)/0.15)]">
        <div className="max-w-6xl mx-auto px-6 py-14">
          <p className="text-[rgb(var(--color-primary))] font-semibold tracking-wide uppercase text-sm">
            Điều khoản & chính sách
          </p>
          <h1 className="mt-2 text-3xl md:text-5xl font-extrabold leading-tight">
            Cam kết minh bạch trong
            <span className="text-[rgb(var(--color-primary))]"> mọi trải nghiệm sử dụng</span>
          </h1>
          <p className="mt-4 text-sm md:text-base text-gray-600 max-w-3xl leading-relaxed">
            Trang này quy định các điều khoản sử dụng dịch vụ Scan2Order, chính sách dữ liệu,
            trách nhiệm của các bên và các nguyên tắc thanh toán. Vui lòng đọc kỹ trước khi
            đăng ký hoặc tiếp tục sử dụng nền tảng.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={PDF_WEB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-xl bg-[rgb(var(--color-accent-dark))] px-6 py-3 text-white font-semibold hover:bg-[rgb(var(--color-primary))] transition-colors"
            >
              PDF Online
            </a>
            <a
              href={PDF_DOWNLOAD_URL}
              download
              className="inline-flex items-center justify-center rounded-xl border border-[rgb(var(--color-primary)/0.4)] px-6 py-3 text-[rgb(var(--color-primary))] font-semibold hover:bg-white/70 transition-colors"
            >
              Tải PDF
            </a>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_480px] gap-12 items-start">
          {/* Left: intro */}
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-[rgb(var(--color-primary))] mb-4">
              Bạn có thắc mắc?
            </h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              Nếu bạn có câu hỏi về điều khoản, chính sách, hoặc cần hỗ trợ liên quan đến dịch vụ
              Scan2Order, hãy gửi yêu cầu đến chúng tôi. Đội ngũ hỗ trợ sẽ phản hồi trong thời
              gian sớm nhất.
            </p>
            <div className="space-y-3 text-sm text-gray-700">
              <p className="flex items-center gap-2">
                <span className="text-[rgb(var(--color-primary))] font-bold">📧</span>
                administrator@scan2order.id.vn
              </p>
              <p className="flex items-center gap-2">
                <span className="text-[rgb(var(--color-primary))] font-bold">🕐</span>
                Hỗ trợ 24/7
              </p>
            </div>
          </div>

          {/* Right: form */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
            {submitted ? (
              <div className="text-center py-8">
                <p className="text-2xl mb-2">✅</p>
                <p className="font-bold text-gray-900 text-lg">Yêu cầu đã được gửi!</p>
                <p className="text-sm text-gray-500 mt-2">Chúng tôi sẽ phản hồi sớm nhất có thể.</p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-6 text-sm text-[rgb(var(--color-primary))] underline"
                >
                  Gửi yêu cầu khác
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {errorMessage ? (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {errorMessage}
                  </div>
                ) : null}

                <div>
                  <label className="block text-sm font-semibold text-[rgb(var(--color-primary))] mb-1.5">
                    Email hoặc tên của bạn
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ví dụ: emailcuatoi@gmail.com"
                    value={form.from}
                    onChange={(e) => setForm({ ...form, from: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[rgb(var(--color-primary))] focus:ring-2 focus:ring-[rgb(var(--color-primary)/0.15)] transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[rgb(var(--color-primary))] mb-1.5">
                    Chủ đề cần hỗ trợ
                  </label>
                  <select
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-[rgb(var(--color-primary))] focus:ring-2 focus:ring-[rgb(var(--color-primary)/0.15)] transition bg-white"
                  >
                    {SUBJECTS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[rgb(var(--color-primary))] mb-1.5">
                    Nội dung chi tiết
                  </label>
                  <textarea
                    required
                    rows={5}
                    placeholder="Mô tả vấn đề, hành động bạn đã thực hiện và thông tin bổ sung nếu có..."
                    value={form.body}
                    onChange={(e) => setForm({ ...form, body: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[rgb(var(--color-primary))] focus:ring-2 focus:ring-[rgb(var(--color-primary)/0.15)] transition resize-y"
                  />
                </div>

                <div className="flex items-center justify-between gap-4 pt-1">
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Bằng việc gửi yêu cầu, bạn đồng ý với{" "}
                    <a
                      href={PDF_WEB_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[rgb(var(--color-primary))] underline"
                    >
                      chính sách bảo mật
                    </a>{" "}
                    của S2O.
                  </p>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-shrink-0 inline-flex items-center justify-center rounded-xl bg-[rgb(var(--color-primary))] px-6 py-3 text-white font-semibold text-sm hover:bg-[rgb(var(--color-accent-dark))] transition-colors"
                  >
                    {isSubmitting ? "Đang gửi..." : "Gửi yêu cầu"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
