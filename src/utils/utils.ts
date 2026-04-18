//# Các hàm helper xử lý chuỗi, ngày tháng, format

type ApiLikeErrorBody = {
  message?: unknown;
  isSuccess?: unknown;
};

type AxiosErrorLike = {
  response?: {
    data?: ApiLikeErrorBody;
  };
  message?: unknown;
};

function isAxiosErrorLike(error: unknown): error is AxiosErrorLike {
  return typeof error === "object" && error !== null && "response" in error;
}

export const PASSWORD_POLICY_REGEX =
  /^(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/;

export const PASSWORD_POLICY_MESSAGE =
  "Mật khẩu không hợp lệ. Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ in hoa, số và ký tự đặc biệt.";

export function getApiErrorMessage(error: unknown): string | undefined {
  if (isAxiosErrorLike(error)) {
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
