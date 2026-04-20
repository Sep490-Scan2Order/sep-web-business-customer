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

export interface TenantLoginRequest {
  email: string;
  password: string;
}

export interface ApiResponse<T> {
  isSuccess: boolean;
  message: string;
  data?: T;
  errors?: unknown;
  timestamp?: string;
}

export interface OtpResponse {
  isSuccess: boolean;
  message: string;
}

/**
 * User interface - Đại diện cho thông tin user trong auth state
 * Bao gồm tất cả fields từ UserInfo để hỗ trợ tenant data
 */
export interface User {
  // Basic info
  id: string;
  accountId?: string;
  email: string;
  name?: string | null;
  phone?: string;
  role?: string;
  avatar?: string | null;

  // Status
  isActive?: boolean;
  verified?: boolean;
  isSuspended?: boolean;

  // Bank info
  bankId?: string;
  cardNumber?: string;
  bankName?: string;
  bankLogo?: string;
  isVerifyBank?: boolean;

  // Tax info
  taxNumber?: string | null;
  isVerifyTax?: boolean;

  // Subscription info
  debtStartedAt?: string | null;
  subscriptionExpiryDate?: string | null;
  lastWarningSentAt?: string | null;
  totalDebtAmount?: number;
  planName?: string;

  // Stats
  totalRestaurants?: number;
  totalDishes?: number;
  totalCategories?: number;

  // Timestamps
  createdAt?: string;

  // Fallback cho các field khác từ token
  [key: string]: unknown;
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
  refreshUserInfo: () => Promise<User | null>;
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
  confirmPassword?: string;
  resetToken: string;
}

export interface ResetPasswordResponse {
  resetToken?: string;
  [key: string]: unknown;
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
  openTime?: string;
  closeTime?: string;
}

export interface UpdateRestaurantLocationRequest {
  id: number;
  restaurantName: string;
  address?: string;
  phone?: string;
  description?: string;
  latitude: number;
  longitude: number;
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
  openTime?: string | null;
  closeTime?: string | null;
  profileUrl: string;
  slug: string;
  qrMenu: string;
  isActive: boolean;
  isOpened: boolean;
  isReceivingOrders: boolean;
  totalOrder: number;
  createdAt: string;
  distanceKm: number | null;
  minCashAmount: number;
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
  isSuspended: boolean;
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
  thumbnailUrl?: string;
}

