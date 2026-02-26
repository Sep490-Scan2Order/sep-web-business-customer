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
        SEND_EMAIL_FORGET_PASSWORD: (email: string) => `/Otp/send-forgot-password?email=${email}`,
        VERIFY_OTP_FORGET_PASSWORD: "/Auth/Verify-forgot-password-otp",
        COMPLETE_FORGET_PASSWORD: "/Auth/Complete-reset-password",
    },
    AUTH: {
        LOGOUT: "/Auth/logout",
        TENANT_LOGIN: "/Auth/tenant-login",
    },
    RESTAURANT: {
        CREATE: "/Restaurant",
        GET_ALL: "/Restaurant/getAll",
        GET_BY_ID: (id: string) => `/Restaurant/${id}`,
        UPDATE: (id: string) => `/Restaurant/${id}`,
        DELETE: (id: string) => `/Restaurant/${id}`,
    }
};