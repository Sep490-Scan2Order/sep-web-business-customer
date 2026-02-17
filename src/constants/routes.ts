export const ROUTES = {
  HOME: "/",
  PAGES: {
    ROOT: "/pages",

    PUBLIC:{
      LOGIN: "/pages/public/login",
      REGISTER: "/pages/public/register",
      PLAN:"/pages/public/plan",
      ABOUT_US: "/pages/public/about-us",
      FEATURES: "/pages/public/features",     
    },

    PRIVATE:{
    },

  }
};

// Admin routes
export const ADMIN_ROUTES = {
  DASHBOARD: "/admin/dashboard",
  DESTINATION_MANAGE: "/admin/dashboard/destination-manage",
  LOCATION_MANAGE: "/admin/dashboard/destination-manage/location-manage",
  USER_MANAGE: "/admin/dashboard/user-manage",
  REPORT: "/admin/dashboard/report",
};

// Tenant routes
export const TENANT_ROUTES = {
  ROOT: "/tenant",
  DASHBOARD: "/tenant/dashboard",
  USERS: "/tenant/users",
  RESTAURANT: "/tenant/restaurant",
  MEALS: "/tenant/meals",
  MENU_TEMPLATE: "/tenant/menu-template",
};