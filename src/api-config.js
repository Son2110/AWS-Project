const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL,

  ENDPOINTS: {
    // Auth endpoints
    LOGIN: "/auth/login",
    LOGOUT: "/auth/logout",
    SIGNUP: "/auth/signup",
    VERIFY_SIGNUP: "/auth/verify",
    RESEND_CODE: "/auth/resend-code",
    FORGOT_PASSWORD: "/auth/forgot-password",
    CONFIRM_FORGOT_PASSWORD: "/auth/confirm-forgot-password",
    CHANGE_TEMPORARY_PASSWORD: "/auth/change-temporary-password",

    // Admin endpoints
    CREATE_OFFICE_WITH_MANAGER: "/admin/office-with-manager",
    LIST_OFFICE_AND_MANAGER: "/admin/list-office-and-manager",
    OFFICE_DETAIL: "/admin/office-detail",
    UPDATE_OFFICE_AND_MANAGER: "/admin/update-office-and-manager",
    DELETE_OFFICE_AND_MANAGER: "/admin/delete-office-and-manager",

    // User endpoints
    PROFILE_UPDATE: "/users/profile",

    // Room endpoints
    ROOMS: "/manager/list-room",
    ROOM_CONFIG: "/manager/config-room",
    SENSOR_DATA: "/manager/sensor-data",
    CREATE_ROOM_CONFIG: "/manager/create-room-config",

    // Logs endpoint
    LOGS: "/logs",
  },
};

export default API_CONFIG;
