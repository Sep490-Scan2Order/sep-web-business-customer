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
    }
};