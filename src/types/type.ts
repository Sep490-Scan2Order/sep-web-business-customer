//# Định nghĩa interface/type từ API .NET

export interface RegisterTenantRequest {
  name: string;
  phone: string;
  taxNumber: string;
  email: string;
  password: string;
  otpCode: string;
}

export interface TenantDto {
  id: string;
  name: string;
  phone: string;
  email: string;
  taxNumber?: string;
}

export interface ApiResponse<T> {
  isSuccess: boolean;
  message: string;
  data?: T;
}

export interface OtpResponse {
  isSuccess: boolean;
  message: string;
}