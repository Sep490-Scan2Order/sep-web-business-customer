export const API = {
    BASE_URL:
        process.env.NEXT_PUBLIC_API_BASE_URL || "https://localhost:7102/api",
    PLAN: {
        GETALL: "/plan",
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
    },
    TENANT_WALLET: {
        DEPOSIT_VERIFY_TAX: "/TenantWallet/deposit-verify-tax",
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
    },
    DISHES:{
        CREATE: (categoryId: number) => `/Dish/create-dish/${categoryId}`,
        GET_ALL: "/Dish/get-dishes-by-tenant",
        UPDATE_DISH: (categoryId: number, dishId: number) => `/Dish/update-dish/${categoryId}/${dishId}`,
        UPDATE_DISH_AVALABILITY: (dishId: number) => `/Dish/update-dish-availability/${dishId}`,
        GET_ALL_BY_TENANT_ID: (tenantId: string) => `/Dish/get-dish-by-tenantId/${tenantId}`,
    },
    MENU_TEMPLATE: {
        CREATE: "/MenuTemplate",
        GET_ALL: "/MenuTemplate",
        GET_BY_ID: (id: number) => `/MenuTemplate/${id}`,
    },
    MENU_RESTAURANT: {
        APPLY_TEMPLATE: `/MenuRestaurant`,
        GET_MENU_BY_RESTAURANT_ID: (restaurantId: number) => `/MenuRestaurant/${restaurantId}`,
    },
    SUBSCRIPTION:{
        BUY_FIRST_SUBSCRIPTION: (planId: number) => `/Subscription?planId=${planId}`,
        BUY_UPGRADE_SUBSCRIPTION: (planId: number) => `/Subscription/upgrade-plan/${planId}`,
        RENEW_SUBSCRIPTION: "/Subscription/renew-subscription",
    }
};

export const BANK_API = {
    GET_ALL: "https://api.banklookup.net/bank/list"
};