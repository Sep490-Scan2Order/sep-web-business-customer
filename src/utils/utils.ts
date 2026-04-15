//# Các hàm helper xử lý chuỗi, ngày tháng, format

import axios from "axios";

type ApiLikeErrorBody = {
  message?: unknown;
  isSuccess?: unknown;
};

export const PASSWORD_POLICY_REGEX =
  /^(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/;

export const PASSWORD_POLICY_MESSAGE =
  "Mật khẩu không hợp lệ. Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ in hoa, số và ký tự đặc biệt.";

export function getApiErrorMessage(error: unknown): string | undefined {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiLikeErrorBody | undefined;
    const message = data?.message;
    if (typeof message === "string" && message.trim()) return message.trim();

    if (typeof error.message === "string" && error.message.trim())
      return error.message.trim();

    return undefined;
  }

  if (error instanceof Error) return error.message;
  return undefined;
}