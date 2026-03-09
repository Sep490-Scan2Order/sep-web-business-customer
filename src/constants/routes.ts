export const ROUTES = {
  HOME: "/",
  PAGES: {
    ROOT: "/pages",

    PUBLIC:{
      LOGIN: "/pages/public/login",
      ADMIN_LOGIN: "/admin-login",
      REGISTER: "/pages/public/register",
      FORGOT_PASSWORD: "/pages/public/forgot-password",
      PLAN:"/pages/public/plan",
      ABOUT_US: "/pages/public/about-us",
      FEATURES: "/pages/public/features",   
      BLOGS: "/pages/public/blogs",  
    },

    PRIVATE:{
      
    },

  }
};

// Admin routes
export const ADMIN_ROUTES = {
  ROOT: "/admin",
  // Dashboards
  OVERVIEW: "/admin/overview",
  BUSINESS_INSIGHT: "/admin/business-insight",
  // Management
  USER_MANAGEMENT: "/admin/user-management",
  TENANT_MANAGEMENT: "/admin/tenant-management",
  RESTAURANT_MANAGEMENT: "/admin/restaurant-management",
  BILLING_SUBSCRIPTIONS: "/admin/billing-subscriptions",
  TEMPLATE_MANAGEMENT: "/admin/template-management",
  // Settings
  AI_SETTINGS: "/admin/ai-settings",
  GLOBAL_SETTINGS: "/admin/global-settings",
};

// Tenant routes
export const TENANT_ROUTES = {
  ROOT: "/tenant",
  DASHBOARD: "/tenant/dashboard",
  USERS: "/tenant/users",
  RESTAURANT: "/tenant/restaurant",
  MEALS: "/tenant/meals",
  MENU_TEMPLATE: "/tenant/menu-template",
  SETTINGS: "/tenant/tenant-setting",
  CATEGORY: "/tenant/meals/category",
  DISH: "/tenant/meals/dish",
  PLAN: "/tenant/plan",
};
