import { API } from "@/src/constants/api";
import { ApiResponse, OtpResponse, RegisterTenantRequest, TenantDto } from "@/src/types/type";

export const tenantService = {
  sendRegisterOtp: async (email: string): Promise<OtpResponse> => {
    const response = await fetch(
      `${API.BASE_URL}${API.OTP.SEND_REGISTER}?email=${encodeURIComponent(email)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Không thể gửi mã OTP");
    }

    return response.json();
  },

  register: async (data: RegisterTenantRequest): Promise<ApiResponse<TenantDto>> => {
    const response = await fetch(`${API.BASE_URL}${API.TENANT.REGISTER}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Đăng ký thất bại");
    }

    return response.json();
  },
};
