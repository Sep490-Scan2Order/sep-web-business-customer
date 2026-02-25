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
    },
    TENANT_WALLET: {
        DEPOSIT_VERIFY_TAX: "/TenantWallet/deposit-verify-tax",
        SEND_EMAIL_FORGET_PASSWORD: (email: string) => `/Otp/send-forgot-password?email=${email}`,
        VERIFY_OTP_FORGET_PASSWORD: "/Auth/Verify-forgot-password-otp",
        COMPLETE_FORGET_PASSWORD: "/Auth/Complete-reset-password",
    },
    AUTH: {
        LOGOUT: "/Auth/logout",
        TENANT_LOGIN: "/Auth/tenant-login",
    }
};