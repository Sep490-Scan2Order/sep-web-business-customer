export const API = {
    BASE_URL:
        process.env.NEXT_PUBLIC_API_BASE_URL,
    PLAN: {
        GETALL: "/plan",
        GET_BY_ID: (id: number) => `/plan/${id}`,
        CREATE: "/plan",
        UPDATE: (id: number) => `/plan/${id}`,
    },
    
    OTP: {
        SEND_REGISTER: "/Otp/send-register",
    },
    TENANT: {
        REGISTER: "/Tenant/register",
        GET_ALL: "/Tenant/getAll",
        BLOCK_TENANT: (id: string) => `/Tenant/${id}/block`,
        TAX_VALIDATION: "/Tenant/tax-validation?taxCode=",
        VERIFY_OTP_FORGET_PASSWORD: "/Auth/Verify-forgot-password-otp",
        COMPLETE_FORGET_PASSWORD: "/Auth/Complete-reset-password",
        SEND_EMAIL_FORGET_PASSWORD: (email: string) => `/Otp/send-forgot-password?email=${email}`,
        SEARCH_BANK_NAME_BY_CARD_NUMBER: "/Tenant/bank-lookup",
        UPDATE_BANK_INFO: "/Tenant/update-bank-info?bankId=",
        GET_TENANT_BY_ID: (id: string) => `/Tenant/${id}`,
        DASHBOARD_REVENUE: "/Tenant/dashboard/revenue",
        IS_SUSPENDED: (tenantId: string, isSuspended: boolean) => `/Tenant/IsSuspened?tenantId=${tenantId}&isSuspended=${isSuspended}`,
    },

    STAFF:{
        CREATE: "/Staff/create-staff",
        GET_ALL: "/Staff/get-all",
    },
    AUTH: {
        TENANT_LOGIN: "/Auth/tenant-login",
        ADMINISTRATOR_LOGIN: "/Auth/administrator-login",
    },
    RESTAURANT: {
        CREATE: "/Restaurant",
        GET_ALL_RESTAURANT_BY_TENANT_ID: "/Restaurant/get-all-restaurant-by-tenant",
        GET_BY_ID: (id: string) => `/Restaurant/${id}`,
        UPDATE: (id: string) => `/Restaurant/${id}`,
        DELETE: (id: string) => `/Restaurant/${id}`,
        GET_RESTAURANT_DETAIL_BY_SLUG: (slug: string) => `/Restaurant/${slug}`,
        GET_MENU: (restaurantId: number) => `/Restaurant/${restaurantId}/menu`,
        GET_MENU_ALL: (restaurantId: number) => `/Restaurant/${restaurantId}/menu-all`,
        CONFIG_MIN_CASH_AMOUNT: (restaurantId: number, minCashAmount: number) => `/Restaurant/config-min-cash-amount?restaurantId=${restaurantId}&minCashAmount=${minCashAmount}`,
        REVENUE_SUMMARY: (id: number, startDate?: string, endDate?: string) => {
            let url = `/Restaurant/${id}/revenue-summary`;
            if (startDate && endDate) {
                url += `?startDate=${startDate}&endDate=${endDate}`;
            }
            return url;
        },
    },
    BLOG: {
        CREATE: "/SystemBlog",
        GET_ALL: (pageIndex: number = 1, pageSize: number = 7, blogType?: number) => {
            let url = `/SystemBlog?pageIndex=${pageIndex}&pageSize=${pageSize}`;
            if (blogType !== undefined) {
                url += `&blogType=${blogType}`;
            }
            return url;
        },
        GET_BY_ID: (id: number) => `/SystemBlog/${id}`,
    },
    CATEGORY:{
        CREATE: "/Category/create-category",
        GET_ALL: "/Category/get-category-by-tenant",
        UPDATE_CATEGORY: (id: number) => `/Category/update-category/${id}`,
        GET_ALL_BY_TENANT_ID: (tenantId: string) => `/Category/get-category-by-tenantId/${tenantId}`,
        DELETE_CATEGORY: (id: number) => `/Category/delete-category/${id}`,
    },
    DISHES:{
        CREATE: (categoryId: number) => `/Dish/create-dish/${categoryId}`,
        GET_ALL: "/Dish/get-dishes-by-tenant",
        UPDATE_DISH: (categoryId: number, dishId: number) => `/Dish/update-dish/${categoryId}/${dishId}`,
        UPDATE_DISH_AVALABILITY: (dishId: number) => `/Dish/update-dish-availability/${dishId}`,
        GET_ALL_BY_TENANT_ID: (tenantId: string) => `/Dish/get-dish-by-tenantId/${tenantId}`,
        CREATE_COMBO: (categoryId: number) => `/Dish/create-combo/${categoryId}`,
        GET_DETAIL_COMBO: (dishID: number) => `/Dish/get-combo-by-id/${dishID}`,
        IMPORT_DISHES: "/Dish/import-dishes",
        DELETE_DISH: (categoryId: number, dishId: number) => `/Dish/delete-dish/${categoryId}/${dishId}`,
    },
    MENU_TEMPLATE: {
        CREATE: "/MenuTemplate",
        GET_ALL: "/MenuTemplate",
        GET_BY_RESTAURANT: (restaurantId: number) => `/MenuTemplate/restaurant/${restaurantId}`,
        GET_BY_ID: (id: number) => `/MenuTemplate/${id}`,
        UPDATE: (id: number) => `/MenuTemplate/${id}`,
        GENERATE_HOLIDAY_AI: "/MenuTemplate/generate-holiday-ai",
    },
    MENU_RESTAURANT: {
        APPLY_TEMPLATE: `/MenuRestaurant`,
        GET_MENU_BY_RESTAURANT_ID: (restaurantId: number) => `/MenuRestaurant/${restaurantId}`,
    },
    SUBSCRIPTION:{
        PREVIEW: "/subscription/preview",
        CREATE_PAYMENT: "/subscription/create-payment",
        GET_SUBSCRIPTION_BY_TENANT: "/subscription/get-by-tenant",
        GET_SUBSCRIPTION_PAYMENT_STATUS: (orderCode: number) => `/subscription/payment-status/${orderCode}`,
        CANCEL_PAYMENT: (orderCode: number) => `/subscription/cancel-payment/${orderCode}`,
        CREATE_COMMISSION_FEE_PAYMENT: "/subscription/create-commission-fee-payment",
    },
    EMAIL:{
        SEND: "/Email/send",
        GUEST_SEND: "/Email/guest-send/id-domain"
    },
    NOTIFICATION:{
        POST: "/Notification",
        GET_ALL: (pageIndex: number = 1, pageSize: number = 7) => `/Notification?pageIndex=${pageIndex}&pageSize=${pageSize}`
    },
    NOTIFY_TENANT:{
        POST: "/NotifyTenant",
        GET_ALL: "/NotifyTenant",
        COUNT_BY_TENANT_ID: (tenantId: string, notifyTenantStatus: number) => `/NotifyTenant/count/${tenantId}?notifyTenantStatus=${notifyTenantStatus}`,
        UPDATE_READ_BY_TENANT_ID: `/NotifyTenant/update-read-by-tenant`,
        DETAILS: (pageIndex: number = 1, pageSize: number = 5) => `/NotifyTenant/details?pageIndex=${pageIndex}&pageSize=${pageSize}`,
    },
    CONFIGURATION: {
        GET_ALL: "/Configuration",
        UPDATE: (id: number) => `/Configuration/${id}`,
    },
    PROMOTION:{
        GET_BY_TENANT: (pageNumber: number = 1, pageSize: number = 10) =>
            `/Promotion/tenant-logged-in?pageNumber=${pageNumber}&pageSize=${pageSize}`,
        CREATE: "/Promotion",
        UPDATE: "/Promotion",
        DELETE: (id: number) => `/Promotion/${id}`,
    },
    ADMIN: {
        SUMMARY_METRICS: "/Admin/summary-metrics",
        REVENUE_TRENDS: (months: number = 6) => `/Admin/revenue-trends?months=${months}`,
        PLAN_DISTRIBUTION: "/Admin/plan-distribution",
        TOP_PERFORMING_RESTAURANTS: (top: number = 5) => `/Admin/top-performing-restaurants?top=${top}`,
        EXPIRING_SUBSCRIPTIONS: (daysThreshold: number = 30) => `/Admin/expiring-subscriptions?daysThreshold=${daysThreshold}`,
        TOP_TENANTS: (top: number = 10) => `/Admin/top-tenants?top=${top}`,
        TEST_CRONJOBS: "/Admin/test-cronjobs",
        TENANT_DETAIL: (tenantId: string, startDate?: string, endDate?: string) => {
            let url = `/Admin/tenants/${tenantId}/detail`;
            const params: string[] = [];
            if (startDate) params.push(`startDate=${startDate}`);
            if (endDate) params.push(`endDate=${endDate}`);
            if (params.length) url += `?${params.join("&")}`;
            return url;
        },
    },
    BRANCH_DISH_CONFIG: {
        UPDATE_IS_SELLING: (restaurantId: number, dishId: number, isSelling: boolean) => `/BranchDishConfig/update-is-selling/${restaurantId}/${dishId}?isSelling=${isSelling}`,
        SYNC_DISHES_TO_BRANCH: "/BranchDishConfig/sync-dishes-to-branches",
    },
    SHIFT: {
        GET_REPORTS: (restaurantId: number, pageIndex: number = 1, pageSize: number = 10, from?: string, to?: string) => {
            let url = `/Shift/reports?restaurantId=${restaurantId}&pageIndex=${pageIndex}&pageSize=${pageSize}`;
            if (from) url += `&from=${from}`;
            if (to) url += `&to=${to}`;
            return url;
        },
        GET_REPORT_BY_ID: (shiftId: number) => `/Shift/${shiftId}/report`,
    },
    ORDER: {
        GET_TENANT_ORDERS: (
            restaurantId: number, 
            pageIndex: number = 1, 
            pageSize: number = 10, 
            keyword?: string, 
            status?: number, 
            fromDate?: string, 
            toDate?: string,
            typeOrder?: number,
            refundType?: number
        ) => {
            let url = `/Order/tenant/restaurant/${restaurantId}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
            if (keyword) url += `&keyword=${encodeURIComponent(keyword)}`;
            if (status !== undefined && status !== null) url += `&status=${status}`;
            if (fromDate) url += `&fromDate=${fromDate}`;
            if (toDate) url += `&toDate=${toDate}`;
            if (typeOrder !== undefined) url += `&typeOrder=${typeOrder}`;
            if (refundType !== undefined) url += `&refundType=${refundType}`;
            return url;
        }
    }
};

export const BANK_API = {
    GET_ALL: "https://api.banklookup.net/bank/list"
};