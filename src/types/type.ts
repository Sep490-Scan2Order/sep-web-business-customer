//# Định nghĩa interface/type từ API .NET

export interface RegisterTenantRequest {
  name: string;
  phone: string;
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

export interface TenantLoginRequest{
  email: string;
  password: string;
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

export interface User {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  role?: string;
  [key: string]: any; // Để hỗ trợ các field khác từ token
}

export interface LoginResponse {
  token: string;
  user?: User;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setAuth: (user: User | null, token: string | null) => void;
  logout: () => void;
}