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
      MY_TRIPS: "/pages/private/my-trips",
      GROUP_TRIPS: "/pages/private/group-trips",
      TRIP_PLANNER: "/pages/private/trip-planner",
      ITINERARY_RESULT: "/pages/private/itinerary-result",
      PROFILE_PAGE: "/pages/private/profile-page",
      ITINERARY_DETAIL: "/pages/private/my-trips/itinerary-details",
      ITINERARY_SHARE: "/pages/private/share-itinerary",
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