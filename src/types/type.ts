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
  avatar?: string;
  [key: string]: any; // Để hỗ trợ các field khác từ token
}

export interface LoginResponse {
  token: string;
  user?: User;
}

export interface TenantLoginResponse {
  accessToken: string;
  refreshToken: string;
  userInfo: UserInfo;
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

export interface AdministratorLoginRequest {
  email: string;
  password: string;
}

export interface UserInfo {
  id: string;
  accountId: string;
  name: string | null;
  email: string;
  phone: string;
  role: string;
  avatar: string | null;
  isActive: boolean;
  verified: boolean;
  taxNumber: string | null;
  bankId: string;
  cardNumber: string;
  bankName: string;
  bankLogo: string;
  isVerifyBank: boolean;
  isVerifyTax: boolean;
  debtStartedAt: string | null;
  subscriptionExpiryDate: string | null;
  lastWarningSentAt: string | null;
  totalDebtAmount: number;
  planName: string;
  totalRestaurants: number;
  totalDishes: number;
  totalCategories: number;
  createdAt?: string;
}

export interface AdministratorLoginResponse {
  accessToken: string;
  refreshToken: string;
  userInfo: UserInfo;
}

export interface SystemBlogDto {
  id?: number;
  systemBlogId?: number;
  title: string;
  createdAt: string;
  updatedAt: string;
  totalViews: number;
  blogType: string;
  content?: string;
  colorTitle?: string;
  imageUrl?: string | string[];
}

// Blog Type Enum
export enum BlogType {
  Announcement = 1,
  Promotion = 2,
  Update = 3,
  Event = 4,
  Other = 5
}

// Add System Blog Request
export interface AddSystemBlogDtoRequest {
  content: string;
  title: string;
  colorTitle: string;
  images?: File[];
  blogType: BlogType;
}

// Add System Blog Response
export interface AddSystemBlogDtoResponse {
  systemBlogId: number;
  content: string;
  title: string;
  colorTitle: string;
  createdAt: string;
  updatedAt: string;
  totalViews: number;
  imageUrl: string;
  blogType: BlogType;
}


export interface BankInfo{
   id: string;
   name: string;
   code: string;
   bin: number;
   short_name: string;
   logo_url: string;
   icon_url: string;
   swift_code: string;
   lookup_supported: number;
}
