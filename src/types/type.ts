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
  errors?: any;
  timestamp?: string;
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

export interface SendForgotPasswordRequest {
  email: string;
}

export interface VerifyForgotPasswordOtpRequest {
  email: string;
  otpCode: string;
}

export interface CompleteForgotPasswordRequest {
  email: string;
  newPassword: string;
  resetToken: string;
}

export interface ResetPasswordResponse {
  resetToken?: string;
  [key: string]: any;
}

export interface ProvinceSummary {
  code: number;
  name: string;
  districts?: DistrictSummary[];
}

export interface DistrictSummary {
  code: number;
  name: string;
}

export interface CreateRestaurantRequest {
  restaurantName: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  image?: File;
  phone?: string;
  description?: string;
}

export interface Restaurant {
  id: number;
  tenantId: string;
  restaurantName: string;
  address: string;
  longitude: number;
  latitude: number;
  image: string;
  phone: string;
  description: string;
  profileUrl: string;
  qrMenu: string;
  isActive: boolean;
  isOpened: boolean;
  isReceivingOrders: boolean;
  totalOrder: number;
  createdAt: string;
  distanceKm: number | null;
}