// Blog Type Enum
export enum BlogType {
  Announcement = 1,
  Promotion = 2,
  Update = 3,
  Event = 4,
  Other = 5,
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

export interface BankInfo {
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

export interface DishesDto {
  id: number;
  categoryId?: number;
  categoryName: string;
  dishName: string;
  price: number;
  description: string;
  imageUrl?: string;
  image?: string;
  type?: number;
  isAvailable: boolean;
  createdAt?: string;
}

export interface ComboDto {
  dish: DishesDto;
  quantity: number;
}

export interface MenuDishDto {
  dishId: number;
  dishName: string;
  description: string;
  imageUrl: string;
  price: number;
  isSoldOut: boolean;
  isSelling: boolean;
  discountedPrice: number;
  promotionName: string;
  promotionLabel: string;
  expiredAt: string;
  promoType: number;
  type: number;
  dishAvailabilityStock: number;
  hasPromotion: boolean;
}

export interface MenuCategoryDto {
  categoryId: number;
  categoryName: string;
  dishes: MenuDishDto[];
}

export interface CreateDishRequest {
  dishName: string;
  price: number;
  description: string;
  image?: File;
}

export interface CreateCategoryRequest {
  categoryName: string;
}

export interface CategoryDto {
  id: number;
  tenantId: string;
  categoryName: string;
  isActive: boolean;
  createdAt: string;
}

export interface CreateMenuTemplateRequest {
  templateName: string;
  layoutConfigJson: string;
  themeColor: string;
  fontFamily: string;
  backgroundImageUrl?: File;
}

export interface ApplyMenuTemplateRequest {
  restaurantId: number;
  templateId: number;
}

export interface ConfigurationResponse {
  id: number;
  commissionRate: number;
}

export interface UpdateConfigurationRequest {
  commissionRate: number;
}

export interface StaffDto {
  id: string;
  accountId: string;
  restaurantId: number;
  restaurantName: string;
  name: string;
  phone?: string;
  role: string;
  avatar: string;
  isActive: boolean;
  createdAt: string;
}

export interface BlogListResponse {
  items: SystemBlogDto[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface TenantSummaryDto {
  id: string;
  accountId: string;
  name: string;
  phone: string;
  email?: string;
  taxNumber?: string;
  bankName?: string;
  cardNumber?: string;
  status?: string;
  planName?: string;
  totalRestaurants?: number;
  totalDishes?: number;
  totalCategories?: number;
}

export interface NotificationCreateRequest {
  notifyTitle: string;
  notifySub: string;
  systemBlogUrl: string;
}

export interface NotificationCreatedData {
  id: number;
  notifyTitle: string;
  notifySub: string;
  systemBlogUrl: string | null;
  sentAt: string;
}

export interface NotificationItem {
  notificationId: number;
  notifyTitle: string;
  notifySub: string;
  notifyStatus: number;
  systemBlogUrl: string | null;
  sentAt: string;
  notifyTenants: unknown[];
  isDeleted: boolean;
  createdAt: string;
  id: number;
  updatedAt: string | null;
}

export interface NotificationListResponse {
  items: NotificationItem[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface NotifyTenantItem {
  id: number;
  notificationId: number;
  tenantId: string;
  notifyTenantStatus: number;
  readAt: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface NotifyTenantDetailItem {
  notificationId: number;
  notifyTitle: string;
  notifySub: string;
  systemBlogUrl: string | null;
  status: number;
  sentAt: string;
  readAt: string | null;
}

export interface NotifyTenantDetailListResponse {
  items: NotifyTenantDetailItem[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface NotifyTenantUpdateReadRequest {
  notificationIds: number[];
  readAt: string;
  status: number;
}

export interface NotifyTenantCreateRequest {
  notificationId: number;
  tenantIds: string[];
}

export type PlanApiItem = {
  id: number;
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  durationInDays?: number;
  dailyRateMonth: number;
  dailyRateYear: number;
  level: number;
  status: string;
  features: {
    canUseAIUpsell: boolean;
    canRecommendationOnTop: boolean;
    canUsePromotions: boolean;
    canCustomMenuTemplate: boolean;
  };
};

export type PlanUpsertRequest = {
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  durationInDays: number;
  level: number;
  features: {
    canUseAIUpsell: boolean;
    canRecommendationOnTop: boolean;
    canUsePromotions: boolean;
    canCustomMenuTemplate: boolean;
  };
};

export type SubscriptionTenantInfo = {
  restaurantId: number;
  restaurantName: string;
  address: string;
  isActive: boolean;
  currentSubscriptionId: number;
  currentPlanId: number;
  currentPlanName: string;
  startDate: string;
  endDate: string;
  status: string;
};

export type PreviewSubscriptionResponse = {
  totalAmountToPay: number;
  details: [
    {
      restaurantId: number;
      restaurantName: string;
      actionType: number;
      targetPlanName: string;
      cycle: number;
      quantity: number;
      basePrice: number;
      balanceConverted: number;
      amountToPay: number;
      message: string;
    },
  ];
};

export enum PromotionType {
  Standard = 0,
  HappyHour = 1,
  Clearance = 2,
  WeeklySpecial = 3,
}

export enum PromotionScope {
  Dish = 0,
  Order = 1,
}

export enum DiscountType {
  Percentage = 0,
  FixedAmount = 1,
}

export enum PromotionDaysOfWeek {
  None = 0,
  Sunday = 1 << 0, // 1
  Monday = 1 << 1, // 2
  Tuesday = 1 << 2, // 4
  Wednesday = 1 << 3, // 8
  Thursday = 1 << 4, // 16
  Friday = 1 << 5, // 32
  Saturday = 1 << 6, // 64

  Weekdays = Monday | Tuesday | Wednesday | Thursday | Friday, // 62
  Weekend = Saturday | Sunday, // 65
  All = 127,
}

export const PROMOTION_PRIORITY_DEFAULTS: Record<PromotionType, number> = {
  [PromotionType.Standard]: 10,
  [PromotionType.HappyHour]: 80,
  [PromotionType.Clearance]: 100,
  [PromotionType.WeeklySpecial]: 50,
};

export type PromotionUpsertPayload = {
  id?: number;
  isActive?: boolean;
  name: string;
  type: number;
  discountType: number;
  discountValue: number;
  maxDiscountValue: number;
  minOrderValue: number;
  startDate: string | null;
  endDate: string | null;
  dailyStartTime: string | null;
  dailyEndTime: string | null;
  daysOfWeek: number;
  isGlobal: boolean;
  priority: number;
  scope: number;
  dishIds: number[] | null;
  restaurantIds: number[] | null;
};

export type PromotionDto = {
  id?: number;
  isActive: boolean;
  name: string;
  type: number;
  discountType: number;
  discountValue: number;
  maxDiscountValue: number;
  minOrderValue: number;
  startDate: string;
  endDate: string;
  dailyStartTime: string | null;
  dailyEndTime: string | null;
  daysOfWeek: number;
  isGlobal: boolean;
  priority: number;
  scope: number;
  dishIds: number[] | null;
  restaurantIds: number[] | null;
};

export type PromotionResponse = {
  isSuccess: boolean;
  message: string;
  data: {
    items: PromotionDto[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
  errors?: null;
  timestamp: string;
};

// ===== Admin Dashboard Types =====

export interface AdminSummaryMetrics {
  totalTenants: number;
  totalRestaurants: number;
  platformRevenue: number;
  activeAccounts: number;
}

export interface RevenueTrendItem {
  month: string;
  revenue: number;
}

export interface PlanDistributionItem {
  planName: string;
  percentage: number;
  count: number;
}

export interface TopPerformingRestaurant {
  restaurantId: number;
  restaurantName: string;
  currentPlan: string;
  totalOrders: number;
  totalRevenue: number;
  avatarUrl: string;
}

export interface ExpiringSubscription {
  restaurantId: number;
  restaurantName: string;
  planName: string;
  daysRemaining: number;
  expirationDate: string;
}

// ===== Tenant Dashboard Types =====

export interface TenantRestaurantRevenue {
  restaurantId: number;
  restaurantName: string;
  image?: string | null;
  address?: string | null;
  currentPlan?: string | null;
  isActive: boolean;
  totalOrders: number;
  grossRevenue: number;
  netRevenue: number;
  totalDiscount: number;
  averageOrderValue: number;
}

export interface TenantDashboardRevenue {
  tenantId: string;
  tenantName: string;
  isAllTime: boolean;
  filterPreset: string;
  startDate?: string | null;
  endDate?: string | null;
  totalRestaurants: number;
  totalOrders: number;
  grossRevenue: number;
  netRevenue: number;
  totalDiscount: number;
  averageOrderValue: number;
  restaurants: TenantRestaurantRevenue[];
}

// ===== Revenue Summary Types =====

export interface RevenuePeriod {
  startDate: string;
  endDate: string;
}

export interface RevenueSummaryMetrics {
  grossRevenue: number;
  netRevenue: number;
  totalDiscount: number;
  totalRefund: number;
  totalOrders: number;
  averageOrderValue: number;
}

export interface PaymentMethodStats {
  cash: number;
  transfer: number;
}

export interface OrderTypeDetail {
  revenue: number;
  count: number;
  objective?: OrderTypeDetail;
  staffError?: OrderTypeDetail;
  systemError?: OrderTypeDetail;
}

export interface OrderTypeStats {
  regular: OrderTypeDetail;
  refund: OrderTypeDetail;
}

export interface TopSellingDish {
  dishId: number;
  dishName: string;
  quantitySold: number;
  revenue: number;
}

export interface RevenueSummaryData {
  period: RevenuePeriod;
  summary: RevenueSummaryMetrics;
  paymentMethods: PaymentMethodStats;
  orderTypes: OrderTypeStats;
  topSellingDishes: TopSellingDish[];
}

export interface RevenueSummaryResponse extends ApiResponse<RevenueSummaryData> {}

// ===== Admin Drill-Down Dashboard Types =====

/** Cấp 1 – Top Tenants */
export interface TopTenantItem {
  tenantId: string;
  tenantName: string;
  totalRestaurants: number;
  totalOrders: number;
  totalRevenue: number;
}

/** Cấp 2 – Tenant Detail: một nhà hàng */
export interface TenantDetailRestaurant {
  restaurantId: number;
  restaurantName: string;
  image?: string | null;
  address?: string | null;
  currentPlan?: string | null;
  isActive: boolean;
  totalOrders: number;
  grossRevenue: number;
  netRevenue: number;
  totalDiscount: number;
}

/** Cấp 2 – Tenant Detail: toàn bộ response */
export interface TenantDetailData {
  tenantId: string;
  tenantName: string;
  isSuspended: boolean;
  period: { startDate: string; endDate: string };
  restaurants: TenantDetailRestaurant[];
}

export interface ShiftReportDto {
  id: number;
  shiftId: number;
  reportDate: string;
  totalCashOrder: number;
  totalTransferOrder: number;
  totalRefundAmount: number;
  expectedCashAmount: number;
  actualCashAmount: number;
  difference: number;
  expectedTotalAmount: number;
  note: string;
  cashierName: string;
}

export interface ShiftReportPagedResponse {
  items: ShiftReportDto[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface TenantOrderDetailDto {
  dishId: number;
  dishName: string;
  quantity: number;
  subTotal: number;
  originalPrice: number;
  discountedPrice: number;
  promotionAmount: number;
  refundedQuantity: number;
}

export interface TenantOrderResponseDto {
  id: string;
  orderCode: number;
  numberPhone: string;
  totalAmount: number;
  promotionDiscount: number;
  finalAmount: number;
  status: number; // OrderStatus
  isPreOrder: boolean;
  requestedPickupAt?: string;
  confirmedPickupAt?: string;
  note?: string;
  type: string;
  paymentProofUrl?: string;
  typeOrder: number; // TypeOrder
  refundType?: number;
  refundOrderId?: string;
  originalOrderCode?: number;
  responsibleStaffName?: string;
  createdAt: string;
  orderDetails: TenantOrderDetailDto[];
}

export interface PagedTenantOrderResponseDto {
  items: TenantOrderResponseDto[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface PaymentTransactionHistory {
  isSuccess: boolean;
  message: string;
  data: TransactionData[];
  errors: unknown[] | null;
  timestamp: string;
}

export interface TransactionData {
  id: number;
  transactionCode: string;
  totalAmount: number;
  paymentDate: string;
  status: "Success" | "Pending" | "Canceled";
  paymentTransactionType: "Subscription" | "CommissionFee";
  subscriptionDetails: SubscriptionDetail[] | null;
  commissionDetails: CommissionDetail | null;
}

export interface SubscriptionDetail {
  restaurantId: number;
  restaurantName: string;
  actionType: "BuyNew" | "Upgrade" | "Renew" | "Downgrade";
  oldPlanId: number | null;
  oldPlanName: string | null;
  newPlanId: number;
  newPlanName: "Pro" | "Basic" | string;
  cycle: "Monthly" | "Yearly" | string;
  quantity: number;
  amountAllocated: number;
  balanceConverted: number;
  descriptionMessage: string;
}

export interface CommissionDetail {
  periodStart: string;
  periodEnd: string;
  totalOrdersScanned: number;
  totalOrderAmount: number;
  commissionRate: number;
}

export interface RevenueResponse {
  isSuccess: boolean;
  message: string;
  data: {
    month: string;
    revenue: number;
  }[];
  errors: null;
  timestamp: string;
}

export interface SubscriptionRevenueByPlan {
  isSuccess: boolean;
  message: string;
  data: {
    planId: number;
    planName: string;
    revenue: number;
    percentage: number;
  }[];
  errors: null;
  timestamp: string;
}
