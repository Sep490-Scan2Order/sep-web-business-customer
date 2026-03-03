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
    },
    TENANT_WALLET: {
        DEPOSIT_VERIFY_TAX: "/TenantWallet/deposit-verify-tax",
    },
    AUTH: {
        LOGOUT: "/Auth/logout",
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
        GET_ALL: "/SystemBlog",
        GET_BY_ID: (id: number) => `/SystemBlog/${id}`,
    },
    CATEGORY:{
        CREATE: "/Category/create-category",
        GET_ALL: "/Category/get-category-by-tenant"
    },
    DISHES:{
        CREATE: (categoryId: number) => `/Dish/create-dish/${categoryId}`,
        GET_ALL: "/Dish/get-dishes-by-tenant"
    },
    MENU_TEMPLATE: {
        CREATE: "/MenuTemplate",
        GET_ALL: "/MenuTemplate",
        GET_BY_ID: (id: number) => `/MenuTemplate/${id}`,
    },
    MENU_RESTAURANT: {
        APPLY_TEMPLATE: `/MenuRestaurant`,
        GET_MENU_BY_RESTAURANT_ID: (restaurantId: number) => `/MenuRestaurant/${restaurantId}`,
    }
};

export const BANK_API = {
    GET_ALL: "https://api.banklookup.net/bank/list"
};