import { describe, expect, it } from "vitest";
import { API, BANK_API } from "@/src/constants/api";

describe("API constants", () => {
  it("exposes static endpoint strings", () => {
    expect(API.TENANT.REGISTER).toBe("/Tenant/register");
    expect(API.AUTH.TENANT_LOGIN).toBe("/Auth/tenant-login");
    expect(API.NOTIFICATION.POST).toBe("/Notification");
    expect(BANK_API.GET_ALL).toBe("https://api.banklookup.net/bank/list");
  });

  it("builds tenant, restaurant, and category dynamic endpoints", () => {
    expect(API.TENANT.BLOCK_TENANT("abc")).toBe("/Tenant/abc/block");
    expect(API.TENANT.GET_TENANT_BY_ID("tenant-1")).toBe("/Tenant/tenant-1");
    expect(API.RESTAURANT.UPDATE("12")).toBe("/Restaurant/12");
    expect(API.RESTAURANT.GET_MENU(9)).toBe("/Restaurant/9/menu");
    expect(API.CATEGORY.UPDATE_CATEGORY(2)).toBe("/Category/update-category/2");
    expect(API.DISHES.UPDATE_DISH(5, 10)).toBe("/Dish/update-dish/5/10");
  });

  it("builds URL with optional query params correctly", () => {
    expect(API.BLOG.GET_ALL()).toBe("/SystemBlog?pageIndex=1&pageSize=7");
    expect(API.BLOG.GET_ALL(2, 20, 1)).toBe("/SystemBlog?pageIndex=2&pageSize=20&blogType=1");

    expect(API.RESTAURANT.REVENUE_SUMMARY(8)).toBe("/Restaurant/8/revenue-summary");
    expect(API.RESTAURANT.REVENUE_SUMMARY(8, "2026-01-01", "2026-01-31")).toBe(
      "/Restaurant/8/revenue-summary?startDate=2026-01-01&endDate=2026-01-31",
    );

    expect(API.ADMIN.TENANT_DETAIL("tenant-1")).toBe("/Admin/tenants/tenant-1/detail");
    expect(API.ADMIN.TENANT_DETAIL("tenant-1", "2026-01-01")).toBe(
      "/Admin/tenants/tenant-1/detail?startDate=2026-01-01",
    );
    expect(API.ADMIN.TENANT_DETAIL("tenant-1", "2026-01-01", "2026-01-31")).toBe(
      "/Admin/tenants/tenant-1/detail?startDate=2026-01-01&endDate=2026-01-31",
    );
  });

  it("builds notification, shift, and order URLs with filters", () => {
    expect(API.NOTIFICATION.GET_ALL(3, 15)).toBe("/Notification?pageIndex=3&pageSize=15");
    expect(API.NOTIFY_TENANT.COUNT_BY_TENANT_ID("tenant-2", 1)).toBe(
      "/NotifyTenant/count/tenant-2?notifyTenantStatus=1",
    );
    expect(API.NOTIFY_TENANT.DETAILS(4, 12)).toBe("/NotifyTenant/details?pageIndex=4&pageSize=12");

    expect(API.SHIFT.GET_REPORTS(1)).toBe(
      "/Shift/reports?restaurantId=1&pageIndex=1&pageSize=10",
    );
    expect(API.SHIFT.GET_REPORTS(1, 2, 30, "2026-01-01", "2026-01-31")).toBe(
      "/Shift/reports?restaurantId=1&pageIndex=2&pageSize=30&from=2026-01-01&to=2026-01-31",
    );

    expect(API.ORDER.GET_TENANT_ORDERS(5, 1, 10, "pho bo", 2, "2026-01-01", "2026-01-31")).toBe(
      "/Order/tenant/restaurant/5?pageIndex=1&pageSize=10&keyword=pho%20bo&status=2&fromDate=2026-01-01&toDate=2026-01-31",
    );
  });

  it("builds additional auth, staff, and subscription endpoints", () => {
    expect(API.AUTH.ADMINISTRATOR_LOGIN).toBe("/Auth/administrator-login");
    expect(API.STAFF.CREATE).toBe("/Staff/create-staff");
    expect(API.STAFF.GET_ALL).toBe("/Staff/get-all");

    expect(API.SUBSCRIPTION.GET_SUBSCRIPTION_BY_TENANT).toBe("/subscription/get-by-tenant");
    expect(API.SUBSCRIPTION.GET_SUBSCRIPTION_PAYMENT_STATUS(12345)).toBe(
      "/subscription/payment-status/12345",
    );
    expect(API.SUBSCRIPTION.CANCEL_PAYMENT(12345)).toBe("/subscription/cancel-payment/12345");
  });

  it("builds additional dish and menu endpoints", () => {
    expect(API.DISHES.CREATE(4)).toBe("/Dish/create-dish/4");
    expect(API.DISHES.DELETE_DISH(4, 11)).toBe("/Dish/delete-dish/4/11");
    expect(API.DISHES.GET_DETAIL_COMBO(99)).toBe("/Dish/get-combo-by-id/99");

    expect(API.MENU_TEMPLATE.GET_BY_ID(5)).toBe("/MenuTemplate/5");
    expect(API.MENU_RESTAURANT.GET_MENU_BY_RESTAURANT_ID(8)).toBe("/MenuRestaurant/8");
    expect(API.BRANCH_DISH_CONFIG.UPDATE_IS_SELLING(1, 2, true)).toBe(
      "/BranchDishConfig/update-is-selling/1/2?isSelling=true",
    );
  });

  it("builds additional admin and tenant helper endpoints", () => {
    expect(API.ADMIN.REVENUE_TRENDS(12)).toBe("/Admin/revenue-trends?months=12");
    expect(API.ADMIN.TOP_PERFORMING_RESTAURANTS(7)).toBe(
      "/Admin/top-performing-restaurants?top=7",
    );
    expect(API.ADMIN.EXPIRING_SUBSCRIPTIONS(45)).toBe(
      "/Admin/expiring-subscriptions?daysThreshold=45",
    );

    expect(API.TENANT.SEND_EMAIL_FORGET_PASSWORD("a@b.com")).toBe(
      "/Otp/send-forgot-password?email=a@b.com",
    );
    expect(API.TENANT.UPDATE_BANK_INFO).toBe("/Tenant/update-bank-info?bankId=");
    expect(API.RESTAURANT.CONFIG_MIN_CASH_AMOUNT(10, 50000)).toBe(
      "/Restaurant/config-min-cash-amount?restaurantId=10&minCashAmount=50000",
    );
  });
});
